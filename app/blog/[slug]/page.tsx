import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/app/components/Logo";
import { getArticle } from "@/lib/articles";
import { BlogArticle } from "./BlogArticle";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="blog-shell">
      <nav className="blog-nav">
        <Link className="blog-brand" href="/">
          <Logo />
        </Link>
        <div className="blog-nav-actions">
          <Link href="/">公开首页</Link>
          <Link href={`/write/${article.slug}`}>编辑</Link>
        </div>
      </nav>
      <header className="blog-header">
        <div className="blog-header-content">
          <p className="blog-kicker">文章阅读</p>
          <h1>{article.title}</h1>
          <div className="blog-meta">
            <span>{article.status === "published" ? "已发布" : "草稿"}</span>
            <span>{article.updatedAt}</span>
          </div>
        </div>
        <div className="blog-header-logo">
          <Logo showText={false} />
        </div>
      </header>
      <section className="blog-paper">
        <BlogArticle html={article.html} />
      </section>
    </main>
  );
}
