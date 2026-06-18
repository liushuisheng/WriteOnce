"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function Publisher({ html, slug, status }: { html: string; slug: string; status: "draft" | "published" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);

  async function copyHtml() {
    await navigator.clipboard.writeText(html);
    setMessage("公众号排版内容已复制");
  }

  async function publish() {
    setPublishing(true);
    setMessage("");

    const response = await fetch(`/api/articles/${slug}/publish`, {
      method: "POST"
    });

    setPublishing(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setMessage(payload.error || "发布失败");
      return;
    }

    setMessage("博客已发布");
    router.refresh();
  }

  return (
    <section className="publish-grid">
      <div className="publish-option">
        <h2>博客</h2>
        <p>{status === "published" ? "这篇文章已经发布，访客可以在首页看到。" : "发布后，访客可以在首页看到这篇文章。"}</p>
        <button className="button primary" onClick={publish} disabled={publishing || status === "published"}>
          {status === "published" ? "已发布" : publishing ? "发布中" : "发布到博客"}
        </button>
      </div>
      <div className="publish-option">
        <h2>公众号</h2>
        <p>先复制排版内容到公众号编辑器。自动生成草稿可以作为下一阶段再接入。</p>
        <button className="button primary" onClick={copyHtml}>
          复制公众号排版内容
        </button>
        {message ? <p className="message">{message}</p> : null}
      </div>
      <textarea className="html-output" readOnly value={html} />
    </section>
  );
}
