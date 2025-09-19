import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

// Only allow in development
const isDevelopment = import.meta.env.DEV;

export const POST: APIRoute = async ({ request }) => {
  // Only allow in development
  if (!isDevelopment) {
    return new Response(
      JSON.stringify({
        error: "Upload endpoint only available in development",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 5MB." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.name);
    const filename = `${timestamp}-${randomString}${extension}`;

    // Create media directory in blog content if it doesn't exist
    const mediaDir = path.join(
      process.cwd(),
      "src",
      "content",
      "blog",
      "media"
    );
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(mediaDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // Return the relative path for use in markdown
    const relativePath = `./media/${filename}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: relativePath,
        filename: filename,
        message: "Image uploaded successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
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
