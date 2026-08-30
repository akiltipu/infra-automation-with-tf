---
title: "Ansible Architecture & Core Fundamentals"
description: "Master Ansible core components: Control Node vs Managed Nodes, Playbooks, Inventories, Tasks, Modules, Jinja2 Templates, Handlers, and Idempotency."
keywords:
  - Ansible Architecture
  - Ansible Playbooks
  - Ansible Inventory
  - Jinja2 Templates
  - Handlers
  - Idempotency
---

# Ansible Architecture & Core Fundamentals

Ansible operates using a straightforward, agentless architecture. Let us break down its core building blocks and write our first production playbook.

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    CONTROL NODE (Laptop / CI)              │
│  - Ansible Engine installed                                │
│  - Playbooks (.yaml)                                       │
│  - Inventory file (hosts)                                  │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              │ SSH Connection (Port 22)
                              │ Using SSH Key Pair
                              ▼
┌────────────────────────────────────────────────────────────┐
│                    MANAGED NODES (AWS EC2)                 │
│  - Python 3 installed (standard on Ubuntu/RHEL)             │
│  - No special background agent required!                   │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Core Ansible Concepts

### A. The Inventory (`hosts.ini` or `inventory.yaml`)
Defines the target servers and groups:
```ini
[webservers]
web-01 ansible_host=54.210.10.45 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/aws-key.pem
web-02 ansible_host=54.210.10.46 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/aws-key.pem

[databases]
db-01 ansible_host=10.0.2.15 ansible_user=ubuntu

[all:vars]
ansible_python_interpreter=/usr/bin/python3
```

### B. Playbooks & Tasks
A **Playbook** maps a group of hosts to a series of **Tasks**, where each task invokes an Ansible **Module**:

```yaml
# playbook.yaml
---
- name: Configure Production Web Servers
  hosts: webservers
  become: true # Run tasks with sudo privileges

  vars:
    http_port: 80
    app_title: "Automated via Terraform & Ansible"

  tasks:
    - name: Update apt package index
      ansible.builtin.apt:
        update_cache: true
        cache_valid_time: 3600

    - name: Install Nginx web server
      ansible.builtin.apt:
        name: nginx
        state: present

    - name: Deploy custom Nginx HTML landing page
      ansible.builtin.template:
        src: templates/index.html.j2
        dest: /var/www/html/index.html
        owner: www-data
        group: www-data
        mode: '0644'
      notify: Restart Nginx Service # Triggers handler only if file changed!

    - name: Ensure Nginx service is running and enabled
      ansible.builtin.systemd:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Restart Nginx Service
      ansible.builtin.systemd:
        name: nginx
        state: restarted
```

---

## 3. Jinja2 Templating (`index.html.j2`)

Ansible uses **Jinja2** to inject dynamic variables into configuration files:

```html
<!-- templates/index.html.j2 -->
<!DOCTYPE html>
<html>
<head>
  <title>{{ app_title }}</title>
</head>
<body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
  <h1>🚀 {{ app_title }}</h1>
  <p>Provisioned by <strong>Terraform</strong> | Configured by <strong>Ansible</strong></p>
  <p>Host: <code>{{ ansible_hostname }}</code> ({{ ansible_default_ipv4.address }})</p>
</body>
</html>
```

---

## 4. Executing the Playbook & Inspecting Idempotency

Run the playbook against your inventory:

```bash
ansible-playbook -i hosts.ini playbook.yaml
```

### Output Summary:
```
PLAY [Configure Production Web Servers] ****************************************

TASK [Gathering Facts] *********************************************************
ok: [web-01]

TASK [Install Nginx web server] ************************************************
changed: [web-01]

TASK [Deploy custom Nginx HTML landing page] ***********************************
changed: [web-01]

RUNNING HANDLER [Restart Nginx Service] ****************************************
changed: [web-01]

PLAY RECAP *********************************************************************
web-01    : ok=5    changed=3    unreachable=0    failed=0
```

> [!NOTE]
> If you run the command a second time with no configuration changes, Ansible will report:
> `web-01 : ok=5 changed=0 unreachable=0 failed=0`
> This demonstrates **Idempotency** in action.

---

## 5. Summary & Next Steps

You now understand Ansible's core architecture, task execution, Jinja2 templating, and handlers. In the next lesson, we will explore **Connecting Terraform and Ansible: passing outputs to dynamic inventories and orchestration strategies**.
