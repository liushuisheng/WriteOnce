"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ArticleMeta } from "@/lib/articles";

export function ArticleSwitcher({
  articles,
  selectedSlug
}: {
  articles: ArticleMeta[];
  selectedSlug: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");

    function syncOpenState() {
      setOpen(!media.matches);
    }

    syncOpenState();
    media.addEventListener("change", syncOpenState);

    return () => {
      media.removeEventListener("change", syncOpenState);
    };
  }, []);

  return (
    <div className={`home-sidebar-inner home-sidebar-panel${open ? " open" : ""}`}>
      <button className="home-sidebar-summary" type="button" onClick={() => setOpen((value) => !value)}>
        <span className="home-sidebar-icon" aria-hidden="true"></span>
        <span className="home-sidebar-summary-text">{open ? "文章列表" : "其他文章"}</span>
        <span className="home-sidebar-toggle-text">{open ? "收起" : "展开"}</span>
      </button>
      <p className="home-sidebar-title">其他文章</p>
      {open ? (
        <div className="home-article-list">
          {articles.map((article) => {
            const active = article.slug === selectedSlug;
            return (
              <Link
                className={`home-article-link${active ? " active" : ""}`}
                href={active ? "/" : `/?article=${article.slug}`}
                key={article.slug}
              >
                <em>{article.category}</em>
                <span>{article.title}</span>
                <small>{article.updatedAt}</small>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
