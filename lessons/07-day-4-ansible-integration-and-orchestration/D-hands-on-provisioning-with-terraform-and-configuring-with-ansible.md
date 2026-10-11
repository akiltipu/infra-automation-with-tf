---
title: "Hands-On Lab: Provisioning with Terraform & Configuring with Ansible"
description: "End-to-end hands-on lab: Provision an AWS EC2 web infrastructure stack using Terraform, then configure Nginx, system hardening, and a web app using Ansible."
keywords:
  - Hands-on Lab
  - Terraform and Ansible Lab
  - Nginx Configuration
  - UFW Firewall
  - End-to-End Orchestration
kind: concept
track: extension
---

# Hands-On Lab: Provisioning with Terraform & Configuring with Ansible

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Provision a sandbox host, verify readiness, configure it, and clean up.</p></div>

<div class="project-connection"><strong>CourseOps · Section 07</strong><p>Extension practice: return after the core workshop. <a href="/lessons/day-4-ansible-integration-and-orchestration/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-4-ansible-integration-and-orchestration/mini-assignment">mini assignment</a>.</p></div>

![Verify host identity and readiness before configuration and HTTP checks](/images/lesson-diagrams/readiness.svg)

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

  }
}

provider "aws" {
  region = "us-east-1"
}

# 1. Register only the public key; keep the private key outside Terraform state.
variable "ssh_public_key_path" {
  type = string
}

variable "ssh_private_key_path" {
  type = string
}

variable "operator_cidr" {
  type        = string
  description = "Your current public IPv4 address with /32, not 0.0.0.0/0"
  validation {
    condition     = can(cidrnetmask(var.operator_cidr)) && can(regex("/32$", var.operator_cidr))
    error_message = "Use your public IPv4 address followed by /32."
  }
}

resource "aws_key_pair" "generated_key" {
  key_name_prefix = "ansible-lab-"
  public_key      = file(pathexpand(var.ssh_public_key_path))
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
    description = "Allow SSH from the lab operator only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.operator_cidr]
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

  metadata_options {
    http_tokens = "required"
  }
  root_block_device {
    encrypted = true
  }

  tags = {
    Environment = "dev"
    Name = "ansible-managed-web-01"
    Role = "webserver"
  }
}

# 5. Automatically Output Ansible Inventory
resource "local_file" "ansible_inventory" {
  filename = "${path.module}/ansible/hosts.ini"
  content  = <<-EOT
    [webservers]
    web-01 ansible_host=${aws_instance.web.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file='${pathexpand(var.ssh_private_key_path)}'
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
- name: Configure Sandbox Web Server
  hosts: webservers
  become: true
  gather_facts: false

  vars:
    company_name: "Cloud Enterprise DevOps"

  pre_tasks:
    - name: Wait for SSH and Python connectivity
      ansible.builtin.wait_for_connection:
        timeout: 300

    - name: Wait for Ubuntu cloud-init to finish
      ansible.builtin.command: cloud-init status --wait
      changed_when: false

    - name: Gather facts after the host is ready
      ansible.builtin.setup:

  tasks:
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

    - name: Ensure Nginx is running and enabled
      ansible.builtin.systemd:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Restart Nginx
      ansible.builtin.systemd:
        name: nginx
        state: restarted
```

---

## 3. Step 3: Preflight, execute, and verify

**Prerequisites:** Terraform, AWS CLI with a sandbox role, a supported Ansible control node (macOS/Linux/WSL), Python, OpenSSH, and `community.general` for the UFW tasks. This creates one EC2 instance, an EBS volume, and a public IPv4 address, which may incur charges. It is a single-host HTTP lab, not a TLS or high-availability production deployment.

```bash
mkdir -p ansible
ansible-galaxy collection install community.general
aws sts get-caller-identity
ssh-keygen -t ed25519 -f ~/.ssh/terraform-ansible-lab
```

Use an SSH agent for a passphrase-protected key. Create an uncommitted `terraform.tfvars` with your own paths and actual public IPv4 address; the documentation address below is only a placeholder:

```hcl
ssh_public_key_path  = "~/.ssh/terraform-ansible-lab.pub"
ssh_private_key_path = "~/.ssh/terraform-ansible-lab"
operator_cidr        = "203.0.113.10/32"
```

```bash
terraform init
terraform fmt
terraform validate
terraform plan -out=tfplan
terraform show tfplan
terraform apply tfplan
```

Before Ansible connects, verify the instance's SSH host-key fingerprint through a trusted channel, such as the authenticated EC2 console system log containing cloud-init host-key fingerprints. Connect interactively and compare the fingerprint before accepting it:

```bash
ssh -i ~/.ssh/terraform-ansible-lab ubuntu@"$(terraform output -raw web_public_ip)"
# After checking the fingerprint and connecting, exit the remote shell.
ansible-inventory -i ansible/hosts.ini --graph
ansible-playbook -i ansible/hosts.ini ansible/playbook.yaml --syntax-check
ansible-playbook -i ansible/hosts.ini ansible/playbook.yaml
curl --fail "http://$(terraform output -raw web_public_ip)"
```

Do not disable host-key checking or blindly trust `ssh-keyscan` output. If a rebuilt instance has a different key, re-verify its identity before updating `known_hosts`.

Run the playbook again. Expect no application changes when the host is converged, though an expired apt cache may refresh. If connection fails, check your current public IP, the /32 security-group rule, route association, SSH key, and verified host key. An open port does not prove cloud-init completed.

## 4. Clean up the sandbox

```bash
terraform plan -destroy -out=destroy.tfplan
terraform show destroy.tfplan
terraform apply destroy.tfplan
terraform state list
```

Verify the lab EC2 instance is terminated and no lab volumes or other billable resources remain in AWS. Keep `.terraform/`, `*.tfstate*`, `*.tfplan`, `tfplan`, generated inventory, and secret variable files out of Git. Remove the local lab key pair only when you no longer need it; Terraform did not create or manage the private key.


## Apply the idea: verify both layers

A successful Terraform apply establishes cloud objects; it does not prove SSH, package installation, or HTTP readiness. The playbook waits for connection and cloud-init, then configures the host. Test HTTP and run the playbook again; explain any remaining changed tasks instead of assuming idempotency.

<details class="knowledge-check">
<summary>Check your understanding: Why set gather_facts: false before wait_for_connection?</summary>
<p>Automatic fact gathering would connect before the readiness task and could fail on a new host. Wait first, then explicitly gather facts. Keep host-key verification enabled and establish trust before the playbook.</p>
</details>

**Read further:** [Official documentation](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/wait_for_connection_module.html).

## 5. Summary & Next Steps

You have built an automated pipeline spanning cloud compute provisioning and operating system configuration. In **Section 08: Enterprise CI/CD, Security & Capstone**, we will explore **GitHub Actions CI/CD automation**, **Policy as Code with Trivy & tflint**, and the **Production Readiness Review**.
