"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Key,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Bot,
  Layers,
  HelpCircle,
  Terminal,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateMcpTokenAction, revokeMcpTokenAction } from "@/app/actions/tutor";

export interface McpTokenItem {
  id: string;
  label: string;
  token: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

interface ConnectMcpClientProps {
  tokens: McpTokenItem[];
  appUrl: string;
}

const EXAMPLE_PROMPTS = [
  "Create a batch called Class 10 Science (Batch A) and add these students: Rohan Sharma, rohan@example.com, 9876543210\nPriya Verma, priya@example.com",
  "Give me the invite link for Batch A",
  "Make a 10-question quiz on photosynthesis for Batch A, mark it premium",
  "Write revision notes on chemical reactions for Batch A, free and public",
  "How did Batch A do on the last quiz? Which questions were hardest?",
  "Grade all submissions for Assignment 1 out of 10 with short feedback, but don't release yet",
];

export function ConnectMcpClient({ tokens, appUrl }: ConnectMcpClientProps) {
  const [isPending, startTransition] = useTransition();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedAi, setSelectedAi] = useState<"claude" | "chatgpt" | "gemini" | "perplexity">("claude");

  // Active token is the latest non-revoked token
  const activeToken = tokens.find((t) => !t.revoked_at);

  const cleanAppUrl = appUrl.replace(/\/$/, "");

  // Personalized endpoints for this tutor
  const claudeUrl = activeToken ? `${cleanAppUrl}/m/${activeToken.token}` : "";
  const chatGptActionUrl = activeToken ? `${cleanAppUrl}/gpt/${activeToken.token}` : "";
  const geminiUrl = activeToken ? `${cleanAppUrl}/gemini/${activeToken.token}` : "";
  const perplexityUrl = activeToken ? `${cleanAppUrl}/m/${activeToken.token}` : "";

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleGenerateConnection = () => {
    startTransition(async () => {
      try {
        const res = await generateMcpTokenAction("My AI Connector");
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Connection generated successfully!");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to generate connection.");
      }
    });
  };

  const handleRegenerate = () => {
    if (
      !confirm(
        "Are you sure you want to regenerate your connection? This will immediately revoke your old URL and disconnect any AI assistants currently using it."
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        if (activeToken) {
          await revokeMcpTokenAction(activeToken.id);
        }
        const res = await generateMcpTokenAction("My AI Connector");
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("New connection generated! Old connection revoked.");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to regenerate connection.");
      }
    });
  };

  const claudeDesktopJson = JSON.stringify(
    {
      mcpServers: {
        classy: {
          url: claudeUrl || `${cleanAppUrl}/m/<YOUR_TOKEN>`,
        },
      },
    },
    null,
    2
  );

  const claudeCodeCliCmd = `claude mcp add classy ${claudeUrl || `${cleanAppUrl}/m/<YOUR_TOKEN>`}`;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-border/80 p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl space-y-2.5">
          <Badge className="bg-primary-soft text-primary font-medium text-xs px-3 py-1">
            Assistant Integration
          </Badge>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Connect Your Teaching Assistant
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Run your classroom directly from Claude, ChatGPT, Gemini, or Perplexity. Your personal link enables your assistant to create quizzes, post notes, and grade submissions on your behalf.
          </p>
        </div>
      </div>

      {/* Connection State Card */}
      {!activeToken ? (
        <Card className="p-8 text-center bg-surface border-border/80 space-y-4 rounded-3xl">
          <div className="h-12 w-12 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto text-primary">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-ink text-lg">
              No active assistant connection
            </h2>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              Generate a unique personal link to connect Claude, ChatGPT, Gemini, or Perplexity to your classrooms.
            </p>
          </div>
          <Button
            onClick={handleGenerateConnection}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 px-6 gap-2 rounded-xl"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isPending ? "Generating..." : "Generate my personal link"}</span>
          </Button>
        </Card>
      ) : (
        <Card className="p-6 bg-surface border-border/80 shadow-xs space-y-5 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-ink text-base">
                  Your Personal Assistant Link
                </h2>
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium flex items-center gap-1 border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" /> Scoped to Your Login
                </Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Every action taken through this link modifies only your batches and students.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isPending}
              className="text-xs gap-1.5 shrink-0 rounded-xl hover:bg-danger/10 hover:text-danger hover:border-danger/40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Regenerate Link</span>
            </Button>
          </div>

          {/* Simple URL Display */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 p-3 bg-bg rounded-xl border border-border font-mono text-xs text-ink truncate select-all">
                {claudeUrl}
              </div>
              <Button
                onClick={() => copyToClipboard(claudeUrl, "master-url")}
                className="h-11 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shrink-0 gap-1.5"
              >
                {copiedKey === "master-url" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Link
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted pt-1">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="h-3.5 w-3.5" />
                {activeToken.last_used_at
                  ? `Last used: ${new Date(activeToken.last_used_at).toLocaleString()}`
                  : "Not used yet"}
              </span>
              <span>•</span>
              <span className="text-[11px]">
                Created: {new Date(activeToken.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* 4 Dedicated AI Tool Tabs */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif font-bold text-ink text-lg">Choose Your AI Assistant</h2>
          <p className="text-xs text-muted">
            Select Claude, ChatGPT, Gemini, or Perplexity below for step-by-step connection instructions:
          </p>
        </div>

        <div className="bg-surface border border-border p-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => setSelectedAi("claude")}
            className={cn(
              "text-xs py-2 px-3 rounded-xl gap-1.5 font-medium flex items-center justify-center transition-all cursor-pointer",
              selectedAi === "claude"
                ? "bg-primary-soft text-primary font-semibold shadow-2xs border border-primary/20"
                : "text-muted hover:text-ink hover:bg-bg"
            )}
          >
            <Bot className="h-3.5 w-3.5 text-purple-600" /> Claude
          </button>
          <button
            type="button"
            onClick={() => setSelectedAi("chatgpt")}
            className={cn(
              "text-xs py-2 px-3 rounded-xl gap-1.5 font-medium flex items-center justify-center transition-all cursor-pointer",
              selectedAi === "chatgpt"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-2xs border border-emerald-500/20"
                : "text-muted hover:text-ink hover:bg-bg"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> ChatGPT
          </button>
          <button
            type="button"
            onClick={() => setSelectedAi("gemini")}
            className={cn(
              "text-xs py-2 px-3 rounded-xl gap-1.5 font-medium flex items-center justify-center transition-all cursor-pointer",
              selectedAi === "gemini"
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs border border-blue-500/20"
                : "text-muted hover:text-ink hover:bg-bg"
            )}
          >
            <Layers className="h-3.5 w-3.5 text-blue-600" /> Gemini
          </button>
          <button
            type="button"
            onClick={() => setSelectedAi("perplexity")}
            className={cn(
              "text-xs py-2 px-3 rounded-xl gap-1.5 font-medium flex items-center justify-center transition-all cursor-pointer",
              selectedAi === "perplexity"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold shadow-2xs border border-amber-500/20"
                : "text-muted hover:text-ink hover:bg-bg"
            )}
          >
            <Globe className="h-3.5 w-3.5 text-amber-600" /> Perplexity
          </button>
        </div>

        {/* 1. Claude (Desktop & Code CLI) */}
        {selectedAi === "claude" && (
          <div className="mt-4">
            <Card className="p-5 sm:p-6 bg-surface border-border space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-ink text-base">
                    Claude (Desktop App &amp; Claude Code CLI)
                  </h3>
                  <p className="text-xs text-muted">
                    Supports native Model Context Protocol (Streamable HTTP) with zero setup headaches.
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-800 text-[10px]">MCP Native</Badge>
              </div>

              {/* Option A: Claude Code CLI */}
              <div className="space-y-2 p-4 rounded-2xl bg-bg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-primary" /> Option A: Claude Code CLI (1 command)
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(claudeCodeCliCmd, "claude-cli")}
                    className="h-7 text-xs text-primary gap-1"
                  >
                    {copiedKey === "claude-cli" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    Copy Command
                  </Button>
                </div>
                <pre className="p-2.5 rounded-lg bg-surface border border-border font-mono text-[11px] text-ink overflow-x-auto">
                  {claudeCodeCliCmd}
                </pre>
              </div>

              {/* Option B: Claude Desktop App */}
              <div className="space-y-3 p-4 rounded-2xl bg-bg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-purple-600" /> Option B: Claude Desktop App
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(claudeDesktopJson, "claude-json")}
                    className="h-7 text-xs text-primary gap-1"
                  >
                    {copiedKey === "claude-json" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    Copy JSON
                  </Button>
                </div>
                <ol className="space-y-1.5 text-xs text-muted list-decimal pl-5">
                  <li>In Claude Desktop, open <strong>Settings</strong> → <strong>Developer</strong> → <strong>Edit Config</strong>.</li>
                  <li>Paste this configuration into <code className="text-ink font-mono text-[11px]">claude_desktop_config.json</code>:</li>
                </ol>
                <pre className="p-2.5 rounded-lg bg-surface border border-border font-mono text-[11px] text-ink overflow-x-auto">
                  {claudeDesktopJson}
                </pre>
                <p className="text-[11px] text-muted">
                  Restart Claude Desktop. You will see the hammer icon with all 15 Classy tools ready to use!
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* 2. ChatGPT */}
        {selectedAi === "chatgpt" && (
          <div className="mt-4">
            <Card className="p-5 sm:p-6 bg-surface border-border space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-ink text-base">
                    ChatGPT (Custom GPT Actions &amp; Web/Mobile)
                  </h3>
                  <p className="text-xs text-muted">
                    Works across ChatGPT Web, iOS, and Android mobile apps via OpenAPI 3.1 Actions.
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">OpenAPI 3.1 Actions</Badge>
              </div>

              {/* OpenAPI URL for ChatGPT */}
              <div className="space-y-2 p-4 rounded-2xl bg-bg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">
                    Your Personal ChatGPT Action Schema URL:
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(chatGptActionUrl, "chatgpt-url")}
                    className="h-7 text-xs text-emerald-700 gap-1"
                  >
                    {copiedKey === "chatgpt-url" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    Copy URL
                  </Button>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border font-mono text-[11px] text-ink truncate select-all">
                  {chatGptActionUrl || `${cleanAppUrl}/gpt/<YOUR_TOKEN>`}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2 text-xs text-ink/90">
                <h4 className="font-semibold text-ink">Setup in 30 seconds:</h4>
                <ol className="space-y-2 list-decimal pl-5 leading-relaxed text-muted">
                  <li>
                    Open ChatGPT, click your profile or sidebar → <strong>Explore GPTs</strong> → <strong>+ Create</strong>.
                  </li>
                  <li>
                    Go to the <strong>Configure</strong> tab. Set Name to <strong className="text-ink">Classy Teaching Assistant</strong>.
                  </li>
                  <li>
                    Scroll down to <strong>Actions</strong> and click <strong>Create new action</strong>.
                  </li>
                  <li>
                    Click <strong>Import from URL</strong>, paste your Action Schema URL from above, and click <strong>Import</strong>.
                  </li>
                  <li>
                    Leave Authentication as <strong>None</strong> (your unique token is already embedded in the URL).
                  </li>
                  <li>
                    Click <strong>Save</strong> (Only me). You can now manage your classroom from ChatGPT Web or the mobile app!
                  </li>
                </ol>
              </div>
            </Card>
          </div>
        )}

        {/* 3. Gemini */}
        {selectedAi === "gemini" && (
          <div className="mt-4">
            <Card className="p-5 sm:p-6 bg-surface border-border space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-ink text-base">
                    Google Gemini (AI Studio &amp; Gemini Extensions)
                  </h3>
                  <p className="text-xs text-muted">
                    Supports Function Calling schemas in Google AI Studio and native Streamable MCP.
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-[10px]">AI Studio &amp; Tools</Badge>
              </div>

              {/* Gemini Schema URL */}
              <div className="space-y-2 p-4 rounded-2xl bg-bg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">
                    Gemini Tool Schema URL:
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(geminiUrl, "gemini-url")}
                    className="h-7 text-xs text-blue-700 gap-1"
                  >
                    {copiedKey === "gemini-url" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    Copy Schema URL
                  </Button>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border font-mono text-[11px] text-ink truncate select-all">
                  {geminiUrl || `${cleanAppUrl}/gemini/<YOUR_TOKEN>`}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2 text-xs text-ink/90">
                <h4 className="font-semibold text-ink">How to connect in Google AI Studio:</h4>
                <ol className="space-y-2 list-decimal pl-5 leading-relaxed text-muted">
                  <li>
                    Open <strong>Google AI Studio</strong> (aistudio.google.com) and start a new prompt.
                  </li>
                  <li>
                    In the right-hand panel under <strong>Tools</strong>, toggle on <strong>Function Calling</strong>.
                  </li>
                  <li>
                    Import the tool definitions using your Schema URL above.
                  </li>
                  <li>
                    Ask Gemini to create quizzes, check submissions, or post batch notes!
                  </li>
                </ol>
              </div>
            </Card>
          </div>
        )}

        {/* 4. Perplexity */}
        {selectedAi === "perplexity" && (
          <div className="mt-4">
            <Card className="p-5 sm:p-6 bg-surface border-border space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-ink text-base">
                    Perplexity (Pro / Max / Enterprise Connectors)
                  </h3>
                  <p className="text-xs text-muted">
                    Connect Classy directly to Perplexity using Custom Connectors.
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-800 text-[10px]">MCP Connector</Badge>
              </div>

              {/* Perplexity Connector URL */}
              <div className="space-y-2 p-4 rounded-2xl bg-bg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">
                    Perplexity Connector URL:
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(perplexityUrl, "pplx-url")}
                    className="h-7 text-xs text-amber-700 gap-1"
                  >
                    {copiedKey === "pplx-url" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    Copy URL
                  </Button>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border font-mono text-[11px] text-ink truncate select-all">
                  {perplexityUrl || `${cleanAppUrl}/m/<YOUR_TOKEN>`}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2 text-xs text-ink/90">
                <h4 className="font-semibold text-ink">Setup in Perplexity Settings:</h4>
                <ol className="space-y-2 list-decimal pl-5 leading-relaxed text-muted">
                  <li>
                    Go to <strong>Settings</strong> → <strong>Connectors</strong> → <strong>+ Custom connector</strong>.
                  </li>
                  <li>
                    Choose <strong>Remote</strong> transport and set it to <strong>Streamable HTTP</strong>.
                  </li>
                  <li>
                    Paste your Connector URL from above.
                  </li>
                  <li>
                    Set Authentication to <strong>None</strong> and click <strong>Add</strong>.
                  </li>
                  <li>
                    Use Perplexity to research curriculum materials and instantly publish them to your batches!
                  </li>
                </ol>
              </div>
            </Card>
          </div>
        )}

        <p className="text-[11px] text-muted italic flex items-center gap-1.5 pt-1">
          <HelpCircle className="h-3.5 w-3.5 shrink-0" />
          Each tool connection is fully isolated to your login. Tutors never share access or data.
        </p>
      </div>

      {/* "Try these prompts" Section */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="font-serif font-bold text-ink text-lg">Try These Prompts</h2>
          <p className="text-xs text-muted">
            Once connected, ask your AI to run your classes using any of these instructions:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXAMPLE_PROMPTS.map((promptText, idx) => (
            <Card
              key={idx}
              className="p-4 bg-surface border-border shadow-xs flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all"
            >
              <p className="text-xs font-mono text-ink leading-relaxed whitespace-pre-wrap">
                &quot;{promptText}&quot;
              </p>
              <div className="pt-2 border-t border-border/60 flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(promptText, `prompt-${idx}`)}
                  className="h-7 text-xs text-primary hover:bg-primary-soft gap-1"
                >
                  {copiedKey === `prompt-${idx}` ? (
                    <>
                      <Check className="h-3 w-3 text-success" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy prompt
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
