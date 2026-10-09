import getCourseConfig from "../data/course";
export default function Instructor() {
  const course = getCourseConfig();
  const author = course.authors[0];
  return (
    <section className="instructor-profile" aria-labelledby="instructor-title">
      <img
        src={`${process.env.BASE_URL || ""}/images/${author.image}`}
        alt={author.name}
        width="160"
        height="160"
        loading="lazy"
      />
      <div>
        <p className="eyebrow">Your instructor</p>
        <h2 id="instructor-title">{author.name}</h2>
        <p className="instructor-role">{author.company}</p>
        <p>{author.bio}</p>
        <p>{author.teachingNote}</p>
        <ul className="credential-list" aria-label="Certifications earned">
          {author.credentials.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="text-links">
          <a href={`https://github.com/${course.social.github}`}>GitHub</a>
          <a href={`https://linkedin.com/in/${course.social.linkedin}`}>
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
