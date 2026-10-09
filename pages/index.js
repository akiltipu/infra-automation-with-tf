import Head from "next/head";
import Link from "next/link";

import { getLessons } from "../data/lesson";

import Corner from "../components/corner";
import getCourseConfig from "../data/course";

export default function Lessons({ sections }) {
  const courseInfo = getCourseConfig();

  const dayTitles = {
    "Day 1": "Terraform Foundations, Architecture & Core Workflow",
    "Day 2": "State Management & Multi-Environment Architecture",
    "Day 3": "Reusable Modules & Advanced HCL Expressions",
    "Day 4": "Ansible Integration, Enterprise CI/CD & Policy as Code",
  };

  const dayOutcomes = {
    "Day 1": "Read HCL, understand Terraform's engine, and deploy your first stack",
    "Day 2": "Protect state, recover from incidents, and isolate environments",
    "Day 3": "Design reusable modules and refactor safely with advanced HCL",
    "Day 4": "Join Terraform, Ansible, CI/CD, security, and policy into one workflow",
  };

  const groupedDaysMap = new Map();
  sections.forEach((section) => {
    const day = section.day || "Day 1";
    if (!groupedDaysMap.has(day)) {
      groupedDaysMap.set(day, []);
    }
    groupedDaysMap.get(day).push(section);
  });

  const groupedDays = Array.from(groupedDaysMap.entries()).map(
    ([day, daySections]) => ({
      day,
      title: dayTitles[day] || day,
      outcome: dayOutcomes[day] || "Build and verify the day's practical outcome",
      sections: daySections,
    })
  );

  return (
    <>
      <Head>
        <title>{courseInfo.title}</title>
        <meta name="description" content={courseInfo.description}></meta>
        <meta name="keywords" content={courseInfo.keywords.join(",")}></meta>
        <meta name="og:description" content={courseInfo.description}></meta>
        <meta name="og:title" content={courseInfo.title}></meta>
        <meta
          name="og:image"
          content={`${process.env.BASE_URL}/images/terraform-course-hero-v2.png`}
        ></meta>
        <meta name="twitter:card" content="summary_large_image"></meta>
      </Head>
      <div>
        <div className="jumbotron">
          <div className="courseInfo">
            <div className="courseInfo-inner">
              <h1>{courseInfo.title}</h1>
              <p className="hero-eyebrow">4-day live, hands-on course</p>
              <h2>{courseInfo.subtitle}</h2>
              <div className="hero-highlights" aria-label="Course highlights">
                <span><i className="fas fa-terminal" /> Runnable project labs</span>
                <span><i className="fas fa-triangle-exclamation" /> Failure scenarios</span>
                <span><i className="fas fa-building-shield" /> Production patterns</span>
              </div>
              <div className="authors">
                {courseInfo.authors.map((author) => (
                  <div className="author" key={author.name}>
                    <div className="image">
                      <img
                        src={`${process.env.BASE_URL}/images/${author.image}`}
                        alt={`${author.name} image`}
                        className="image"
                      />
                    </div>
                    <div className="info">
                      <div className="name">{author.name}</div>
                      <div className="company">{author.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="courseIcon">
            <img
              src={`${process.env.BASE_URL}/images/terraform-course-hero-v2.png`}
              alt="Infrastructure blocks connected to cloud, servers, code, and a database"
            />
          </div>
        </div>
        {courseInfo.frontendMastersLink ? (
          <a href={courseInfo.frontendMastersLink} className="cta-btn">
            Watch on Frontend Masters
          </a>
        ) : null}
        <div className="main-card">
          {courseInfo.project && (
            <section className="project-overview" aria-labelledby="project-title">
              <p className="hero-eyebrow">One project · Eight milestones</p>
              <h2 id="project-title">Build {courseInfo.project.name}</h2>
              <p>{courseInfo.project.description}</p>
              <ul>{courseInfo.project.paths.map(item => <li key={item}>{item}</li>)}</ul>
              <div className="project-actions">
                <Link href={courseInfo.project.startPath}>Start the project</Link>
                <a href={`${process.env.BASE_URL || ""}${courseInfo.project.downloadPath}`} download>Download labs (ZIP)</a>
                <a href={courseInfo.project.sourceUrl}>Browse source</a>
              </div>
              <p className="track-help">Follow Core → Workshop → Assignment in each section. Extension pages are follow-up reading; the capstone is a separate assessment.</p>
            </section>
          )}
          <h1 className="lesson-title">Table of Contents</h1>
          <div className="lesson-content">
            {groupedDays.map(({ day, title: dayTitle, outcome, sections: daySections }) => (
              <div key={day} className="day-group">
                <div className="day-header">
                  <span className="day-badge">{day}</span>
                  <div>
                    <h2 className="day-title">{dayTitle}</h2>
                    <p className="day-outcome">{outcome}</p>
                  </div>
                </div>
                <ol className="sections-name">
                  {daySections.map((section) => (
                    <li key={section.slug}>
                      <div className="lesson-details">
                        <div className="lesson-preface">
                          <i className={`fas fa-${section.icon}`}></i>
                        </div>
                        <div className="lesson-text">
                          <h2 className="lesson-section-title">{section.title}</h2>
                          <ol>
                            {section.lessons.map((lesson) => (
                              <li key={lesson.slug}>
                                <Link href={lesson.fullSlug}>{lesson.title}</Link>
                                <span className={`lesson-track track-${lesson.kind === "concept" ? lesson.track : lesson.kind}`}>
                                  {lesson.kind === "assignment" ? "Assignment" : lesson.kind === "workshop" ? "Workshop" : lesson.track === "extension" ? "Extension" : "Core"}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <Corner />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const sections = await getLessons();
  return {
    props: {
      sections,
    },
  };
}
