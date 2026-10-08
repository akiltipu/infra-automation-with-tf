# Infrastructure Automation with Terraform and Ansible

A four-day course with 33 lessons, illustrated explanations, self-check questions, and local and AWS sandbox labs.

[Read the course](https://akiltipu.github.io/infra-automation-with-tf/)

## Run the course site locally

Use Node.js 22 or later and the committed dependency lockfile:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Development runs at the root path; production exports use `productionBaseUrl` from `course.json`.

```bash
npm run check:lessons
npm run build
```

The build exports the site to `out/`, including lesson metadata in `lessons.csv` and full text in `llms.txt`. GitHub Pages deployment runs on changes to `main`; pull requests run content checks and the static build without deploying.

## Learning paths

| Path | Exercises | Requirements |
| --- | --- | --- |
| Local practice | HCL playground, state inspection, environment isolation, stable resource addresses, CI quality gate | Terraform; no cloud account |
| AWS sandbox | First network, S3 backend, reusable network module, Terraform + Ansible web host | Scoped AWS identity; possible cloud charges |
| Delivery design | OIDC roles, protected environment, saved-plan review, policy checks, capstone evidence | Repository/AWS setup described in each lesson |

Local `terraform_data` labs require Terraform 1.4+, import blocks 1.5+, and S3 native locking 1.10+. Some snippets pin Terraform 1.10.5 and AWS provider 5.x as teaching baselines, not claims about the latest release. Check compatibility and select a supported, tested version for your own environment. Read individual prerequisites before running examples. Fragments illustrate one concept and may omit surrounding resources; labs explicitly identify files to create.

AWS resources are not created by building this website. Run cloud labs only in your sandbox, check the caller identity, review plans, and complete cleanup. State, binary/JSON plans, private keys, and secret variable files must stay out of Git.

## Contributing a lesson

- Follow `AGENTS.md` for filenames, frontmatter, and course configuration.
- Include a learning outcome, a concrete explanation, and a checkpoint with an explained answer.
- Keep commands distinct from output and label incomplete examples.
- Store diagrams under `public/images/`; reference `/images/...` in Markdown. The renderer adds the GitHub Pages base path and a full-size link for lesson diagrams.
- Use tables for comparisons and diagrams for dependencies. SVGs include titles/descriptions; lesson image alt text explains the relationship.
- Use `##` headings for the generated page navigator. Native `<details class="knowledge-check">` elements work without a diagram runtime or external script.
- Link primary documentation and explain version-sensitive behavior.

`npm run check:lessons` verifies heading IDs, navigation order, learning aids, and image paths under the production base path. It does not execute Terraform or deploy cloud infrastructure.
