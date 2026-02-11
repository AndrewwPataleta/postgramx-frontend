import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const resolveExistingPath = (paths: string[]) => {
  const filePath = paths
    .map((relativePath) => resolve(process.cwd(), relativePath))
    .find((candidate) => existsSync(candidate));

  if (!filePath) {
    throw new Error(`None of the expected locale files were found: ${paths.join(", ")}`);
  }

  return filePath;
};

const readJson = (paths: string[]) => {
  const filePath = resolveExistingPath(paths);
  return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, string>;
};

const en = readJson(["client/src/i18n/locales/en.json", "client/i18n/locales/en.json"]);
const ru = readJson(["client/src/i18n/locales/ru.json", "client/i18n/locales/ru.json"]);

const enKeys = new Set(Object.keys(en));
const ruKeys = new Set(Object.keys(ru));

const missingInRu = [...enKeys].filter((key) => !ruKeys.has(key));
const missingInEn = [...ruKeys].filter((key) => !enKeys.has(key));

if (missingInRu.length || missingInEn.length) {
  console.error("i18n key mismatch detected.");
  if (missingInRu.length) {
    console.error("Missing in ru.json:");
    missingInRu.forEach((key) => console.error(`  - ${key}`));
  }
  if (missingInEn.length) {
    console.error("Missing in en.json:");
    missingInEn.forEach((key) => console.error(`  - ${key}`));
  }
  process.exit(1);
}

console.log(`i18n parity check passed. ${enKeys.size} keys matched.`);
