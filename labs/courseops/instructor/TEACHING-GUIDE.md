# Instructor guide: teach decisions, then commands

## Teaching design and sources

Use short demonstrations, guided attempts, independent problems and feedback. Revisit earlier concepts in later sections instead of explaining everything once. Pair diagrams with an explicit account of what each relationship means. These choices are informed by the [IES learning practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) and [Rosenshine's synthesis](https://www.aft.org/sites/default/files/Rosenshine.pdf). Applying them to this Terraform workshop is a curriculum design judgment, not evidence that this particular course has been experimentally validated.

## Four-day essential path

Reserve six contact hours per day, excluding lunch. Each day begins with 15 minutes of retrieval from the previous material (day one uses a prerequisite diagnostic), includes two 150-minute section blocks, two 15-minute breaks, and ends with 15 minutes of synthesis. Within each section: 35 minutes of selected explanations, 45 minutes of guided project work, 40 minutes of independent assignment, 20 minutes of feedback/retry, and 10 minutes of transition. Estimate timings; shorten the lecture before removing practice.

| Day | Sections | Demonstration | Exit evidence |
| --- | --- | --- | --- |
| 1 | 01–02 | Trace code → plan → objects; provision/model CourseOps | Architecture brief and verified first change |
| 2 | 03–04 | Partial failure and state boundaries | Recovery evidence and two independent states |
| 3 | 05–06 | Extract a contract; preserve identity through refactor | Failing test fixed and zero-replacement migration |
| 4 | 07–08 | Configure the same service; review delivery | Repeatable page, release review and capstone plan |

Reserve an additional 60–90 minutes for the final capstone demonstration, or assign it as take-home work after day four. Its grading is separate from the 40-minute section 08 problem.

Each section's Y workshop connects the reference lessons to the project. Teach the selected core lessons as needed during the workshop; do not add a second complete lecture for every reference page. Z is the independent problem and must stay last in the section. Extension badges identify material for follow-up study or an extended schedule.

## Before class

- Run the local track and download the lab archive. Check the classroom's Terraform/Ansible versions.
- For AWS learners, verify sandbox accounts, quotas, budget arrangements, roles and available AZs. Pre-download providers where classroom internet is unreliable.
- Explain whether AWS charges are paid by the organizer or learner; never assume free-tier coverage.
- Do the opening diagnostic: distinguish IP/subnet/route; explain Git commit versus deployment; navigate a shell directory; identify a cloud caller. Offer prework when these are unfamiliar.
- Reserve separate disposable roots for failure drills; no production account is a teaching target.

## How to run each section

1. Ask a prediction before showing output. Require every learner to write an answer, not just the fastest volunteer.
2. Demonstrate one small step and narrate your evidence, including how you know which state/account is selected.
3. Change one input together and ask learners to explain the changed plan.
4. Assign the Z problem independently. Allow documentation, but ask for a prediction before running commands and an explanation afterward.
5. Reveal hint 1 before hint 2. Release the reference solution only after an attempt; answers are publicly accessible and are not an access-control mechanism.
6. Grade behavior and evidence rather than matching resource names or exact formatting. Ask a short transfer question to distinguish copying from understanding.
7. Allow a corrected resubmission, then revisit one question the following morning and again after one week.

## Feedback and assessment

Use each assignment's ten-point rubric: behavior 4, verification 3, explanation 2, cleanup/handling 1. Suggested progression threshold: 8/10 with any unsafe target or secret exposure corrected. Students should state which assistance they used; using references is acceptable, submitting unexplained output is not sufficient.

Ask: “Which observation would prove your hypothesis wrong?” For a failed apply, reward inspection before retry. For a successful apply, ask what it does not prove. During the capstone, change a requirement (a new environment, renamed service or failed health check) and ask the student to propose the next plan.

## What not to overpromise

The project is not a full production platform. No cost estimate guarantees a bill, no mock proves cloud behavior, and a successful Terraform run does not prove application or data recovery. Record actual sandbox validation separately from static/local checks.
