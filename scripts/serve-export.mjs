// Local-only static export server used by the browser checks.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
const root = path.resolve("out");
const { productionBaseUrl: base } = JSON.parse(
  await fs.readFile("course.json", "utf8"),
);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json",
  ".zip": "application/zip",
  ".woff2": "font/woff2",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      let name = decodeURIComponent(url.pathname);
      if (name === "/") {
        res.writeHead(302, { Location: `${base}/` });
        res.end();
        return;
      }
      if (!name.startsWith(`${base}/`) && name !== base) {
        res.writeHead(404);
        res.end();
        return;
      }
      name = name.slice(base.length) || "/";
      let target = path.resolve(root, `.${name}`);
      if (!target.startsWith(`${root}/`) && target !== root) {
        res.writeHead(403);
        res.end();
        return;
      }
      if (target === root || name.endsWith("/"))
        target = path.join(target, "index.html");
      else if (!path.extname(target)) target += ".html";
      const content = await fs.readFile(target);
      res.writeHead(200, {
        "Content-Type":
          types[path.extname(target)] || "application/octet-stream",
      });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(4173, "127.0.0.1");
