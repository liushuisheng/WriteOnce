import Link from "next/link";
import { ArticleSwitcher } from "@/app/components/ArticleSwitcher";
import { Logo } from "@/app/components/Logo";
import { ScrollState } from "@/app/components/ScrollState";
import { listArticles, getArticle } from "@/lib/articles";
import { BlogArticle } from "./blog/[slug]/BlogArticle";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ article?: string }>;
}) {
  const articles = (await listArticles()).filter((article) => article.status === "published");
  const { article: selectedSlug } = await searchParams;
  const selectedMeta = articles.find((article) => article.slug === selectedSlug) || articles[0];
  const selectedArticle = selectedMeta ? await getArticle(selectedMeta.slug) : null;

  return (
    <main className="home-shell">
      <ScrollState />
      <nav className="home-nav">
        <Link className="home-nav-brand" href="/">
          <Logo />
          <span className="brand-copy">
            <span className="brand-copy-title">文枢</span>
            <span className="brand-slogan">写一次，处处可达</span>
          </span>
        </Link>
        {selectedArticle ? (
          <>
            <div className="home-nav-current">
              <span>正在阅读</span>
              <strong>{selectedArticle.title}</strong>
            </div>
            <div className="home-nav-links">
              <Link href="/">文章</Link>
              <Link href="/blog">归档</Link>
              <Link href="/admin">管理</Link>
            </div>
          </>
        ) : null}
      </nav>

      {selectedArticle ? (
        <section className="home-reader">
          <aside className="home-toc" aria-label="文章导览">
            <div className="home-toc-inner">
              <p className="home-sidebar-title">文章导览</p>
              <nav className="toc-list">
                {selectedArticle.headings.length > 0 ? (
                  selectedArticle.headings.map((heading) => (
                    <a className={`toc-link depth-${heading.depth}`} href={`#${heading.id}`} key={heading.id}>
                      {heading.text}
                    </a>
                  ))
                ) : (
                  <span className="toc-empty">暂无段落标题</span>
                )}
              </nav>
            </div>
          </aside>

          <article className="home-main">
            <header className="home-article-header">
              <p className="category-pill">{selectedArticle.category}</p>
              <h1>{selectedArticle.title}</h1>
              <p>{selectedArticle.updatedAt}</p>
            </header>
            <div className="home-paper">
              <BlogArticle html={selectedArticle.html} />
            </div>
          </article>

          <aside className="home-sidebar" aria-label="其他文章">
            <div className="home-sidebar-backdrop" aria-hidden="true"></div>
            <ArticleSwitcher articles={articles} selectedSlug={selectedArticle.slug} />
          </aside>
        </section>
      ) : (
        <section className="home-empty">
          <Logo />
          <h1>还没有已发布文章</h1>
          <p>文章发布后，首页会默认展示最新一篇。</p>
        </section>
      )}
    </main>
  );
}
