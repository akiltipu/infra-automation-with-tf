import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { parseProgress, filterLessons } from "../data/progress.js";
import { getLessons, renderCourseMarkdown } from "../data/lesson.js";

test("progress accepts valid routes and recovers from corrupt or unrelated storage", () => {
  for (const value of [null, "", "{broken", "null", "[]", "123"])
    assert.deepEqual(parseProgress(value), {
      completed: [],
      lastVisited: null,
    });
  const route = "/lessons/day-1-foundations-and-architecture/project-workshop";
  assert.deepEqual(
    parseProgress(
      JSON.stringify({
        completed: [route, route, null, {}, "https://other.test", "/guide"],
        lastVisited: route,
      }),
    ),
    { completed: [route], lastVisited: route },
  );
  assert.equal(
    parseProgress('{"lastVisited":"javascript:alert(1)"}').lastVisited,
    null,
  );
});

test("curriculum search combines case-insensitive terms with the selected track", async () => {
  const sections = await getLessons();
  assert.equal(
    filterLessons(sections, "", "assignment").flatMap((s) => s.lessons).length,
    8,
  );
  assert.equal(
    filterLessons(sections, "DAY 2", "assignment").flatMap((s) => s.lessons)
      .length,
    2,
  );
  assert.ok(
    filterLessons(sections, "  AnSiBlE ", "workshop").every((s) =>
      s.lessons.every((l) => l.kind === "workshop"),
    ),
  );
  assert.ok(
    filterLessons(sections, "", "core").every((s) =>
      s.lessons.every((l) => l.track === "core"),
    ),
  );
  assert.deepEqual(
    filterLessons(sections, "not-a-real-lesson-query", "all"),
    [],
  );
});

test("learning guide links and headings use the same static-site renderer", async () => {
  const previous = process.env.BASE_URL;
  process.env.BASE_URL = "/infra-automation-with-tf";
  try {
    const guide = renderCourseMarkdown(
      await fs.readFile("content/learning-guide.md", "utf8"),
    );
    assert.ok(guide.headings.some((h) => h.id === "choose-your-path"));
    assert.match(
      guide.html,
      /href="\/infra-automation-with-tf\/downloads\/courseops-labs.zip"/,
    );
    assert.match(
      renderCourseMarkdown("[Guide](/guide#choose-your-path)").html,
      /href="\/infra-automation-with-tf\/guide#choose-your-path"/,
    );
  } finally {
    if (previous === undefined) delete process.env.BASE_URL;
    else process.env.BASE_URL = previous;
  }
});
