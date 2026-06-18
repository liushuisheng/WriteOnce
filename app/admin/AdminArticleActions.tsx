"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ArticleMeta } from "@/lib/articles";

export function AdminArticleActions({ article }: { article: ArticleMeta }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function unpublish() {
    setPending(true);
    setMessage("");

    const response = await fetch(`/api/articles/${article.slug}/unpublish`, {
      method: "POST"
    });

    setPending(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setMessage(payload.error || "下架失败");
      return;
    }

    router.refresh();
  }

  return (
    <div className="row-actions action-stack">
      <Link className="button" href={`/blog/${article.slug}`}>
        预览
      </Link>
      {article.status === "draft" ? (
        <Link className="button" href={`/publish/${article.slug}`}>
          发布
        </Link>
      ) : (
        <button className="button danger" onClick={unpublish} disabled={pending}>
          {pending ? "下架中" : "下架"}
        </button>
      )}
      <Link className="button" href={`/write/${article.slug}`}>
        编辑
      </Link>
      {message ? <p className="message action-message">{message}</p> : null}
    </div>
  );
}
