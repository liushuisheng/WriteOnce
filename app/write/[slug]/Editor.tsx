"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = {
  initialArticle: {
    title: string;
    slug: string;
    status: "draft" | "published";
    category: string;
    content: string;
  };
  isNew: boolean;
};

function createSlug(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || `wenzhang-${Date.now()}`;
}

export function Editor({ initialArticle, isNew }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialArticle.title);
  const [slug, setSlug] = useState(initialArticle.slug);
  const [content, setContent] = useState(initialArticle.content);
  const [status, setStatus] = useState(initialArticle.status);
  const [category, setCategory] = useState(initialArticle.category);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const suggestedSlug = useMemo(() => createSlug(title), [title]);

  async function save() {
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: slug || suggestedSlug,
        content,
        status,
        category
      })
    });

    setSaving(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setMessage(payload.error || "保存失败");
      return;
    }

    const payload = (await response.json()) as { slug: string };
    setMessage("已保存");
    router.push(`/write/${payload.slug}`);
    router.refresh();
  }

  return (
    <div className="editor-layout">
      <section className="editor-main">
        <input
          className="title-input"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (isNew) setSlug(createSlug(event.target.value));
          }}
          placeholder="文章标题"
        />
        <textarea
          className="markdown-input"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          spellCheck={false}
        />
      </section>

      <aside className="publish-panel">
        <label>
          分类
          <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="例如：技术笔记" />
        </label>
        <label>
          状态
          <select value={status} onChange={(event) => setStatus(event.target.value as "draft" | "published")}>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
        </label>
        <button className="button primary full" onClick={save} disabled={saving}>
          {saving ? "保存中" : "保存"}
        </button>
        {message ? <p className="message">{message}</p> : null}
      </aside>
    </div>
  );
}
