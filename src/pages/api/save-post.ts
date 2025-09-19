import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

// Only allow in development
const isDevelopment = import.meta.env.DEV;

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const POST: APIRoute = async ({ request }) => {
  // Only allow in development
  if (!isDevelopment) {
    return new Response(
      JSON.stringify({
        error: "Create endpoint only available in development",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { frontmatter, content } = await request.json();

    if (!frontmatter.title || !content) {
      return new Response(
        JSON.stringify({ error: "Title and content are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Content is now already in markdown format from the frontend
    const markdownContent = content;

    // Generate slug from title if not provided
    const slug = frontmatter.slug || generateSlug(frontmatter.title);

    // Calculate reading time
    const readingTime = calculateReadingTime(markdownContent);

    // Create complete frontmatter
    const frontmatterString = `---
title: "${frontmatter.title}"
description: "${frontmatter.description}"
pubDate: "${frontmatter.pubDate}"
slug: "${slug}"
readingTime: ${readingTime}
tags: [${frontmatter.tags.map((tag: string) => `"${tag}"`).join(", ")}]${
      frontmatter.heroImage ? `\nheroImage: "${frontmatter.heroImage}"` : ""
    }${frontmatter.author ? `\nauthor: "${frontmatter.author}"` : ""}${
      frontmatter.draft ? `\ndraft: ${frontmatter.draft}` : ""
    }
---

`;

    const fullContent = frontmatterString + markdownContent;
    const blogDir = path.join(process.cwd(), "src", "content", "blog");
    const filePath = path.join(blogDir, `${slug}.md`);

    // Check if file already exists
    if (fs.existsSync(filePath) && !frontmatter.allowOverwrite) {
      return new Response(
        JSON.stringify({
          error: "File already exists",
          suggestion: "Use a different title or enable overwrite",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ensure the blog directory exists
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, fullContent, "utf8");

    return new Response(
      JSON.stringify({
        success: true,
        filename: `${slug}.md`,
        slug: slug,
        readingTime: readingTime,
        message: "Blog post saved successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving blog post:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
