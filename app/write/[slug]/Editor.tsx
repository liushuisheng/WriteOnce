"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MarkdownEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <div className="markdown-editor-loading">正在准备编辑器…</div>
});

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
  const savedSnapshot = useRef("");

  const suggestedSlug = useMemo(() => createSlug(title), [title]);
  const snapshot = useMemo(
    () => JSON.stringify({ title, slug: slug || suggestedSlug, content, status, category }),
    [title, slug, suggestedSlug, content, status, category]
  );
  const isDirty = snapshot !== savedSnapshot.current;
  const statistics = useMemo(() => {
    const plainText = content
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[#>*_`\[\]()!-]/g, " ")
      .trim();
    const chineseCharacters = plainText.match(/[\u3400-\u9fff]/g)?.length || 0;
    const words = plainText.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length || 0;

    return {
      characters: content.length,
      words: chineseCharacters + words,
      lines: content ? content.split("\n").length : 0
    };
  }, [content]);

  useEffect(() => {
    savedSnapshot.current = JSON.stringify({
      title: initialArticle.title,
      slug: initialArticle.slug || createSlug(initialArticle.title),
      content: initialArticle.content,
      status: initialArticle.status,
      category: initialArticle.category
    });
  }, [initialArticle]);

  const save = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setMessage("");

    try {
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

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setMessage(payload.error || "保存失败");
        return;
      }

      const payload = (await response.json()) as { slug: string };
      savedSnapshot.current = snapshot;
      setMessage("已保存");
      router.push(`/write/${payload.slug}`);
      router.refresh();
    } catch {
      setMessage("网络异常，请稍后重试");
    } finally {
      setSaving(false);
    }
  }, [saving, title, slug, suggestedSlug, content, status, category, snapshot, router]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [save]);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty]);

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
        <div className="editor-context-bar">
          <span className="live-preview-label"><i />实时预览</span>
          <span>支持 Markdown · Ctrl/⌘ + S 保存</span>
        </div>
        <div className="markdown-editor-wrap" data-color-mode="light">
          <MarkdownEditor
            value={content}
            onChange={(value) => setContent(value || "")}
            preview="live"
            height="68vh"
            minHeight={480}
            maxHeight={1000}
            visibleDragbar={false}
            textareaProps={{
              "aria-label": "Markdown 正文编辑器",
              placeholder: "开始写作，右侧会实时呈现排版效果…",
              spellCheck: false
            }}
          />
        </div>
        <footer className="editor-statusbar">
          <span>{isDirty ? "有未保存的修改" : "所有修改均已保存"}</span>
          <span>{statistics.words} 字 · {statistics.characters} 字符 · {statistics.lines} 行</span>
        </footer>
      </section>

      <aside className="publish-panel">
        <div className="publish-panel-heading">
          <strong>发布设置</strong>
          <span className={isDirty ? "save-state dirty" : "save-state"}>{isDirty ? "未保存" : "已保存"}</span>
        </div>
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
        <button className="button primary full editor-save-button" onClick={() => void save()} disabled={saving || !isDirty}>
          {saving ? "保存中" : "保存"}
        </button>
        {message ? <p className="message">{message}</p> : null}
      </aside>
    </div>
  );
}
