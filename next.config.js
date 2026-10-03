import { readFileSync } from "fs";
import path from "path";

const buffer = readFileSync(path.join(process.cwd(), "./course.json"));
const course = JSON.parse(buffer);
const BASE_URL = course?.productionBaseUrl || "";
const ACTIVE_BASE_URL = process.env.NODE_ENV === "development" ? "" : BASE_URL;

const config = {
  output: "export",
  basePath: ACTIVE_BASE_URL,
  env: {
    BASE_URL: ACTIVE_BASE_URL,
  },
};

export default config;
