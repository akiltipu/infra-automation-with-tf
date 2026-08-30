---
name: markdown-lesson-authoring
description: Best practices for authoring, structuring, and formatting Markdown course lessons with HCL code snippets, frontmatter, and meta.json section configs.
---

# Skill: Markdown Lesson Authoring

This skill provides standards for authoring high-quality technical course lessons within the `lessons/` directory structure.

## File Organization Rules

1. **Section Folders**:
   - Must be prefixed with 2 digits: `01-section-name`, `02-section-name`.
   - Section title is derived from directory name unless overridden in `meta.json`.
   - Section icons are specified in `meta.json` using Font Awesome icon names (e.g. `{"title": "Intro", "icon": "cloud"}`).

2. **Lesson Files**:
   - Must be prefixed with uppercase letter: `A-first-lesson.md`, `B-second-lesson.md`.
   - Lesson ordering is controlled by the letter prefix.

## Markdown Frontmatter Requirements

Every lesson file must start with a YAML frontmatter block:

```markdown
---
title: "Lesson Title Here"
description: "A clear 1-2 sentence overview of what the student will learn."
keywords:
  - Keyword 1
  - Keyword 2
---
```

## Code Snippet Standards

- Always specify code block language for syntax highlighting (e.g., ````hcl````, ````bash````, ````yaml````, ````json````).
- Include inline code comments explaining complex HCL parameters.
- Provide practical, executable examples.

## Visual Callouts & Formatting

- Use markdown tables for comparisons (`count` vs `for_each`, declarative vs imperative).
- Use blockquotes for warnings or best practice callouts:
  ```markdown
  > [!IMPORTANT]
  > Always pin exact module versions in production.
  ```
