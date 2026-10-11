# Assignment 08 — Be the release reviewer

**Problem:** A pipeline passed formatting checks but proposed a replacement and an instance with no accountable owner. Build a release decision using plan evidence, then defend it. Budget: 40 minutes before the capstone.

From the project root:

```bash
python3 -m unittest discover -s delivery -p 'test_*.py'
python3 delivery/check-policy.py < delivery/fixtures/allowed.json
python3 delivery/check-policy.py < delivery/fixtures/replace.json
# Last command must exit 1, which means the gate blocked it.
```

## Acceptance criteria

1. Before running the script, predict allow/block for all five fixtures and explain each result.
2. Add a fixture for an update with an empty `Environment`, and add a test that fails if it is allowed.
3. Add a fixture for an unrelated, nondestructive `terraform_data` change and test that it is allowed.
4. Trace a production release from commit to plan to policy to approval to application of the **same saved plan**, identifying the cloud identity at each stage.
5. Explain why a passing gate does not prove an application is healthy, and why a policy exception needs a specific reviewer and scope.
6. Complete `CAPSTONE.md` using the cloud or clearly labeled local track. The capstone is a separate project assessment; it is not expected to fit into this 40-minute assignment.

Submit the prediction table, fixtures/tests, and a release checklist. The simple Python gate makes the decision logic visible; the policy lesson introduces OPA for broader reusable policy. Neither is a complete security scanner.

## Graduated hints

1. Replacements include both `delete` and `create` actions; ordering can vary.
2. Missing, empty, and unknown ownership values should fail closed.
3. No-op refactoring uses the stricter `scripts/verify-plan.py` gate; ordinary changes use a different policy.

Instructor explanation and capstone feedback: `../../instructor/08.md`.
