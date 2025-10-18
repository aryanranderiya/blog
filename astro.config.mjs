// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./src/lib/remark-reading-time.mjs";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.aryanranderiya.com",
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: false,
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/create") && !page.includes("/api/"),
    }),
    react(),
  ],

  build: {
    inlineStylesheets: "auto", // Inline small CSS files
  },
  vite: {
    build: {
      cssCodeSplit: true, // Enable CSS code splitting
      minify: "esbuild", // Fast minification
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code for better caching
            "react-vendor": ["react", "react-dom"],
          },
        },
      },
    },
    plugins: [tailwindcss()],
  },
  compressHTML: true, // Compress HTML output
});
