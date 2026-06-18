"use client";

import { useEffect, useRef } from "react";

export function BlogArticle({ html }: { html: string }) {
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const blocks = Array.from(article.querySelectorAll("pre"));
    blocks.forEach((block) => {
      if (block.dataset.copyEnhanced === "true") return;

      block.dataset.copyEnhanced = "true";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-button";
      button.setAttribute("aria-label", "复制代码");
      button.dataset.label = "复制";
      button.innerHTML = '<span class="code-copy-icon" aria-hidden="true"></span>';

      button.addEventListener("click", async () => {
        const code = block.querySelector("code")?.textContent || "";
        await navigator.clipboard.writeText(code);
        button.dataset.label = "已复制";
        window.setTimeout(() => {
          button.dataset.label = "复制";
        }, 1600);
      });

      block.appendChild(button);
    });
  }, [html]);

  return <article ref={articleRef} className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
