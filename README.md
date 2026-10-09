# Infrastructure Automation with Terraform and Ansible

A four-day course with 33 existing lessons, 8 guided project workshops and 8 section assignments. Build **CourseOps**, a service-status website, through one connected Terraform and Ansible project.

[Read the course](https://akiltipu.github.io/infra-automation-with-tf/)

## Run the course site locally

Use Node.js 22 or later, Python 3.11+ for lab packaging, Git, and the committed dependency lockfile:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Development runs at the root path; production exports use `productionBaseUrl` from `course.json`.

```bash
npm run check:lessons
npm run build
```

The build exports the site to `out/`, including lesson metadata in `lessons.csv`, full text in `llms.txt`, and a source-only lab bundle in `downloads/courseops-labs.zip`. GitHub Pages deployment runs on changes to `main`; pull requests run content checks and the static build without deploying.

## Learning experience

The curriculum supports topic/day search, lesson-type filters, local completion tracking and resume. The [learning guide](content/learning-guide.md) explains prerequisites, plan reading, troubleshooting and key terms. Progress is self-assessed, stored only in the current browser, and has a temporary fallback if storage is blocked.

The [research and design review](docs/course-experience-review.md) records the primary sources, content corrections, accessibility decisions and generated banner provenance. Instructor profile data lives in `course.json` and is shared by the homepage and welcome lesson.

For browser checks after building:

```bash
npx playwright install chromium
npm run check:browser
```

These checks cover desktop/mobile routes, search, storage failures, resume, code copying, hint disclosure, downloads and selected automated accessibility checks in both themes. They do not establish complete WCAG conformance.

## Connected project and teaching plan

[Start CourseOps](labs/courseops/README.md) for runnable checkpoints, local alternatives, state migration, module tests, Ansible configuration and cleanup. [Eight assignments](labs/courseops/assignments) include acceptance criteria, graduated hints and separate instructor answers. The [teaching guide](labs/courseops/instructor/TEACHING-GUIDE.md) gives a four-day schedule and feedback rubric; the [capstone](labs/courseops/CAPSTONE.md) defines the final assessment.

Follow Core → Workshop → Assignment in each section. Extension pages are follow-up reading. The capstone is a separate demonstration or take-home assessment, not an extra task squeezed into the final assignment.

## Learning paths

| Path | Exercises | Requirements |
| --- | --- | --- |
| Local practice | HCL playground, state inspection, environment isolation, stable resource addresses, CI quality gate | Terraform; no cloud account |
| AWS sandbox | First network, S3 backend, reusable network module, Terraform + Ansible web host | Scoped AWS identity; possible cloud charges |
| Delivery design | OIDC roles, protected environment, saved-plan review, policy checks, capstone evidence | Repository/AWS setup described in each lesson |

The connected CourseOps bundle requires Terraform >=1.10 and <2 throughout. Older standalone `terraform_data` examples require Terraform 1.4+, import blocks 1.5+, and S3 native locking 1.10+. Some snippets pin Terraform 1.10.5 and AWS provider 5.x as teaching baselines, not claims about the latest release. Check compatibility and select a supported, tested version for your own environment. Read individual prerequisites before running examples. Fragments illustrate one concept and may omit surrounding resources; labs explicitly identify files to create.

AWS resources are not created by building this website. Run cloud labs only in your sandbox, check the caller identity, review plans, and complete cleanup. State, binary/JSON plans, private keys, and secret variable files must stay out of Git.

## Contributing a lesson

- Follow `AGENTS.md` for filenames, frontmatter, and course configuration.
- Include a learning outcome, a concrete explanation, and a checkpoint with an explained answer.
- Keep commands distinct from output and label incomplete examples.
- Store diagrams under `public/images/`; reference `/images/...` in Markdown. The renderer adds the GitHub Pages base path and a full-size link for lesson diagrams.
- Use tables for comparisons and diagrams for dependencies. SVGs include titles/descriptions; lesson image alt text explains the relationship.
- Use `##` headings for the generated page navigator. Native `<details class="knowledge-check">` elements work without a diagram runtime or external script.
- Link primary documentation and explain version-sensitive behavior.

`npm run check:lessons` verifies heading IDs, navigation order, learning aids, and image paths under the production base path. It does not execute Terraform or deploy cloud infrastructure. The separate PR lab job runs real local Terraform recovery/refactor exercises, AWS provider mocks, policy fixtures, and Ansible template/inventory checks. See [delivery checks](labs/courseops/delivery/README.md) for commands. AWS runtime behavior requires a sandbox integration run and is not verified by mocks.
