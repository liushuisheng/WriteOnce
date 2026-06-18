import { promises as fs } from "node:fs";
import path from "node:path";
import { marked } from "marked";

export type ArticleMeta = {
  title: string;
  slug: string;
  status: "draft" | "published";
  updatedAt: string;
  category: string;
};

export type Article = ArticleMeta & {
  content: string;
  html: string;
  headings: ArticleHeading[];
};

export type ArticleHeading = {
  id: string;
  text: string;
  depth: number;
};

const articlesDir = path.join(process.cwd(), "content", "articles");

function parseFrontmatter(raw: string): { meta: ArticleMeta; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error("文章缺少元信息。");
  }

  const frontmatter = match[1];
  const content = match[2].trimStart();
  const entries = frontmatter
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/))
    .filter(Boolean)
    .map((item) => [item![1], item![2].replace(/^["']|["']$/g, "")]);

  const meta = Object.fromEntries(entries) as Partial<ArticleMeta>;
  if (!meta.title || !meta.slug) {
    throw new Error("文章元信息需要标题和路径标识。");
  }

  return {
    meta: {
      title: meta.title,
      slug: meta.slug,
      status: meta.status === "published" ? "published" : "draft",
      updatedAt: meta.updatedAt || new Date().toISOString().slice(0, 10),
      category: meta.category || "未分类"
    },
    content
  };
}

function toFrontmatter(article: ArticleMeta, content: string) {
  return [
    "---",
    `title: ${article.title}`,
    `slug: ${article.slug}`,
    `status: ${article.status}`,
    `updatedAt: ${article.updatedAt}`,
    `category: ${article.category}`,
    "---",
    "",
    content.trim(),
    ""
  ].join("\n");
}

function slugToFile(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("路径标识只能包含小写字母、数字和连字符。");
  }

  return path.join(articlesDir, `${slug}.md`);
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function renderMarkdown(content: string) {
  const headings: ArticleHeading[] = [];
  const renderer = new marked.Renderer();

  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const plainText = text.replace(/<[^>]+>/g, "").trim();
    const id = `section-${headings.length + 1}`;

    if (depth <= 3) {
      headings.push({ id, text: plainText, depth });
    }

    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  return {
    html: await marked.parse(content, { renderer }),
    headings: headings.map((heading) => ({
      ...heading,
      text: decodeHtmlEntities(heading.text)
    }))
  };
}

export async function listArticles(): Promise<ArticleMeta[]> {
  await fs.mkdir(articlesDir, { recursive: true });
  const files = await fs.readdir(articlesDir);
  const articles = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(articlesDir, file), "utf8");
        return parseFrontmatter(raw).meta;
      })
  );

  return articles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getArticle(slug: string): Promise<Article | null> {
  try {
    const raw = await fs.readFile(slugToFile(slug), "utf8");
    const { meta, content } = parseFrontmatter(raw);
    const rendered = await renderMarkdown(content);
    return {
      ...meta,
      content,
      html: rendered.html,
      headings: rendered.headings
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function saveArticle(input: {
  title: string;
  slug: string;
  status: "draft" | "published";
  category: string;
  content: string;
}) {
  const article = {
    title: input.title.trim(),
    slug: input.slug.trim(),
    status: input.status,
    category: input.category.trim() || "未分类",
    updatedAt: new Date().toISOString().slice(0, 10)
  };

  if (!article.title) {
    throw new Error("请输入文章标题。");
  }

  await fs.mkdir(articlesDir, { recursive: true });
  await fs.writeFile(slugToFile(article.slug), toFrontmatter(article, input.content), "utf8");
  return article;
}

export async function publishArticle(slug: string) {
  const article = await getArticle(slug);
  if (!article) {
    throw new Error("文章不存在。");
  }

  return saveArticle({
    title: article.title,
    slug: article.slug,
    status: "published",
    category: article.category,
    content: article.content
  });
}

export async function unpublishArticle(slug: string) {
  const article = await getArticle(slug);
  if (!article) {
    throw new Error("文章不存在。");
  }

  return saveArticle({
    title: article.title,
    slug: article.slug,
    status: "draft",
    category: article.category,
    content: article.content
  });
}
