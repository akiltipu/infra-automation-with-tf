# Course experience review — 9 October 2026

This change is stacked on `feat/project-led-course` (PR #5). It preserves the eight-section project and adds a clearer reading and practice experience. Sources were reviewed for specific design/technical decisions, not used as endorsements of this course.

## Research and decisions

| Primary source | Finding used | Concrete application |
| --- | --- | --- |
| [IES learning practice guide](https://ies.ed.gov/ncee/wwc/practiceguide/1) | Worked examples, problem solving, retrieval, spaced review and verbal explanations alongside graphics | New worked decisions in all eight workshops; revealable hints; delayed reflection; learning log |
| [WAI page structure](https://www.w3.org/WAI/tutorials/page-structure/) | Landmarks help readers navigate regions | Main landmark, skip link, labeled navigation |
| [WAI headings](https://www.w3.org/WAI/tutorials/page-structure/headings/) | Heading ranks communicate structure | Remove the header's extra h1; retain the lesson's main heading |
| [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Text and controls must remain discernible against their background | Explicit light/dark text and surface colors; focused contrast checks |
| [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Pointer target size or spacing matters | Larger form controls, readable lesson rows and touch-friendly actions |
| [Terraform planning modes](https://developer.hashicorp.com/terraform/cli/commands/plan) | Normal and refresh-only planning have different goals; detailed exit codes distinguish changes from errors | Plan-mode visual, changed-tag example, plan-reading guide; correct “resolved drift” language |
| [Module refactoring](https://developer.hashicorp.com/terraform/language/modules/develop/refactoring) | Explicit moves describe address migration without automatically replacing objects | Address/ID visual and reviewed moved-block-first explanation |
| [Sensitive values](https://developer.hashicorp.com/terraform/language/manage-sensitive-data) | Redaction, ephemeral values and write-only arguments have different scope/version requirements | Comparison table; retain the course's 1.10 baseline and label 1.11+ extensions |
| [Provider mocks](https://developer.hashicorp.com/terraform/language/tests/mocking) | Substitute responses do not exercise real cloud behavior | Separate mock, plan-review and health-check evidence |
| [AWS internet gateways](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html) | Routes and address/access requirements jointly determine internet reachability | Prerequisite diagnostic and ordered troubleshooting |
| [AWS NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) | Outbound translation is not an inbound operator access path | Retain the distinction between private-host egress and access |
| [Ansible handlers](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_handlers.html) | Notifications, definition order and play failures affect handler execution | Task-change matrix and conditional validation/reload diagram |
| [Ansible check mode](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_checkmode.html) | Simulation and diff have module-dependent limits | Guide and workshop distinguish predictions from integration evidence |
| [GitHub OIDC](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws) | Temporary identity still needs restricted trust and permissions | Replace the claim that OIDC “eliminates static secret leakage” with a scoped explanation |

Search and progress are product design judgments for a 49-page curriculum. The research supports the learning principles; it does not establish that this particular interface improves measured learning. The suggested next-day/one-week recall intervals are practical choices, not a universal optimum.

## Content audit outcomes

- Replace premature day-completion/mastery claims before the new workshops/assignments.
- Explain an unknown planned value, state versus intention, durable keys and module addresses with concrete examples.
- Give every workshop a prediction or worked decision, followed by independent practice.
- Preserve full assignment briefs, acceptance criteria and independent attempts; hints reveal progressively.
- Add a guide covering prerequisites, path selection, plan reading, troubleshooting and 16 glossary terms.
- Centralize the instructor profile in course metadata and reuse it on the homepage and welcome lesson. Use the instructor's shared professional background; omit employer/client details, unverified metrics and certification-expiry claims.

## Experience and implementation

- Responsive landing page with new hero artwork, four-day outcome cards, search/filter controls, local progress and resume.
- Contextual lesson sidebar, reading-time estimate, completion controls and learning-guide links.
- Progress and theme persistence are optional: denied or malformed browser storage must not break learning. Completion is explicitly self-assessed and does not sync across devices.
- Three new editable SVGs carry technical meaning; adjacent prose explains their relationships. Hero artwork is decorative and does not imply the single-host project has high availability.
- Preserve the site's static-export architecture, existing lesson URLs, source-only lab package and cloud-free CI.

## Hero asset provenance

Built-in image-generation tool; no third-party image copied. Project asset: `public/images/courseops-hero-v3.webp` (1536 × 1024). The generated PNG was encoded as WebP for delivery without changing the composition. Existing banner assets remain available.

Prompt: “Use case: stylized-concept. Asset type: wide hero artwork for an engineering course website about Terraform and Ansible. Create an elegant editorial 3D architectural miniature of an infrastructure workshop: precise matte white and dark graphite server modules, subtle violet and teal connections, one small translucent cloud form and a thin luminous structured grid, on a deep ink navy seamless background. Show a coherent cluster of carefully spaced geometric infrastructure components with generous breathing room; quiet premium technical publication aesthetic, polished and credible, not a toy. Landscape 3:2 composition, central cluster, soft studio lighting and subtle ambient shadows. The website renders its own title and calls to action beside this image. No text, no letters, no logos, no watermark, no people, no decorative padlocks, no faux interface labels. This is evocative cover artwork, not a technical network diagram.”

## Verification scope

Run the existing lesson/static-build and lab gates plus tests for search and stored progress. Review all lesson routes at desktop/mobile widths, dark mode, keyboard navigation, search empty states, reload/resume, progress toggling, denied/corrupt storage, code copying and archive download. Use automated accessibility checks as one input, not a claim of complete WCAG conformance. No AWS runtime deployment is part of this design/content change.

### Local results

- Static export and six Node content/search/progress tests passed.
- Eight Playwright checks passed, including all 51 learning pages at 1440px and 390px, mobile section navigation, storage failure recovery and exact copied text.
- Focused axe checks passed on the homepage, guide, welcome and assignment pages in light/dark themes. Fixed footer contrast and keyboard access to horizontally scrollable code blocks.
- Manually inspected the hero, curriculum, instructor profile, reader, diagrams and 320px layout. No live AWS deployment was performed.
