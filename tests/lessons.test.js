import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { addLessonHeadings, getLesson, getLessons } from '../data/lesson.js';

test('heading anchors are unique, readable, and ignore inline markup', () => {
  const { html, headings } = addLessonHeadings('<h2>A &amp; B</h2><h2>A &amp; B</h2><h2><code>for_each</code></h2>');
  assert.deepEqual(headings, [
    { id: 'a-b', text: 'A & B' },
    { id: 'a-b-2', text: 'A & B' },
    { id: 'for-each', text: 'for_each' },
  ]);
  assert.match(html, /<h2 id="for-each"><code>for_each<\/code><\/h2>/);
});

test('all lessons render reading aids, valid images, and sequential navigation under the Pages base path', async () => {
  const previous = process.env.BASE_URL;
  const config = JSON.parse(await fs.readFile('course.json', 'utf8'));
  process.env.BASE_URL = config.productionBaseUrl;
  try {
    const sections = await getLessons();
    const entries = sections.flatMap(section => section.lessons.map(lesson => ({ section, lesson })));
    assert.ok(entries.length > 0);
    for (const [index, { section, lesson }] of entries.entries()) {
      const post = await getLesson(section.slug, lesson.slug);
      assert.ok(post, lesson.fullSlug);
      assert.match(post.html, /class="lesson-goal"/);
      assert.match(post.html, /<details class="knowledge-check">/);
      assert.equal(new Set(post.headings.map(h => h.id)).size, post.headings.length);
      for (const { id } of post.headings) assert.ok(post.html.includes(`id="${id}"`));
      for (const [, src] of post.html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
        assert.ok(src.startsWith(`${config.productionBaseUrl}/images/`), src);
        await fs.access(path.join('public', src.slice(config.productionBaseUrl.length)));
      }
      assert.equal(post.prevSlug, entries[index - 1]?.lesson.fullSlug || null);
      assert.equal(post.nextSlug, entries[index + 1]?.lesson.fullSlug || null);
    }
  } finally {
    if (previous === undefined) delete process.env.BASE_URL;
    else process.env.BASE_URL = previous;
  }
});
