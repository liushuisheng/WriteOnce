import { NextResponse } from "next/server";
import { saveArticle } from "@/lib/articles";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      slug?: string;
      content?: string;
      status?: "draft" | "published";
      category?: string;
    };

    const article = await saveArticle({
      title: body.title || "",
      slug: body.slug || "",
      content: body.content || "",
      status: body.status === "published" ? "published" : "draft",
      category: body.category || ""
    });

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
