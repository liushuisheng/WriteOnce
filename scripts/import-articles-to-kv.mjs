import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const articlesDir = join(rootDir, "content", "articles");
const wranglerConfigPath = join(rootDir, "wrangler.jsonc");
const outputDir = join(rootDir, ".wrangler");
const outputPath = join(outputDir, "articles-bulk.json");
const prepareOnly = process.argv.includes("--prepare-only");

function stripJsonComments(value) {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const next = value[index + 1];

    if (inString) {
      result += char;
      escaped = char === "\\" && !escaped;
      if (char === "\"" && !escaped) {
        inString = false;
      } else if (char !== "\\") {
        escaped = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      result += char;
      continue;
    }

    if (char === "/" && next === "/") {
      while (index < value.length && value[index] !== "\n") {
        index += 1;
      }
      result += "\n";
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (index < value.length && !(value[index] === "*" && value[index + 1] === "/")) {
        index += 1;
      }
      index += 1;
      continue;
    }

    result += char;
  }

  return result;
}

function getArticlesNamespaceId() {
  const config = JSON.parse(stripJsonComments(readFileSync(wranglerConfigPath, "utf8")));
  const namespace = config.kv_namespaces?.find((item) => item.binding === "ARTICLES");

  if (!namespace?.id) {
    throw new Error("Missing ARTICLES namespace id in wrangler.jsonc.");
  }

  return namespace.id;
}

function getFrontmatterValue(raw, name) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return null;
  }

  const line = match[1].split(/\r?\n/).find((item) => item.startsWith(`${name}:`));
  return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, "") || null;
}

function createBulkEntries() {
  return readdirSync(articlesDir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => {
      const raw = readFileSync(join(articlesDir, file), "utf8");
      const slug = getFrontmatterValue(raw, "slug") || basename(file, ".md");

      if (!/^[a-z0-9-]+$/.test(slug)) {
        throw new Error(`Invalid article slug "${slug}" in ${file}.`);
      }

      return {
        key: `article:${slug}`,
        value: raw
      };
    });
}

const namespaceId = getArticlesNamespaceId();
const entries = createBulkEntries();

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");

console.log(`Prepared ${entries.length} article(s) for KV namespace ${namespaceId}.`);
console.log(`Bulk file: ${outputPath}`);
entries.forEach((entry) => console.log(`- ${entry.key}`));

if (!prepareOnly) {
  const result = spawnSync(
    "npx",
    ["wrangler", "kv", "bulk", "put", "--namespace-id", namespaceId, outputPath],
    { shell: true, stdio: "inherit" }
  );

  process.exit(result.status ?? 1);
}
