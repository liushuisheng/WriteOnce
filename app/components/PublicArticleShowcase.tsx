import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import type { ArticleMeta } from "@/lib/articles";

export function PublicArticleShowcase({ articles }: { articles: ArticleMeta[] }) {
  return (
    <main className="public-shell">
      <nav className="public-nav">
        <Link href="/">
          <Logo />
        </Link>
        <Link className="button" href="/admin">
          管理文章
        </Link>
      </nav>

      <header className="public-hero">
        <p className="blog-kicker">公开文章</p>
        <h1>所有已发布内容</h1>
        <p>这里展示已经发布的文章，访客可以从这个页面进入阅读。</p>
      </header>

      <section className="public-list">
        {articles.length > 0 ? (
          articles.map((article) => (
            <Link className="public-card" href={`/blog/${article.slug}`} key={article.slug}>
              <div>
                <h2>{article.title}</h2>
                <p>{article.updatedAt}</p>
              </div>
              <span>阅读</span>
            </Link>
          ))
        ) : (
          <div className="empty-state">
            <h2>还没有已发布文章</h2>
            <p>文章发布后会出现在这里。</p>
          </div>
        )}
      </section>
    </main>
  );
}
