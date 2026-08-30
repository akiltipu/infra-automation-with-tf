# PR Review Workflow for Terraform Course Platform

Follow this workflow when reviewing Pull Requests or inspecting proposed changes to this codebase.

## 1. Structure & Naming Verification
- Verify new section directories in `lessons/` follow `XX-section-slug` format.
- Verify lesson markdown files follow `X-lesson-slug.md` format.
- Check that `meta.json` files contain valid JSON with `title` and `icon` properties.

## 2. Content & Frontmatter Audit
- Ensure every modified or new `.md` file contains valid frontmatter with `title`, `description`, and `keywords`.
- Verify code blocks use correct syntax language tags (`hcl`, `bash`, `yaml`, `json`).
- Ensure no broken links or missing image assets exist in `public/images/`.

## 3. Configuration & Metadata Consistency
- If `course.json` was updated, ensure JSON formatting is valid and `productionBaseUrl` is properly configured.
- Ensure no sensitive API keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) or cloud secrets are checked into git.

## 4. Build & Export Verification
Execute static build to verify that page generation, CSV generation, and LLM text generation complete without errors:

```bash
export PATH="/Users/akiltipu/.nvm/versions/node/v22.19.0/bin:$PATH"
npm run build
```

Verify that:
1. Next.js compiles all routes with 0 errors.
2. `out/lessons.csv` is updated with correct row count.
3. `out/llms.txt` contains full concatenated lesson markdown.
