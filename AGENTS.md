# Repository Agent Guidelines: Terraform Course Platform

## Project Stack & Architecture Overview
- **Framework**: Next.js (Pages Router, React 19, Turbopack)
- **Content Engine**: Static Markdown (`.md`) lessons with YAML Frontmatter (`gray-matter`), parsed via `marked` and syntax-highlighted with `highlight.js`.
- **Data & Configuration**: Centralized course metadata in `course.json`. Lessons dynamically compiled from the `lessons/` directory structure.
- **Runtime Environment**: Node.js v20+ (compatible with NVM).

---

## Essential Commands

### Development
- `npm run dev` - Starts the local Next.js development server (respects `productionBaseUrl` in `course.json`).

### Build & Production
- `npm run build` - Executes Next.js static build (`next build`), followed by automated metadata CSV export (`npm run csv`) and LLM full-text compilation (`npm run llm-text`).
- `npm run start` - Starts the production server.

### Content Utilities
- `npm run csv` - Generates lesson metadata CSV at `course.json.csvPath` (`./out/lessons.csv`).
- `npm run llm-text` - Concatenates all lesson markdown files into a single text file at `course.json.llmFullTextPath` (`./out/llms.txt`).
- `npm run seo` - Uses AI to auto-generate missing descriptions/keywords for lessons (requires `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`).

---

## Strict Architectural Boundaries & Conventions

1. **Lesson Organization & Naming Conventions**:
   - Section folders in `lessons/` MUST follow the format `XX-section-name` (e.g., `01-introduction-to-iac-and-terraform`).
   - Lesson files inside section folders MUST follow the format `X-lesson-name.md` (e.g., `A-what-is-infrastructure-as-code.md`).
   - Section folders MAY contain a `meta.json` file specifying custom section titles and Font Awesome v5 icon names.
   - Frontmatter in `.md` files SHOULD include `title`, `description`, and `keywords`.

2. **Course Configuration (`course.json`)**:
   - Global site details (authors, titles, social links, base URLs, output paths) MUST be managed in `course.json`.
   - Avoid hardcoding course title, author info, or social handles directly in React components.

3. **Styling & Assets**:
   - Global CSS variables live in `styles/variables.css`.
   - All static images MUST be placed in `public/images/`. Refer to images in Markdown using `/images/<filename>` or relative paths resolved with `process.env.BASE_URL`.

4. **Code & Component Standards**:
   - Use ES Modules (`import`/`export`).
   - Utilize React Context (`headerContext`, `courseInfoContext`) for page layout state propagation rather than prop-drilling.
