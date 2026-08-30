---
title: "Complete Installation & Environment Setup Guide"
description: "Step-by-step cross-platform installation guide for Terraform across macOS, Linux, and Windows, version switching with tfswitch/tenv, and AWS authentication setup."
keywords:
  - Terraform Installation
  - macOS Homebrew
  - Linux apt yum
  - Windows Chocolatey Winget
  - tfswitch
  - tenv
  - AWS CLI Configuration
---

# Complete Installation & Environment Setup Guide

Before writing our first line of infrastructure code, we need a robust, production-ready local environment. This guide covers cross-platform installation, multi-version management, and cloud provider credential configuration.

---

## 1. Cross-Platform Terraform Installation

### A. macOS (via Homebrew)
```bash
# Add the official HashiCorp Homebrew tap
brew tap hashicorp/tap

# Install Terraform
brew install hashicorp/tap/terraform

# Verify installation
terraform -version
```

### B. Linux (Ubuntu / Debian)
```bash
# 1. Install prerequisites
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl

# 2. Add HashiCorp GPG key
wget -O- https://apt.releases.hashicorp.com/gpg | \
  gpg --dearmor | \
  sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null

# 3. Add official HashiCorp repository
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
  https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
  sudo tee /etc/apt/sources.list.d/hashicorp.list

# 4. Update repository index and install
sudo apt-get update && sudo apt-get install -y terraform
```

### C. Linux (RHEL / CentOS / Fedora / Amazon Linux)
```bash
# Add HashiCorp YUM repository
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo

# Install Terraform
sudo yum -y install terraform
```

### D. Windows (via Chocolatey or Winget)
```powershell
# Using Chocolatey
choco install terraform

# Using Windows Package Manager (Winget)
winget install HashiCorp.Terraform
```

---

## 2. Managing Multiple Terraform Versions (`tfswitch` & `tenv`)

In enterprise environments, different codebases often require different Terraform versions (e.g., Project A uses `1.5.7` while Project B uses `1.10.x`). Instead of reinstalling binaries manually, use a version manager.

### Option 1: `tfswitch` (Terraform Switcher)
```bash
# Install tfswitch on macOS/Linux
brew install warrensbox/tap/tfswitch

# Run tfswitch interactively in any project directory
tfswitch

# Or create a .terraform-version file in your project root
echo "1.10.5" > .terraform-version
tfswitch
```

### Option 2: `tenv` (Modern Unified Manager)
`tenv` manages Terraform, OpenTofu, and Terragrunt seamlessly:
```bash
# Install tenv via Homebrew
brew install tofuutils/tap/tenv

# Install and switch versions
tenv tf install 1.10.5
tenv tf use 1.10.5
```

---

## 3. Cloud Provider Authentication: AWS CLI Setup

Terraform does not store cloud credentials inside your `.tf` files. Instead, it natively resolves credentials through standard cloud SDK credential chains.

### A. Install AWS CLI v2
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### B. Configure AWS Credentials
Run `aws configure` to set your local profile:
```bash
aws configure --profile course-dev
# Prompt inputs:
# AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
# AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# Default region name [None]: us-east-1
# Default output format [None]: json
```

This creates or updates two files in your home directory:
- `~/.aws/credentials`:
  ```ini
  [course-dev]
  aws_access_key_id = AKIAIOSFODNN7EXAMPLE
  aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
  ```
- `~/.aws/config`:
  ```ini
  [profile course-dev]
  region = us-east-1
  output = json
  ```

### C. Terraform Credential Resolution Order
When executing, the AWS Provider checks the following locations in order:
1. Parameters in the `provider "aws"` block (never hardcode secrets here!).
2. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`).
3. Shared credentials file (`~/.aws/credentials` via `AWS_PROFILE=course-dev`).
4. IAM Instance Profile / ECS Task Role / EKS IRSA (when running in cloud CI/CD).

```bash
# Export the profile in your shell session
export AWS_PROFILE=course-dev
export AWS_REGION=us-east-1
```

---

## 4. IDE Tooling & Shell Autocompletion

To maximize productivity:
1. **VS Code Extension**: Install **"HashiCorp Terraform"** (`hashicorp.terraform`) for real-time syntax checking, schema autocompletion, and hover documentation.
2. **Shell Autocompletion**:
   ```bash
   # Enable bash/zsh autocomplete for terraform commands
   terraform -install-autocomplete
   ```

---

## 5. Summary & Next Steps

You now have a fully configured, cross-platform Terraform environment with multi-version switching and AWS authentication. In the next section, we dive into **Section 02: HCL Syntax, Core Workflow & First Deployments**, starting with the **anatomy of HashiCorp Configuration Language (HCL)**.
