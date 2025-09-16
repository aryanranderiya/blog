"use client";

import ActionMenu, { DefaultActionMenuRender } from "@yoopta/action-menu-list";
import Blockquote from "@yoopta/blockquote";
import Callout from "@yoopta/callout";
import Code from "@yoopta/code";
import Divider from "@yoopta/divider";
import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
  type YooptaOnChangeOptions,
} from "@yoopta/editor";
import Headings from "@yoopta/headings";
import Image from "@yoopta/image";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";
import Lists from "@yoopta/lists";
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

const plugins = [
  Paragraph,
  Headings.HeadingOne,
  Headings.HeadingTwo,
  Headings.HeadingThree,
  Blockquote,
  Lists.BulletedList,
  Lists.NumberedList,
  Code,
  Image,
  Divider,
  Callout,
];

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
    }
  );
  const [tags, setTags] = useState<string>(
    initialFrontmatter?.tags?.join(", ") || ""
  );

  const onChange = (
    value: YooptaContentValue,
    options: YooptaOnChangeOptions
  ) => {
    setValue(value);
  };

  const handleSave = async () => {
    if (!value || !frontmatter.title) {
      alert("Please fill in the title and content");
      return;
    }

    try {
      // For now, we'll save the content as JSON and let the backend handle conversion
      // TODO: Implement proper Yoopta to markdown conversion
      const contentString = value ? JSON.stringify(value) : "";
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
            onChange={(e) =>
              setFrontmatter({ ...frontmatter, title: e.target.value })
            }
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
      <div className="flex justify-center">
        <RaisedButton onClick={handleSave}>Save Post</RaisedButton>
      </div>
    </div>
  );
}
