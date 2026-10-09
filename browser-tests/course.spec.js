import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const prefix = "/infra-automation-with-tf";
const lessonRoutes = fs.readdirSync("out/lessons").flatMap((section) =>
  fs
    .readdirSync(`out/lessons/${section}`)
    .filter((f) => f.endsWith(".html"))
    .map((f) => `lessons/${section}/${f.slice(0, -5)}`),
);
const first =
  "lessons/day-1-foundations-and-architecture/welcome-and-instructor-introduction";
const assignment =
  "lessons/day-4-ansible-integration-and-orchestration/mini-assignment";
const errors = [];
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on("pageerror", (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

for (const width of [1440, 390]) {
  test(`all exported learning pages render at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    for (const route of ["", "guide", ...lessonRoutes]) {
      await page.goto(route || "./");
      await expect(page.locator("main h1")).toHaveCount(1);
      await page.evaluate(() => {
        for (const image of document.images) image.loading = "eager";
      });
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              [...document.images].filter(
                (img) => !img.complete || img.naturalWidth === 0,
              ).length,
          ),
        )
        .toBe(0);
      const result = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        broken: [...document.images]
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.src),
      }));
      expect(result, route).toEqual({ overflow: false, broken: [] });
    }
  });
}

test("search, filters, empty results and keyboard entry work", async ({
  page,
}) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(
    page.getByText("Skip to content", { exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.getByLabel("Show", { exact: true }).selectOption("assignment");
  await expect(page.getByRole("status")).toHaveText("8 lessons shown");
  await page.getByLabel("Find a lesson").fill("day 2");
  await expect(page.getByRole("status")).toHaveText("2 lessons shown");
  await page.getByLabel("Find a lesson").fill("no-such-course-topic");
  await expect(
    page.getByRole("heading", { name: "No matching lessons" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(page.getByRole("status")).toHaveText("49 lessons shown");
});

test("completion survives reload, resume returns to the lesson, and reset is deliberate", async ({
  page,
}) => {
  await page.goto(first);
  await page
    .getByRole("button", { name: "Mark complete", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Marked complete" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Marked complete" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("./");
  await expect(page.getByText("1 of 49 marked complete")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Resume learning" }),
  ).toHaveAttribute("href", `${prefix}/${first}`);
  await page.getByRole("button", { name: "Reset progress" }).click();
  await page.getByRole("button", { name: "Keep progress" }).click();
  await expect(page.getByText("1 of 49 marked complete")).toBeVisible();
  await page.getByRole("button", { name: "Reset progress" }).click();
  await page
    .getByRole("button", { name: "Clear progress", exact: true })
    .click();
  await expect(page.getByText("0 of 49 marked complete")).toBeVisible();
});

test("corrupt or denied storage cannot break lesson controls", async ({
  browser,
}) => {
  for (const mode of ["corrupt", "blocked"]) {
    const context = await browser.newContext();
    await context.addInitScript((mode) => {
      if (mode === "corrupt")
        localStorage.setItem("courseops-progress-v1", "{broken");
      else {
        Storage.prototype.getItem = () => {
          throw new Error("denied");
        };
        Storage.prototype.setItem = () => {
          throw new Error("denied");
        };
      }
    }, mode);
    const page = await context.newPage();
    const failures = [];
    page.on("pageerror", (e) => failures.push(e.message));
    await page.goto(`http://127.0.0.1:4173${prefix}/${assignment}`);
    await page
      .getByRole("button", { name: "Mark complete", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Marked complete" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Activate dark mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(failures).toEqual([]);
    await context.close();
  }
});

test("progress updates preserve code copying; hints and the ZIP work", async ({
  page,
}) => {
  await page.goto(assignment);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.copied = text;
        },
      },
    }),
  );
  await page
    .getByRole("button", { name: "Mark complete", exact: true })
    .click();
  const code = await page.locator("pre code").first().textContent();
  await page.locator(".div-copy button").first().click();
  expect(await page.evaluate(() => window.copied)).toBe(code);
  await page.locator(".assignment-hint summary").first().click();
  await expect(page.locator(".assignment-hint").first()).toHaveAttribute(
    "open",
    "",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download the lab bundle" }).click();
  expect((await download).suggestedFilename()).toBe("courseops-labs.zip");
});

test("new surfaces pass focused automated accessibility checks in both themes", async ({
  page,
}) => {
  for (const route of ["", "guide", first, assignment]) {
    await page.goto(route || "./");
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (theme) => document.documentElement.setAttribute("data-theme", theme),
        theme,
      );
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        `${route}: ${theme}`,
      ).toEqual([]);
    }
  }
});

test("mobile section navigation exposes the current lesson and extension labels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(first);
  await page.locator(".mobile-section-nav summary").click();
  await expect(
    page.locator('.mobile-section-nav [aria-current="page"]'),
  ).toBeVisible();
  await expect(
    page.locator(".mobile-section-nav .nav-extension").first(),
  ).toBeVisible();
});
