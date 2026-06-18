import { PublicArticleShowcase } from "@/app/components/PublicArticleShowcase";
import { listArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function PublicBlogPage() {
  const articles = (await listArticles()).filter((article) => article.status === "published");

  return <PublicArticleShowcase articles={articles} />;
}
