"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content) {
    return <p className="text-sm italic text-muted">Nothing to preview yet.</p>;
  }

  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed text-ink space-y-3",
        "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:font-serif [&_h1]:text-ink [&_h1]:mt-4 [&_h1]:mb-2",
        "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:font-serif [&_h2]:text-ink [&_h2]:mt-3 [&_h2]:mb-2",
        "[&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-ink [&_h3]:mt-2 [&_h3]:mb-1",
        "[&_p]:leading-relaxed [&_p]:text-ink/90",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1",
        "[&_code]:bg-muted/10 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
        "[&_pre]:bg-ink [&_pre]:text-surface [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:overflow-x-auto",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted",
        "[&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
