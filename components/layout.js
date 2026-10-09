import { useState } from "react";

import Footer from "./footer";
import { ProgressProvider } from "../context/progressContext";
import Header from "./header";
import getCourseConfig from "../data/course";
import { Provider as HeaderProvider } from "../context/headerContext";
import { Provider as CourseInfoProvider } from "../context/courseInfoContext";

function Layout({ children, className = "" }) {
  const courseInfo = getCourseConfig();
  const headerHook = useState({});
  return (
    <CourseInfoProvider value={courseInfo}>
      <HeaderProvider value={headerHook}>
        <ProgressProvider>
          <div className={`remix-app ${className}`.trim()}>
            <Header title={courseInfo.title} />
            <div className="content-container">
              <main className="main" id="main-content" tabIndex={-1}>
                {children}
              </main>
            </div>
            <Footer
              twitter={courseInfo.social.twitter}
              github={courseInfo.social.github}
              linkedin={courseInfo.social.linkedin}
              bluesky={courseInfo.social.bluesky}
            />
          </div>
        </ProgressProvider>
      </HeaderProvider>
    </CourseInfoProvider>
  );
}

export default function App({ children, className }) {
  return <Layout className={className}>{children}</Layout>;
}
