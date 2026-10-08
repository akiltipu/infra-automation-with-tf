import { useContext, useEffect, useMemo } from "react";
import Head from "next/head";
import { getLesson, getLessons } from "../../../data/lesson";
import getCourseConfig from "../../../data/course";
import Corner from "../../../components/corner";
import { Context } from "../../../context/headerContext";
import createCopyCodeFunctionality from "../../../data/copyCode";
import Link from "next/link";

export default function LessonSlug({ post }) {
  const courseInfo = getCourseConfig();
  const [_, setHeader] = useContext(Context);

  const nextLink = post.nextSlug || null;
  const prevLink = post.prevSlug || null;
  // Keep React from resetting the injected code controls on header updates.
  const lessonHtml = useMemo(() => ({ __html: post.html }), [post.html]);

  useEffect(() => {
    setHeader({
      section: post.section,
      title: post.title,
      icon: post.icon,
    });
    return createCopyCodeFunctionality();
  }, [post.slug, post.section, post.title, post.icon, post.html]);

  const title = post.title
    ? `${post.title} – ${courseInfo.title}`
    : courseInfo.title;
  const description = post.attributes.description
    ? post.attributes.description
    : courseInfo.description;

  const keywords = post.attributes.keywords
    ? post.attributes.keywords
    : courseInfo.keywords;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description}></meta>
        <meta name="keywords" content={keywords.join(",")}></meta>
        <meta name="og:description" content={description}></meta>
        <meta name="og:title" content={title}></meta>
        <meta
          name="og:image"
          content={`${process.env.BASE_URL}/images/terraform-course-hero-v2.png`}
        ></meta>
        <meta name="twitter:card" content="summary_large_image"></meta>
      </Head>
      <div className="lesson-container">
        <div className="lesson">
          <nav className="lesson-toc" aria-label="On this page">
            <details key={post.slug}>
              <summary>On this page <span>{post.headings.length} sections</span></summary>
              <ol>
                {post.headings.map(({ id, text }) => (
                  <li key={id}><a href={`#${id}`}>{text}</a></li>
                ))}
              </ol>
            </details>
          </nav>
          <div
            className="lesson-content"
            dangerouslySetInnerHTML={lessonHtml}
          />
          <div className="lesson-links">
            {prevLink ? (
              <Link href={prevLink} className="prev">
                ← Previous
              </Link>
            ) : null}
            {nextLink ? (
              <Link href={nextLink} className="next">
                Next →
              </Link>
            ) : null}
          </div>
        </div>
        <Corner />
      </div>
    </>
  );
}

export async function getStaticProps({ params }) {
  const post = await getLesson(params.section, params.slug);
  return {
    props: {
      post,
    },
  };
}

export async function getStaticPaths() {
  const sections = await getLessons();
  const lessons = sections.map((section) => section.lessons);
  const slugs = lessons.flat().map((lesson) => lesson.fullSlug);

  return { paths: slugs, fallback: false };
}
