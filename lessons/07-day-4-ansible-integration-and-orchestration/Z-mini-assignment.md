---
title: "Assignment 07 — Configure twice, change once"
description: "Solve an independent CourseOps problem with acceptance criteria, hints and instructor feedback."
keywords: [CourseOps, assignment, assessment]
kind: assignment
track: core
---

# Assignment 07 — Configure twice, change once

<div class="lesson-goal"><strong>Independent practice · 40 minutes</strong><p>Demonstrate the section outcome with evidence before comparing the reference solution.</p></div>

[Download the lab bundle](/downloads/courseops-labs.zip) and open `courseops/assignments/07`. In a repository checkout the same files live under `labs/courseops`. Paths below refer to that bundle.


**Problem:** One page template must support different environments without copying the role. Copy `starter` to `work/assignment-07`, complete the template, and activate the project's Ansible virtual environment. Budget: 40 minutes.

```bash
ansible-playbook -i localhost, -c local render.yml -e courseops_environment=staging
ansible-playbook -i localhost, -c local render.yml -e courseops_environment=staging
ansible-playbook -i localhost, -c local render.yml -e courseops_environment=prod --check --diff
```

## Acceptance criteria

- The rendered page says `staging environment`, and contains `Maintenance &lt;scheduled&gt;` rather than an HTML element named `scheduled`.
- The second identical run reports `changed=0`.
- Check mode predicts the production change but leaves the existing staging file untouched.
- Explain why the `-e` value overrides the play variable, and why arbitrary role defaults should not be overwritten with extra variables in every invocation.
- For the cloud track, run the real role twice and verify `/healthz`. Changing page content should not reload Nginx; changing its configuration should notify validation and reload handlers.
- Explain why `--check` is not proof that a first-time package install and dependent commands will succeed.

Submit the template, three sanitized results, and a before/after file comparison. Remove the generated `status.html` after checking. Never use `--diff` for secret templates: `no_log: true` and `diff: false` protect task output, while encrypted source still requires secure runtime handling.

## Graduated hints

<details class="assignment-hint"><summary>Hint 1</summary><p>Render the same variable names used by the play.</p></details>
<details class="assignment-hint"><summary>Hint 2</summary><p>Jinja&#x27;s <code>e</code> filter escapes HTML text.</p></details>
<details class="assignment-hint"><summary>Hint 3</summary><p>Handlers respond to changed tasks and normally run at the end of the play; repeated notifications are coalesced.</p></details>

Reference: `reference/`; explanation: `../../instructor/07.md`.

## Feedback and reflection

[Browse starter files](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/assignments/07) · [Instructor solution — after your attempt](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/07.md) · [Assessment rubric](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/TEACHING-GUIDE.md)

<details class="knowledge-check"><summary>What should I explain before marking this assignment complete?</summary><p>State your prediction, show the evidence that supports or contradicts it, explain one limit of your checks, and record cleanup. Correct an error and retry if an acceptance criterion is unmet.</p></details>

## Return to this idea later

Tomorrow, explain the main decision without looking at the reference. About a week later, change one input or requirement and predict the result. Record what you needed to look up in your learning log; the aim is to identify your next practice step.
