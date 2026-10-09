import { useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { getLesson, getLessons } from "../../../data/lesson";
import getCourseConfig from "../../../data/course";
import createCopyCodeFunctionality from "../../../data/copyCode";
import { useProgress } from "../../../context/progressContext";
import Instructor from "../../../components/instructor";

export default function LessonSlug({
  post,
  sectionLessons,
  position,
  total,
  route,
  readMinutes,
}) {
  const course = getCourseConfig();
  const { progress, ready, visit, toggle, persistent } = useProgress();
  const complete = progress.completed.includes(route);
  // Keep HTML references stable so progress updates cannot reset copy controls.
  const chunks = useMemo(
    () =>
      post.html
        .split("<!-- instructor-profile -->")
        .map((html) => ({ __html: html })),
    [post.html],
  );
  useEffect(() => createCopyCodeFunctionality(), [post.html]);
  useEffect(() => {
    if (ready) visit(route);
  }, [ready, visit, route]);
  const type =
    post.attributes.track === "extension"
      ? "Extension"
      : post.attributes.kind === "workshop"
        ? "Workshop"
        : post.attributes.kind === "assignment"
          ? "Assignment"
          : "Core concept";
  return (
    <>
      <Head>
        <title>
          {post.title} – {course.title}
        </title>
        <meta
          name="description"
          content={post.attributes.description || course.description}
        />
        <link rel="canonical" href={`${course.publicUrl}${route}`} />
        <meta property="og:title" content={post.title} />
        <meta
          property="og:description"
          content={post.attributes.description || course.description}
        />
        <meta
          property="og:image"
          content={`${course.publicUrl}/images/${course.heroImage}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="reader-layout">
        <aside className="reader-sidebar">
          <nav aria-label="Section lessons">
            <Link className="back-course" href="/#curriculum">
              ← All lessons
            </Link>
            <h2>{post.section}</h2>
            <ol>
              {sectionLessons.map((lesson) => (
                <li key={lesson.fullSlug}>
                  <Link
                    href={lesson.fullSlug}
                    aria-current={
                      lesson.fullSlug === route ? "page" : undefined
                    }
                  >
                    <span>
                      {lesson.title}
                      {lesson.track === "extension" && (
                        <small className="nav-extension">Extension</small>
                      )}
                    </span>
                    {progress.completed.includes(lesson.fullSlug) && (
                      <span role="img" aria-label="Marked complete">
                        ✓
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
            <Link className="reader-guide" href="/guide">
              Learning guide & glossary →
            </Link>
            <details className="mobile-section-nav" key={route}>
              <summary>Lessons in this section</summary>
              <ol>
                {sectionLessons.map((lesson) => (
                  <li key={lesson.fullSlug}>
                    <Link
                      href={lesson.fullSlug}
                      aria-current={
                        lesson.fullSlug === route ? "page" : undefined
                      }
                    >
                      <span>
                        {lesson.title}
                        {lesson.track === "extension" && (
                          <small className="nav-extension">Extension</small>
                        )}
                      </span>
                      {progress.completed.includes(lesson.fullSlug) && (
                        <span role="img" aria-label="Marked complete">
                          ✓
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            </details>
          </nav>
        </aside>
        <article className="lesson reader-article">
          <div className="reader-meta">
            <span>{type}</span>
            <span>
              Lesson {position} of {total}
            </span>
            <span>
              ~{readMinutes} min read
              {post.attributes.kind === "assignment"
                ? " · 40 min practice"
                : " · practice additional"}
            </span>
          </div>
          <nav className="lesson-toc" aria-label="On this page">
            <details key={route}>
              <summary>
                On this page <span>{post.headings.length} sections</span>
              </summary>
              <ol>
                {post.headings.map(({ id, text }) => (
                  <li key={id}>
                    <a href={`#${id}`}>{text}</a>
                  </li>
                ))}
              </ol>
            </details>
          </nav>
          <div className="lesson-content" dangerouslySetInnerHTML={chunks[0]} />
          {chunks[1] && (
            <>
              <Instructor />
              <div
                className="lesson-content"
                dangerouslySetInnerHTML={chunks[1]}
              />
            </>
          )}
          <section className="lesson-completion" aria-label="Learning progress">
            <div>
              <h2>Can you explain and apply it?</h2>
              <p>
                Use the checkpoint and evidence before marking this lesson
                complete.
                {!persistent &&
                  " Progress is temporary because browser storage is unavailable."}
              </p>
            </div>
            <button
              className="button-primary"
              aria-pressed={complete}
              disabled={!ready}
              onClick={() => toggle(route)}
            >
              {complete ? "✓ Marked complete" : "Mark complete"}
            </button>
            <p className="sr-only" role="status">
              {complete
                ? "Lesson marked complete"
                : "Lesson not yet marked complete"}
            </p>
          </section>
          <nav className="lesson-links" aria-label="Previous and next lesson">
            {post.prevSlug && (
              <Link href={post.prevSlug} className="prev">
                ← Previous
              </Link>
            )}
            {post.nextSlug ? (
              <Link href={post.nextSlug} className="next">
                Next lesson →
              </Link>
            ) : (
              <Link href="/#curriculum" className="next">
                Return to curriculum →
              </Link>
            )}
          </nav>
        </article>
      </div>
    </>
  );
}
export async function getStaticProps({ params }) {
  const post = await getLesson(params.section, params.slug);
  const sections = await getLessons();
  const section = sections.find((s) => s.slug === params.section);
  const all = sections.flatMap((s) => s.lessons);
  const route = `/lessons/${params.section}/${params.slug}`;
  return {
    props: {
      post,
      route,
      sectionLessons: section.lessons.map(({ title, fullSlug, track }) => ({
        title,
        fullSlug,
        track,
      })),
      position: all.findIndex((l) => l.fullSlug === route) + 1,
      total: all.length,
      readMinutes: Math.max(
        2,
        Math.ceil(post.markdown.split(/\s+/).length / 200),
      ),
    },
  };
}
export async function getStaticPaths() {
  const sections = await getLessons();
  return {
    paths: sections.flatMap((s) => s.lessons.map((l) => l.fullSlug)),
    fallback: false,
  };
}
