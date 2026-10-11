# Assignment 07 — Configure twice, change once

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

1. Render the same variable names used by the play.
2. Jinja's `e` filter escapes HTML text.
3. Handlers respond to changed tasks and normally run at the end of the play; repeated notifications are coalesced.

Reference: `reference/`; explanation: `../../instructor/07.md`.
