import { NextResponse } from "next/server";
import { unpublishArticle } from "@/lib/articles";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const article = await unpublishArticle(slug);
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
