import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import { listArticles } from "@/lib/articles";
import { AdminArticleActions } from "./AdminArticleActions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const articles = await listArticles();

  return (
    <main className="shell">
      <header className="topbar">
        <div className="topbar-title">
          <Logo />
          <p className="eyebrow">个人内容中台</p>
          <h1>文章管理</h1>
        </div>
        <Link className="button primary" href="/write/new">
          新建文章
        </Link>
      </header>

      <section className="toolbar">
        <Link href="/admin" className="tab active">
          文章
        </Link>
        <Link href="/" className="tab">
          公开首页
        </Link>
      </section>

      <section className="article-list">
        {articles.map((article) => (
          <article className="article-row" key={article.slug}>
            <div>
              <h2>{article.title}</h2>
              <p>
                {article.status === "published" ? "已发布" : "草稿"} · {article.updatedAt}
              </p>
            </div>
            <AdminArticleActions article={article} />
          </article>
        ))}
      </section>
    </main>
  );
}
