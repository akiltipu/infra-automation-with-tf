---
title: "Welcome & Instructor Introduction"
description: "Meet your instructor Akil Mahmod Tipu, Senior DevOps Engineer, explore the course roadmap, prerequisites, and prepare for your 4-day infrastructure automation journey."
keywords:
  - Instructor Introduction
  - Akil Mahmod Tipu
  - Course Orientation
  - 4-Day Roadmap
  - Terraform Course
  - DevOps Engineering
---

# Welcome & Instructor Introduction

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Choose a learning path and define evidence of completion.</p></div>

Welcome to **Infrastructure Automation with Terraform & Ansible**! This comprehensive 4-day hands-on masterclass is designed to take you from core Infrastructure as Code fundamentals to enterprise-grade cloud architecture, multi-environment state management, and configuration orchestration.

---

## 1. whoami ?

<div class="instructor-card">
  <img src="/images/akiltipu-pro.jpg" alt="Akil Mahmod Tipu" />
  <div class="instructor-info">
    <h2>Akil Mahmod Tipu</h2>
    <p class="instructor-role">Senior DevOps Engineer & Team Lead</p>
    <p>
      Specializing in Cloud Architecture, Large-Scale Infrastructure Automation, Kubernetes Orchestration, and Enterprise CI/CD Pipelines. Passionate about empowering engineering teams to design reliable, secure, and reproducible cloud platforms.
    </p>
    <div class="instructor-links">
      <a href="https://www.linkedin.com/in/akiltipu" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-linkedin"></i> Connect on LinkedIn
      </a>
      <a href="https://github.com/akiltipu" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-github"></i> Follow on GitHub
      </a>
    </div>
  </div>
</div>

---

## 2. The 4-Day Master Curriculum Roadmap

This course is structured into four intensive, hands-on learning days:

<div class="course-roadmap">
  <article class="roadmap-day">
    <span class="roadmap-number">Day 01</span>
    <h3>Understand & deploy</h3>
    <p>IaC mental model, Terraform internals, HCL anatomy, CLI workflow, variables, data sources, and your first resources.</p>
    <span class="roadmap-output">Output: a working local stack you can inspect</span>
  </article>
  <article class="roadmap-day">
    <span class="roadmap-number">Day 02</span>
    <h3>Protect & recover</h3>
    <p>State internals, remote backends, locking, drift, imports, recovery, environment isolation, and multi-account design.</p>
    <span class="roadmap-output">Output: a team-safe state and recovery runbook</span>
  </article>
  <article class="roadmap-day">
    <span class="roadmap-number">Day 03</span>
    <h3>Reuse & refactor</h3>
    <p>Module contracts, registries, versioning, composition, expressions, dynamic blocks, lifecycle, count, and for_each.</p>
    <span class="roadmap-output">Output: a reusable module with stable addresses</span>
  </article>
  <article class="roadmap-day">
    <span class="roadmap-number">Day 04</span>
    <h3>Automate & govern</h3>
    <p>Ansible handoff, dynamic inventory, CI/CD, OIDC, security scanning, policy as code, and an incident-driven capstone.</p>
    <span class="roadmap-output">Output: a reviewed delivery pipeline</span>
  </article>
</div>

### The rhythm used in every live lesson

1. **Predict** what Terraform will do before running a command.
2. **Run** one small, copyable change.
3. **Observe** the plan, state, logs, or real infrastructure.
4. **Break** one assumption on purpose.
5. **Recover** safely and explain why the fix works.
6. **Clean up** resources and capture the production lesson.

---

## 3. Prerequisites & Environment Expectations

To gain the maximum benefit from this course, you should have:
- Basic familiarity with cloud concepts (Compute instances, VPC networks, DNS, SSH keys).
- A free-tier or sandbox **Amazon Web Services (AWS)** account.
- A terminal with administrator access (macOS, Linux, or Windows WSL2).
- Git installed and configured.

> [!TIP]
> Examples are teaching configurations. Local labs need no cloud account; AWS labs require a sandbox and can incur charges. Adapt identity, network access, backups, monitoring, and recovery controls before production use.

---


## Apply the idea: build a learning log

Keep one small Git repository for exercises. Record the command, your prediction, the observed result, and cleanup evidence. A successful apply is one observation; a second no-change plan and a tested recovery are stronger evidence that you understand the system.

<details class="knowledge-check">
<summary>Check your understanding: What can you finish without an AWS account?</summary>
<p>The HCL playground, local state lab, environment game day, stable-address refactor, and local CI quality gate all work without cloud resources.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/intro).

## 4. Let's Get Started!

Click **Next →** below to begin **Day 1: Lesson B — The Evolution of Cloud Infrastructure & Why IaC Matters**!
