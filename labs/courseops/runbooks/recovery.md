# Recovery: first identify what failed

| Situation | Inspect | Correct response | Incorrect shortcut |
| --- | --- | --- | --- |
| Apply stopped after some successful creates | Apply log, state list, provider IDs, cloud audit log | Pause other writers, repair cause, review a fresh plan | Assume rollback or restore an old snapshot blindly |
| Resource removed from HCL accidentally | Git diff and proposed deletes | Restore the declaration before applying | Remove it from state to hide the plan |
| Intentional console change | Refreshed plan and approved intent | Update HCL, then review convergence | Assume refresh-only edits HCL |
| Accidental console drift | Normal plan, dependencies and current service health | Restore intended configuration with a reviewed plan | Apply automatically without assessing impact |
| Object exists but binding is missing | Cloud identity, ownership and expected address | Import to its original or explicitly migrated address | Create a duplicate or bind it to two states |
| State snapshot damaged | Version history, lineage, serial, actual objects | Follow coordinated state recovery | Recreate everything from an empty state |

## Local failure drill: a partially completed deployment

The `assignments/03/starter` configuration has a failing precondition on a dependent resource. First predict whether its prerequisite can be created. Apply in the disposable local exercise; the command fails after the prerequisite is recorded. Inspect state before changing anything. Fix the input, re-plan and finish. This simulates a dependency failure without invoking a cloud API. Cloud partial applies can fail at different points and are not atomic.

## State recovery procedure (instructor demonstration / advanced)

1. Stop all CI and operator writers; record the backend bucket, key, workspace, role and current lock owner.
2. Preserve current state and evidence in restricted storage. Record object IDs and workload health. State and plan JSON may contain secrets.
3. Retrieve the relevant prior S3 version to a separate secure file. Inspect metadata without printing the whole state in shared logs. Compare both snapshots to real objects; a prior snapshot can omit resources created afterward.
4. Decide whether selective imports/moves or a full snapshot restoration is appropriate. A qualified operator coordinates a backend-specific restoration. Do not teach routine `state push -force` or lock deletion as a universal fix.
5. With exclusive ownership maintained, inspect `state list`, then a fresh plan. Resolve missing bindings and unexpected changes before approving any apply.
6. Validate service and data recovery separately; document the incident and release the writer freeze.

State versioning restores a record, not application data. For this stateless status page, the template is the content backup. A production database needs its own backup/restore drill and RPO/RTO targets. Do not simulate state corruption or lock contention in a real production backend.

Reference: https://developer.hashicorp.com/terraform/language/state
