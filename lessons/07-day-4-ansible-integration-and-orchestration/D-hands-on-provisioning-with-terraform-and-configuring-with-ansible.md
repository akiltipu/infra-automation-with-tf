---
title: "Hands-On Lab: Provisioning with Terraform & Configuring with Ansible"
description: "End-to-end hands-on lab: Provision an AWS EC2 web infrastructure stack using Terraform, then configure Nginx, system hardening, and a web app using Ansible."
keywords:
  - Hands-on Lab
  - Terraform and Ansible Lab
  - Nginx Configuration
  - UFW Firewall
  - End-to-End Orchestration
---

# Hands-On Lab: Provisioning with Terraform & Configuring with Ansible

In this hands-on lab, we will provision a complete cloud infrastructure stack on AWS with **Terraform**, then immediately configure the operating system, firewall, and an **Nginx Web Server** with **Ansible**.

---

## 1. Step 1: The Terraform Infrastructure Layer

Create a project directory `terraform-ansible-lab/` with `main.tf`:

```hcl
# main.tf

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# 1. Generate an SSH Key Pair dynamically
resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "generated_key" {
  key_name   = "ansible-lab-key"
  public_key = tls_private_key.ssh_key.public_key_openssh
}

resource "local_file" "private_key" {
  content         = tls_private_key.ssh_key.private_key_pem
  filename        = "${path.module}/ansible/id_rsa"
  file_permission = "0400" # Strict read-only permissions for SSH
}

# 2. Network & Security Group
resource "aws_vpc" "lab_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "ansible-lab-vpc" }
}

resource "aws_subnet" "lab_subnet" {
  vpc_id                  = aws_vpc.lab_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"
}

resource "aws_internet_gateway" "lab_gw" {
  vpc_id = aws_vpc.lab_vpc.id
}

resource "aws_route_table" "lab_rt" {
  vpc_id = aws_vpc.lab_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.lab_gw.id
  }
}

resource "aws_route_table_association" "lab_rta" {
  subnet_id      = aws_subnet.lab_subnet.id
  route_table_id = aws_route_table.lab_rt.id
}

resource "aws_security_group" "web_sg" {
  name   = "ansible-web-sg"
  vpc_id = aws_vpc.lab_vpc.id

  ingress {
    description = "Allow SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. Discover Latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# 4. Web Server Instance
resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.generated_key.key_name
  subnet_id              = aws_subnet.lab_subnet.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "ansible-managed-web-01"
    Role = "webserver"
  }
}

# 5. Automatically Output Ansible Inventory
resource "local_file" "ansible_inventory" {
  filename = "${path.module}/ansible/hosts.ini"
  content  = <<-EOT
    [webservers]
    web-01 ansible_host=${aws_instance.web.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=${path.module}/ansible/id_rsa ansible_ssh_common_args='-o StrictHostKeyChecking=no'
  EOT
}

output "web_public_ip" {
  value = aws_instance.web.public_ip
}
```

---

## 2. Step 2: The Ansible Configuration Layer

Create `ansible/playbook.yaml`:

```yaml
# ansible/playbook.yaml
---
- name: Configure Production Web Server & Security Hardening
  hosts: webservers
  become: true

  vars:
    company_name: "Cloud Enterprise DevOps"

  tasks:
    - name: Wait 60 seconds for cloud-init and SSH to be ready
      ansible.builtin.wait_for_connection:
        timeout: 120

    - name: Update apt cache
      ansible.builtin.apt:
        update_cache: true
        cache_valid_time: 3600

    - name: Install Nginx and UFW Firewall
      ansible.builtin.apt:
        name:
          - nginx
          - ufw
          - curl
        state: present

    - name: Deploy custom web page
      ansible.builtin.copy:
        dest: /var/www/html/index.html
        owner: www-data
        group: www-data
        mode: '0644'
        content: |
          <!DOCTYPE html>
          <html>
          <head>
            <title>{{ company_name }}</title>
            <style>
              body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f8fafc; text-align: center; padding-top: 100px; }
              .card { background: #1e293b; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
              h1 { color: #38bdf8; }
              .badge { background: #0284c7; padding: 6px 12px; border-radius: 6px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🚀 Infrastructure & App Deployed!</h1>
              <p>Provisioned with <span class="badge">Terraform</span></p>
              <p>Configured & Hardened with <span class="badge">Ansible</span></p>
            </div>
          </body>
          </html>
      notify: Restart Nginx

    - name: Configure UFW - Allow OpenSSH
      community.general.ufw:
        rule: allow
        name: OpenSSH

    - name: Configure UFW - Allow HTTP
      community.general.ufw:
        rule: allow
        port: '80'
        proto: tcp

    - name: Enable UFW Firewall
      community.general.ufw:
        state: enabled

  handlers:
    - name: Restart Nginx
      ansible.builtin.systemd:
        name: nginx
        state: restarted
```

---

## 3. Step 3: Executing the Pipeline

```bash
# 1. Provision Infrastructure
terraform init
terraform apply -auto-approve

# 2. Execute Configuration Management
ansible-playbook -i ansible/hosts.ini ansible/playbook.yaml

# 3. Test Web Response via curl
curl http://$(terraform output -raw web_public_ip)
```

---

## 4. Summary & Next Steps

You have built an automated pipeline spanning cloud compute provisioning and operating system configuration. In **Section 08: Enterprise CI/CD, Security & Capstone**, we will explore **GitHub Actions CI/CD automation**, **Policy as Code with Trivy & tflint**, and the **Production Readiness Review**.
