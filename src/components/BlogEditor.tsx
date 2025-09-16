"use client";

import ActionMenu, { DefaultActionMenuRender } from "@yoopta/action-menu-list";
import Accordion from "@yoopta/accordion";
import Blockquote from "@yoopta/blockquote";
import Callout from "@yoopta/callout";
import Code from "@yoopta/code";
import Divider from "@yoopta/divider";
import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
  type YooptaOnChangeOptions,
  type YooptaPlugin,
} from "@yoopta/editor";
import Embed from "@yoopta/embed";
import File from "@yoopta/file";
import Headings from "@yoopta/headings";
import Image from "@yoopta/image";
import Link from "@yoopta/link";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";
import Lists from "@yoopta/lists";
import Table from "@yoopta/table";
import Video from "@yoopta/video";
import {
  Bold,
  CodeMark,
  Highlight,
  Italic,
  Strike,
  Underline,
} from "@yoopta/marks";
import Paragraph from "@yoopta/paragraph";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { RaisedButton } from "./ui/raised-button";
import { Textarea } from "./ui/textarea";
import { markdown, html, plainText } from "@yoopta/exports";

const uploadToServer = async (file: File): Promise<{ src: string }> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const result = await response.json();
    return { src: result.url };
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
};

const plugins = [
  Paragraph,
  Headings.HeadingOne,
  Headings.HeadingTwo,
  Headings.HeadingThree,
  Blockquote,
  Lists.BulletedList,
  Lists.NumberedList,
  Code,
  Image.extend({
    options: {
      async onUpload(file: File) {
        return uploadToServer(file);
      },
    },
  }),
  Video,
  File,
  Table,
  Embed,
  Link,
  Accordion,
  Divider,
  Callout,
] as any;

const marks = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

const TOOLS = {
  Toolbar: {
    tool: Toolbar,
    render: DefaultToolbarRender,
  },
  ActionMenu: {
    tool: ActionMenu,
    render: DefaultActionMenuRender,
  },
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
};

interface BlogEditorProps {
  onSave: (content: string, frontmatter: any) => void;
  initialContent?: YooptaContentValue;
  initialFrontmatter?: {
    title: string;
    description: string;
    pubDate: string;
    tags: string[];
    slug?: string;
    author?: string;
    heroImage?: string;
    draft?: boolean;
  };
}

export default function BlogEditor({
  onSave,
  initialContent,
  initialFrontmatter,
}: BlogEditorProps) {
  const editor = useMemo(() => createYooptaEditor(), []);
  const [value, setValue] = useState<YooptaContentValue>();
  const [frontmatter, setFrontmatter] = useState(
    initialFrontmatter || {
      title: "",
      description: "",
      pubDate: new Date().toISOString().split("T")[0],
      tags: [],
      slug: "",
      author: "Aryan Randeriya",
      heroImage: "",
      draft: false,
    }
  );
  const [tags, setTags] = useState<string>(
    initialFrontmatter?.tags?.join(", ") || ""
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    setIsUploadingImage(true);
    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error("Image upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image");
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleHeroImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await handleImageUpload(file);
        setFrontmatter({ ...frontmatter, heroImage: url });
      } catch (error) {
        // Error already handled in handleImageUpload
      }
    }
  };

  const onChange = (
    value: YooptaContentValue,
    options: YooptaOnChangeOptions
  ) => {
    setValue(value);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (newTitle: string) => {
    setFrontmatter({
      ...frontmatter,
      title: newTitle,
      slug: frontmatter.slug || generateSlug(newTitle),
    });
  };

  const handleExport = (format: "markdown" | "html" | "plainText") => {
    if (!value) {
      alert("No content to export");
      return;
    }

    try {
      let exportedContent = "";

      switch (format) {
        case "markdown":
          exportedContent = markdown.serialize(editor, value);
          break;
        case "html":
          exportedContent = html.serialize(editor, value);
          break;
        case "plainText":
          exportedContent = plainText.serialize(editor, value);
          break;
      }

      // Create download
      const blob = new Blob([exportedContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${frontmatter.title || "blog-post"}.${
        format === "plainText" ? "txt" : format
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      alert(`Error exporting to ${format}`);
    }
  };

  const handleSave = async () => {
    if (!value || !frontmatter.title) {
      alert("Please fill in the title and content");
      return;
    }

    try {
      // Convert to markdown for saving
      const contentString = markdown.serialize(editor, value);
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const frontmatterData = {
        ...frontmatter,
        tags: tagsArray,
        pubDate: frontmatter.pubDate,
      };

      onSave(contentString, frontmatterData);
    } catch (error) {
      console.error("Error saving blog post:", error);
      alert("Error saving blog post");
    }
  };

  return (
    <div className="max-w-7xl p-6">
      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <Input
            type="text"
            id="title"
            value={frontmatter.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter blog post title"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Description
          </label>
          <Textarea
            id="description"
            value={frontmatter.description}
            onChange={(e) =>
              setFrontmatter({ ...frontmatter, description: e.target.value })
            }
            rows={3}
            placeholder="Enter blog post description"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-2">
            Slug (URL)
          </label>
          <Input
            type="text"
            id="slug"
            value={frontmatter.slug}
            onChange={(e) =>
              setFrontmatter({ ...frontmatter, slug: e.target.value })
            }
            placeholder="url-friendly-slug"
          />
        </div>

        <div>
          <label htmlFor="heroImage" className="block text-sm font-medium mb-2">
            Hero Image
          </label>
          <div className="space-y-2">
            <Input
              type="text"
              id="heroImage"
              value={frontmatter.heroImage}
              onChange={(e) =>
                setFrontmatter({ ...frontmatter, heroImage: e.target.value })
              }
              placeholder="./media/image.jpg or ../../assets/image.jpg"
            />
            <div className="text-sm text-muted-foreground">
              Or upload an image (saved to ./media/ directory):
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleHeroImageFileChange}
              disabled={isUploadingImage}
              className="cursor-pointer"
            />
            {isUploadingImage && (
              <div className="text-sm text-blue-600">Uploading image...</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pubDate" className="block text-sm font-medium mb-2">
              Publication Date
            </label>
            <Input
              type="date"
              id="pubDate"
              value={frontmatter.pubDate}
              onChange={(e) =>
                setFrontmatter({ ...frontmatter, pubDate: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags (comma-separated)
            </label>
            <Input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="draft"
            checked={frontmatter.draft}
            onChange={(e) =>
              setFrontmatter({ ...frontmatter, draft: e.target.checked })
            }
            className="rounded border-gray-300"
          />
          <label htmlFor="draft" className="text-sm font-medium">
            Save as draft
          </label>
        </div>
      </div>

      <div className="">
        <YooptaEditor
          editor={editor}
          plugins={plugins}
          marks={marks}
          tools={TOOLS}
          placeholder="Start writing your blog post..."
          value={value}
          onChange={onChange}
          className="rounded-lg outline-1 outline-zinc-700 w-full! p-10 my-10"
        />
      </div>
      <div className="flex justify-center gap-4 flex-wrap">
        <RaisedButton onClick={handleSave}>Save Post</RaisedButton>
        <RaisedButton onClick={() => handleExport("markdown")} color="#6b7280">
          Export Markdown
        </RaisedButton>
        <RaisedButton onClick={() => handleExport("html")} color="#6b7280">
          Export HTML
        </RaisedButton>
        <RaisedButton onClick={() => handleExport("plainText")} color="#6b7280">
          Export Text
        </RaisedButton>
      </div>
    </div>
  );
}
