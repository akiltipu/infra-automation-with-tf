import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getLessons } from "../data/lesson";
import getCourseConfig from "../data/course";
import { filterLessons } from "../data/progress";
import { useProgress } from "../context/progressContext";
import Instructor from "../components/instructor";

export default function Lessons({ sections }) {
  const course = getCourseConfig();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { progress, persistent, reset } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const all = useMemo(() => sections.flatMap((s) => s.lessons), [sections]);
  const visible = useMemo(
    () => filterLessons(sections, query, filter),
    [sections, query, filter],
  );
  const done = all.filter((l) =>
    progress.completed.includes(l.fullSlug),
  ).length;
  const resume = all.find((l) => l.fullSlug === progress.lastVisited);
  const resultCount = visible.reduce((n, s) => n + s.lessons.length, 0);
  return (
    <>
      <Head>
        <title>{course.title}</title>
        <meta name="description" content={course.description} />
        <link rel="canonical" href={`${course.publicUrl}/`} />
        <meta property="og:title" content={course.title} />
        <meta property="og:description" content={course.heroDescription} />
        <meta
          property="og:image"
          content={`${course.publicUrl}/images/${course.heroImage}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="course-home">
        <section className="course-hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">{course.heroEyebrow}</p>
            <h1 id="hero-title">{course.heroTitle}</h1>
            <p className="hero-description">{course.heroDescription}</p>
            <div className="hero-actions">
              <Link
                className="button-primary"
                href={resume?.fullSlug || all[0].fullSlug}
              >
                {resume ? "Resume learning" : "Start learning"}
                <span aria-hidden="true"> →</span>
              </Link>
              <a className="button-secondary" href="#curriculum">
                Explore the curriculum
              </a>
            </div>
            <p className="hero-facts">
              4 teaching days <span>·</span> 8 assignments <span>·</span> Local
              or AWS labs
            </p>
            <p className="hero-byline">
              With {course.authors[0].name} · {course.authors[0].company}
            </p>
          </div>
          <div className="hero-art">
            <img
              src={`${process.env.BASE_URL || ""}/images/${course.heroImage}`}
              alt=""
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <p>Build it. Understand it. Recover it.</p>
          </div>
        </section>
        <div className="home-body">
          <section className="path-intro" aria-labelledby="path-title">
            <div>
              <p className="eyebrow">A practical route through the material</p>
              <h2 id="path-title">Learn the idea. Use it. Prove it.</h2>
              <p>
                Read the core concepts, follow the workshop, then solve the
                section assignment before opening its solution. Extensions are
                for a second pass.
              </p>
            </div>
            <div className="resource-actions">
              <a
                href={`${process.env.BASE_URL || ""}${course.project.downloadPath}`}
                download
              >
                Download the project ZIP ↗
              </a>
              <Link href="/guide">Prerequisites, glossary & study guide →</Link>
              <a href={course.project.sourceUrl}>Browse the project source ↗</a>
            </div>
          </section>
          <div className="day-roadmap" aria-label="Four-day learning outcomes">
            {course.days.map((day) => (
              <article key={day.name}>
                <span className="eyebrow">{day.name}</span>
                <h3>{day.title}</h3>
                <p>{day.outcome}</p>
              </article>
            ))}
          </div>
          <section
            id="curriculum"
            className="curriculum"
            aria-labelledby="curriculum-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">The learning path</p>
                <h2 id="curriculum-title">Course curriculum</h2>
              </div>
              <p>{all.length} lessons · 8 milestones</p>
            </div>
            <div className="learning-progress">
              <div>
                <strong>
                  {done} of {all.length} marked complete
                </strong>
                <p>
                  {persistent
                    ? "Saved in this browser. Completion is your self-assessment, not a grade."
                    : "Storage is unavailable. Progress lasts for this visit only."}
                </p>
              </div>
              <progress
                aria-label="Lessons marked complete"
                value={done}
                max={all.length}
              />
              {done > 0 && (
                <button onClick={() => setConfirmReset(true)}>
                  Reset progress
                </button>
              )}
              {confirmReset && (
                <div className="reset-confirm">
                  <span>Clear completion and resume history?</span>
                  <button
                    onClick={() => {
                      reset();
                      setConfirmReset(false);
                    }}
                  >
                    Clear progress
                  </button>
                  <button onClick={() => setConfirmReset(false)}>
                    Keep progress
                  </button>
                </div>
              )}
            </div>
            <div className="curriculum-controls">
              <label>
                Find a lesson
                <input
                  type="search"
                  placeholder="Try state, Ansible, or Day 2"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label>
                Show
                <select
                  aria-label="Show"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All lessons</option>
                  <option value="core">Core path</option>
                  <option value="workshop">Workshops</option>
                  <option value="assignment">Assignments</option>
                  <option value="extension">Extensions</option>
                </select>
              </label>
            </div>
            <p className="search-status" role="status">
              {resultCount} {resultCount === 1 ? "lesson" : "lessons"} shown
            </p>
            {!visible.length && (
              <div className="empty-results">
                <h3>No matching lessons</h3>
                <p>Try a broader topic or show all lesson types.</p>
                <button
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Clear search and filters
                </button>
              </div>
            )}
            <div className="curriculum-sections">
              {visible.map((section) => (
                <section
                  className="curriculum-section"
                  key={section.slug}
                  aria-labelledby={`section-${section.order}`}
                >
                  <div className="milestone-heading">
                    <span className="milestone-number">{section.order}</span>
                    <div>
                      <p className="eyebrow">{section.day}</p>
                      <h3 id={`section-${section.order}`}>
                        {section.title.replace(/^Day \d:\s*/, "")}
                      </h3>
                    </div>
                  </div>
                  <ol>
                    {section.lessons.map((lesson) => (
                      <li key={lesson.fullSlug}>
                        <Link href={lesson.fullSlug}>
                          <span>
                            <strong>{lesson.title}</strong>
                            <small>{lesson.description}</small>
                          </span>
                          <span
                            className={`kind-badge kind-${lesson.track === "extension" ? "extension" : lesson.kind}`}
                          >
                            {lesson.track === "extension"
                              ? "Extension"
                              : lesson.kind === "concept"
                                ? "Core"
                                : lesson.kind === "workshop"
                                  ? "Workshop"
                                  : "Assignment"}
                          </span>
                          <span
                            className="lesson-state"
                            aria-label={
                              progress.completed.includes(lesson.fullSlug)
                                ? "Marked complete"
                                : "Open lesson"
                            }
                          >
                            {progress.completed.includes(lesson.fullSlug)
                              ? "✓"
                              : "→"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          </section>
          <Instructor />
          <section className="course-expectations">
            <h2>Build confidence through evidence.</h2>
            <p>
              The local track needs no AWS account. The cloud track can incur
              charges and requires a sandbox. Finishing the core project
              demonstrates specific skills; production readiness requires
              additional controls and testing.
            </p>
            <Link href="/guide#choose-your-path">
              Choose the path that fits your setup →
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
export async function getStaticProps() {
  return { props: { sections: await getLessons() } };
}
