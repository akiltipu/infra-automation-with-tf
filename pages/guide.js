import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import getCourseConfig from "../data/course";
import createCopyCodeFunctionality from "../data/copyCode";
export default function Guide({ html, headings }) {
  const course = getCourseConfig();
  const content = useMemo(() => ({ __html: html }), [html]);
  useEffect(() => createCopyCodeFunctionality(), [html]);
  return (
    <>
      <Head>
        <title>Learning guide – {course.title}</title>
        <meta
          name="description"
          content="Choose a lab path, check prerequisites, read a plan, troubleshoot and review core infrastructure concepts."
        />
        <link rel="canonical" href={`${course.publicUrl}/guide`} />
      </Head>
      <div className="guide-page">
        <Link href="/#curriculum">← Back to the curriculum</Link>
        <article className="lesson reader-article">
          <nav className="lesson-toc" aria-label="Guide sections">
            <details>
              <summary>In this guide</summary>
              <ol>
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </details>
          </nav>
          <div className="lesson-content" dangerouslySetInnerHTML={content} />
        </article>
      </div>
    </>
  );
}
export async function getStaticProps() {
  const fs = await import("node:fs/promises");
  const { renderCourseMarkdown } = await import("../data/lesson.js");
  return {
    props: renderCourseMarkdown(
      await fs.readFile("content/learning-guide.md", "utf8"),
    ),
  };
}
