import Link from "next/link";
import getCourseConfig from "../data/course";
import ThemeIcons from "./themeicons";
export default function Header() {
  const course = getCourseConfig();
  return (
    <header className="navbar site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Link
        href="/"
        className="site-brand"
        aria-label={`${course.title}: course home`}
      >
        <span aria-hidden="true" className="brand-mark">
          &gt;_
        </span>
        {course.shortTitle}
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#curriculum">Curriculum</Link>
        <Link href="/guide">Learning guide</Link>
        <ThemeIcons />
      </nav>
    </header>
  );
}
