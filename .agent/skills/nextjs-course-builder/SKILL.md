---
name: nextjs-course-builder
description: Next.js Pages Router and SSG best practices for this course starter project, covering dynamic route loading, header context updates, and static build pipelines.
---

# Skill: Next.js Course Builder

This skill provides guidelines and patterns for modifying, extending, and maintaining the Next.js frontend application.

## Core Concepts & Data Flow

1. **Course Configuration**:
   - Course settings are loaded from `course.json` using `getCourseConfig()` in `data/course.js`.
   - Settings are provided to the app via `CourseInfoProvider` context in `components/layout.js`.

2. **Lesson Pipeline**:
   - `data/lesson.js` exports `getLessons()` (fetches all sections and lessons) and `getLesson(targetDir, targetFile)` (fetches single lesson HTML and metadata).
   - Markdown content is parsed into HTML using `marked` and syntax highlighted with `highlight.js`.

3. **Dynamic Header State**:
   - Lesson pages update the global top navbar using `headerContext`.
   - In lesson components (`pages/lessons/[section]/[slug].js`), `useEffect` sets section title, lesson title, and FontAwesome icon on mount.

## Guidelines & Patterns

- **Static Generation**:
  - `pages/index.js` and `pages/lessons/[section]/[slug].js` use `getStaticProps` and `getStaticPaths`.
  - Always set `fallback: false` in `getStaticPaths` to ensure all invalid routes yield a 404.
- **Copy Code Functionality**:
  - `data/copyCode.js` adds copy buttons to code blocks on lesson load. Ensure `useEffect` calls `createCopyCodeFunctionality()` on mount and cleans up on unmount.
- **Image Referencing**:
  - Always prefix image paths with `${process.env.BASE_URL}` when referencing images from `public/images/`.
