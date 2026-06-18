import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/articles";
import { Editor } from "./Editor";

export default async function WritePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isNew = slug === "new";
  const article = isNew ? null : await getArticle(slug);

  if (!isNew && !article) {
    notFound();
  }

  return (
    <main className="shell wide">
      <header className="topbar compact">
        <div>
          <p className="eyebrow">文章编辑</p>
          <h1>{isNew ? "新建文章" : "编辑文章"}</h1>
        </div>
        <Link className="button" href="/">
          返回首页
        </Link>
      </header>

      <Editor
        isNew={isNew}
        initialArticle={{
          title: article?.title || "",
          slug: article?.slug || "",
          status: article?.status || "draft",
          category: article?.category || "未分类",
          content: article?.content || "# 新文章\n\n从这里开始写。"
        }}
      />
    </main>
  );
}
