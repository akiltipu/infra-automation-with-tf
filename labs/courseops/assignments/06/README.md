# Assignment 06 — Keep identity during a refactor

**Problem:** The middle service in a positional list is being retired, but the other services must retain their identities. First migrate addresses; then remove the service in a separate change. Budget: 40 minutes.

Copy `starter` to `work/assignment-06`, initialize, apply, and record `terraform output -json ids` privately. Do not run the reference in a fresh directory: the exercise needs the original state.

## Acceptance criteria

1. Replace `count` with a stable `for_each` key for each service; include three explicit `moved` blocks.
2. Save a refactor plan. It must report **0 add, 0 change, 0 destroy**, with address moves. IDs must be unchanged after apply.
3. For a machine check, run `terraform show -json refactor.tfplan | python3 ../../scripts/verify-plan.py` from `work/assignment-06`.
4. In a second reviewed plan, remove `billing` from the default set. Exactly one resource is destroyed; `status` and `search` retain IDs. Apply only after checking that evidence.
5. Explain why simply changing a list can replace later `count` instances when `triggers_replace` depends on the list value.
6. Destroy the remaining local resources.

Submit the two plan summaries, migration HCL, and explanation. Keep raw plan/state private. Reference: `reference/main.tf`; notes: `../../instructor/06.md`.

## Graduated hints

1. Keys should describe a stable identity, not a position.
2. Existing addresses are `[0]`, `[1]`, and `[2]`.
3. Map each old address to its original service name before removing any element.
