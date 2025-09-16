import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

// Only allow in development
const isDevelopment = import.meta.env.DEV;

function convertYooptaToMarkdown(content: string): string {
  try {
    // If content is JSON (Yoopta format), try to convert to simple markdown
    const yooptaContent = JSON.parse(content);

    // Simple conversion logic - this is basic and can be enhanced
    let markdown = "";

    for (const blockId in yooptaContent) {
      const block = yooptaContent[blockId];

      if (block.type === "HeadingOne") {
        markdown += `# ${block.value[0]?.children[0]?.text || ""}\n\n`;
      } else if (block.type === "HeadingTwo") {
        markdown += `## ${block.value[0]?.children[0]?.text || ""}\n\n`;
      } else if (block.type === "HeadingThree") {
        markdown += `### ${block.value[0]?.children[0]?.text || ""}\n\n`;
      } else if (block.type === "Paragraph") {
        const text =
          block.value[0]?.children?.map((child: any) => child.text).join("") ||
          "";
        markdown += `${text}\n\n`;
      } else if (block.type === "Blockquote") {
        const text =
          block.value[0]?.children?.map((child: any) => child.text).join("") ||
          "";
        markdown += `> ${text}\n\n`;
      } else if (block.type === "BulletedList") {
        const text =
          block.value[0]?.children?.map((child: any) => child.text).join("") ||
          "";
        markdown += `- ${text}\n`;
      } else if (block.type === "NumberedList") {
        const text =
          block.value[0]?.children?.map((child: any) => child.text).join("") ||
          "";
        markdown += `1. ${text}\n`;
      } else if (block.type === "Code") {
        const text =
          block.value[0]?.children?.map((child: any) => child.text).join("") ||
          "";
        markdown += `\`\`\`\n${text}\n\`\`\`\n\n`;
      }
    }

    return markdown.trim();
  } catch (error) {
    // If parsing fails, return the content as-is
    return content;
  }
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

    // Convert Yoopta content to markdown
    const markdownContent = convertYooptaToMarkdown(content);

    // Create filename from title (sanitized)
    const filename = frontmatter.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Create frontmatter string
    const frontmatterString = `---
title: "${frontmatter.title}"
description: "${frontmatter.description}"
pubDate: ${frontmatter.pubDate}
tags: [${frontmatter.tags.map((tag: string) => `"${tag}"`).join(", ")}]
---

`;

    const fullContent = frontmatterString + markdownContent;
    const blogDir = path.join(process.cwd(), "src", "content", "blog");
    const filePath = path.join(blogDir, `${filename}.md`);

    // Ensure the blog directory exists
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, fullContent, "utf8");

    return new Response(
      JSON.stringify({
        success: true,
        filename: `${filename}.md`,
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
