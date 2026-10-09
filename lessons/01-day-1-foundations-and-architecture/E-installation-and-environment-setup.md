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
kind: concept
track: core
---

# Complete Installation & Environment Setup Guide

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Verify the Terraform binary and AWS identity before planning.</p></div>

<div class="project-connection"><strong>CourseOps · Section 01</strong><p>Apply this concept in the connected project. <a href="/lessons/day-1-foundations-and-architecture/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-1-foundations-and-architecture/mini-assignment">mini assignment</a>.</p></div>

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
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl wget unzip

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

### C. Linux (RHEL)
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

# Linux x86_64 (use the aarch64 installer on ARM64)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### B. Prefer short-lived credentials with IAM Identity Center

Use the start URL, SSO region, account, and role supplied by your sandbox administrator:

```bash
aws configure sso --profile course-dev
aws sso login --profile course-dev
export AWS_PROFILE=course-dev
export AWS_REGION=us-east-1
aws sts get-caller-identity
```

Check the returned **Account** and **Arn** before any AWS lab. If temporary environment credentials are also set, they can take precedence over the profile; use a clean shell or remove stale credentials before proceeding. CI should use a scoped OIDC role rather than a developer profile.

### C. Separate backend and provider authentication

The AWS provider uses an AWS credential chain to authenticate resource operations. An S3 backend authenticates separately during `init`; a provider's `assume_role` block does not configure the backend. Both need the intended role and permissions. Do not put credentials in `.tf` files or backend arguments.

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


## Apply the idea: run a preflight

Run terraform version, aws --version, and aws sts get-caller-identity in the same shell that will run Terraform. Compare the account and role with the sandbox you intended. An expired SSO session needs a fresh login; changing an HCL region does not switch AWS accounts.

<details class="knowledge-check">
<summary>Check your understanding: AWS CLI works but terraform init cannot read S3. Where do you look?</summary>
<p>The backend authenticates independently of the resource provider. Check its profile/role, bucket region, state-key permissions, lockfile permissions, and any KMS policy.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/backend/s3).

## 5. Summary & Next Steps

You now have a fully configured, cross-platform Terraform environment with multi-version switching and AWS authentication. In the next section, we dive into **Section 02: HCL Syntax, Core Workflow & First Deployments**, starting with the **anatomy of HashiCorp Configuration Language (HCL)**.
