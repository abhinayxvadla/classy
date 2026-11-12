"use client";

import * as React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ArrowLeft, CheckCircle2, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NotesReaderProps {
  itemId: string;
  title: string;
  batchId: string | null;
  batchName?: string;
  tutorName?: string;
  content: string;
  grade?: string | null;
  subject?: string | null;
  createdAt: string;
}

export function NotesReader({
  itemId,
  title,
  batchId,
  batchName,
  tutorName,
  content,
  grade,
  subject,
  createdAt,
}: NotesReaderProps) {
  const storageKey = `classy_read_${itemId}`;
  const [isRead, setIsRead] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "true") {
        setIsRead(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey]);

  const handleToggleRead = () => {
    const nextState = !isRead;
    setIsRead(nextState);
    try {
      localStorage.setItem(storageKey, String(nextState));
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <div className="w-full max-w-[70ch] mx-auto space-y-8 pb-20">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between text-sm text-muted">
        {batchId ? (
          <Link
            href={`/s/batches/${batchId}`}
            className="hover:text-ink transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{batchName || "Batch Feed"}</span>
          </Link>
        ) : (
          <Link
            href="/s/library"
            className="hover:text-ink transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Public Library</span>
          </Link>
        )}

        <Button
          type="button"
          variant={isRead ? "outline" : "default"}
          size="sm"
          onClick={handleToggleRead}
          className={`rounded-xl text-xs font-semibold gap-1.5 transition-all ${
            isRead ? "text-success border-success/40 bg-success/5" : ""
          }`}
        >
          {isRead ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span>Marked as Read</span>
            </>
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5" />
              <span>Mark as Read</span>
            </>
          )}
        </Button>
      </div>

      {/* Title & Metadata Card */}
      <div className="space-y-3 pb-6 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary-soft text-primary border-transparent text-xs font-semibold">
            Study Notes
          </Badge>
          {subject && (
            <Badge variant="outline" className="text-xs text-ink border-border">
              {subject}
            </Badge>
          )}
          {grade && (
            <Badge variant="outline" className="text-xs text-muted border-border">
              {grade}
            </Badge>
          )}
          {isRead && (
            <Badge className="bg-success/15 text-success border-transparent text-xs font-medium gap-1">
              <CheckCircle2 className="h-3 w-3" /> Read
            </Badge>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight">
          {title}
        </h1>

        <div className="flex items-center gap-3 text-xs text-muted">
          {tutorName && (
            <span>
              By <strong className="text-ink font-medium">{tutorName}</strong>
            </span>
          )}
          <span>•</span>
          <span>
            {new Date(createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Main Reading Surface with comfortable line height and typography */}
      <article className="prose prose-neutral dark:prose-invert max-w-none text-ink leading-relaxed space-y-4 font-sans text-base sm:text-lg">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({ children }) => (
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-8 mb-4 border-b border-border pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink mt-6 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ink mt-5 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-ink/90 leading-relaxed mb-4 text-sm sm:text-base">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1.5 mb-4 text-sm sm:text-base text-ink/90 pl-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1.5 mb-4 text-sm sm:text-base text-ink/90 pl-2">
                {children}
              </ol>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary pl-4 py-1 italic my-4 text-muted bg-primary-soft/20 rounded-r-xl">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-xl border border-border">
                <table className="w-full text-left text-sm border-collapse">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-bg border-b border-border text-ink font-semibold">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="p-3 font-semibold border-r border-border last:border-r-0">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="p-3 border-t border-border border-r border-border last:border-r-0">
                {children}
              </td>
            ),
            code: ({ inline, children, ...props }: { inline?: boolean; children?: React.ReactNode }) =>
              inline ? (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-bg border border-border text-primary font-mono text-xs sm:text-sm"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <pre className="p-4 rounded-2xl bg-ink text-bg overflow-x-auto my-4 text-xs sm:text-sm font-mono">
                  <code>{children}</code>
                </pre>
              ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      {/* Completion Footer */}
      <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          type="button"
          onClick={handleToggleRead}
          className={`w-full sm:w-auto rounded-xl text-xs font-semibold gap-1.5 ${
            isRead ? "bg-success text-white hover:bg-success/90" : "bg-primary text-white"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{isRead ? "Completed! Mark as Unread" : "Finished Reading: Mark as Read"}</span>
        </Button>

        {batchId && (
          <Link
            href={`/s/batches/${batchId}`}
            className="text-xs font-semibold text-primary hover:underline"
          >
            ← Return to batch materials
          </Link>
        )}
      </div>
    </div>
  );
}
