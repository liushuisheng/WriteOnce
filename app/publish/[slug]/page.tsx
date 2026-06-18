import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/articles";
import { Publisher } from "./Publisher";

export default async function PublishPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="shell wide">
      <header className="topbar compact">
        <div>
          <p className="eyebrow">发布文章</p>
          <h1>{article.title}</h1>
        </div>
        <div className="row-actions">
          <Link className="button" href={`/blog/${article.slug}`}>
            预览博客
          </Link>
          <Link className="button" href="/">
            返回列表
          </Link>
        </div>
      </header>
      <Publisher html={article.html} slug={article.slug} status={article.status} />
    </main>
  );
}
