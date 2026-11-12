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
  Cpu,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { generateMcpTokenAction, revokeMcpTokenAction } from "@/app/actions/tutor";
import { APP_NAME } from "@/lib/config";

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
  "Create a batch called Class 10 Science – Batch A and add these students: Rohan Sharma, rohan@example.com, 9876543210\nPriya Verma, priya@example.com",
  "Give me the invite link for Batch A",
  "Make a 10-question quiz on photosynthesis for Batch A, mark it premium",
  "Write revision notes on chemical reactions for Batch A, free and public",
  "How did Batch A do on the last quiz? Which questions were hardest?",
  "Grade all submissions for Assignment 1 out of 10 with short feedback, but don't release yet",
];

export function ConnectMcpClient({ tokens, appUrl }: ConnectMcpClientProps) {
  const [isPending, startTransition] = useTransition();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active token is the latest non-revoked token
  const activeToken = tokens.find((t) => !t.revoked_at);

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

  // URL for "No authentication" streamable HTTP
  const mcpConnectionUrl = activeToken
    ? `${appUrl}/api/c/${activeToken.token}/mcp`
    : "";

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-border p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl space-y-3">
          <Badge className="bg-primary-soft text-primary font-medium text-xs px-2.5 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> External AI Control via MCP
          </Badge>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Connect your AI assistant to {APP_NAME}
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Run your classes directly from Claude, ChatGPT, Perplexity, or Gemini. The Model Context Protocol (MCP) server lets your AI create quizzes, draft notes, manage batch rosters, and grade assignments in {APP_NAME}.
          </p>
        </div>
      </div>

      {/* Active Connection URL Card */}
      {!activeToken ? (
        <Card className="p-8 text-center bg-surface border-border space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto text-primary">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-ink text-lg">
              No active AI connection
            </h2>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              Generate a unique connection endpoint to plug {APP_NAME} into Claude, ChatGPT, Perplexity, or Gemini.
            </p>
          </div>
          <Button
            onClick={handleGenerateConnection}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 px-6 gap-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isPending ? "Generating..." : "Generate my connection"}</span>
          </Button>
        </Card>
      ) : (
        <Card className="p-6 bg-surface border-border shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-ink text-base">
                  Your MCP Connection URL
                </h2>
                <Badge className="bg-success/15 text-success text-[10px] font-medium">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Paste this URL into your AI app. It works as &quot;No authentication&quot; because your secret token is built right into the URL.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isPending}
              className="text-xs gap-1.5 shrink-0 hover:bg-danger/10 hover:text-danger hover:border-danger/40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Regenerate</span>
            </Button>
          </div>

          {/* Copyable URL input block */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 p-3 bg-bg rounded-xl border border-border font-mono text-xs text-ink truncate select-all">
                {mcpConnectionUrl}
              </div>
              <Button
                onClick={() => copyToClipboard(mcpConnectionUrl, "connection-url")}
                className="h-11 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shrink-0 gap-1.5"
              >
                {copiedKey === "connection-url" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy URL
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

      {/* Step-by-Step AI Setup Tabs */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif font-bold text-ink text-lg">Step-by-Step AI Setup</h2>
          <p className="text-xs text-muted">
            Choose your AI assistant below and follow the quick instructions.
          </p>
        </div>

        <Tabs defaultValue="claude" className="w-full">
          <TabsList className="bg-surface border border-border p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="claude" className="text-xs gap-1.5">
              <Bot className="h-3.5 w-3.5" /> Claude
            </TabsTrigger>
            <TabsTrigger value="chatgpt" className="text-xs gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> ChatGPT
            </TabsTrigger>
            <TabsTrigger value="perplexity" className="text-xs gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> Perplexity
            </TabsTrigger>
            <TabsTrigger value="gemini" className="text-xs gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Gemini
            </TabsTrigger>
          </TabsList>

          {/* 1. Claude */}
          <TabsContent value="claude" className="mt-4">
            <Card className="p-5 sm:p-6 bg-surface border-border space-y-4">
              <h3 className="font-serif font-bold text-ink text-base">
                Connect Claude to {APP_NAME}
              </h3>
              <ol className="space-y-2.5 text-xs text-ink/90 list-decimal pl-5 leading-relaxed">
                <li>
                  Open <strong>Settings</strong> → <strong>Connectors</strong>.
                </li>
                <li>
                  Click <strong>Add custom connector</strong>.
                </li>
                <li>
                  Set Name to <code className="text-primary font-mono bg-bg px-1 rounded">&quot;Classy&quot;</code>.
                </li>
                <li>
                  Paste your connection URL:{" "}
                  <code className="text-ink font-mono text-[11px] bg-bg px-1.5 py-0.5 rounded border border-border">
                    {mcpConnectionUrl || `${appUrl}/api/c/<YOUR_TOKEN>/mcp`}
                  </code>
                </li>
                <li>
                  Click <strong>Add</strong>.
                </li>
                <li>
                  In any chat, enable <strong>Classy</strong> from the tools menu.
                </li>
              </ol>
            </Card>
          </TabsContent>

          {/* 2. ChatGPT */}
          <TabsContent value="chatgpt" className="mt-4">
            <Card className="p-5 sm:p-6 bg-surface border-border space-y-4">
              <h3 className="font-serif font-bold text-ink text-base">
                Connect ChatGPT (Paid plans)
              </h3>
              <ol className="space-y-2.5 text-xs text-ink/90 list-decimal pl-5 leading-relaxed">
                <li>
                  Go to <strong>Settings</strong> → <strong>Apps &amp; Connectors</strong> → <strong>Advanced</strong>.
                </li>
                <li>
                  Turn on <strong>Developer mode</strong>, then click <strong>Create</strong>.
                </li>
                <li>
                  Set Name to <code className="text-primary font-mono bg-bg px-1 rounded">&quot;Classy&quot;</code>.
                </li>
                <li>
                  Paste URL:{" "}
                  <code className="text-ink font-mono text-[11px] bg-bg px-1.5 py-0.5 rounded border border-border">
                    {mcpConnectionUrl || `${appUrl}/api/c/<YOUR_TOKEN>/mcp`}
                  </code>
                </li>
                <li>
                  Set Authentication to <strong>&quot;No authentication&quot;</strong>.
                </li>
                <li>
                  Click <strong>Trust</strong> → <strong>Create</strong>.
                </li>
                <li>
                  In a chat, choose Classy from the tools (+) menu.
                </li>
              </ol>
            </Card>
          </TabsContent>

          {/* 3. Perplexity */}
          <TabsContent value="perplexity" className="mt-4">
            <Card className="p-5 sm:p-6 bg-surface border-border space-y-4">
              <h3 className="font-serif font-bold text-ink text-base">
                Connect Perplexity (Pro / Max / Enterprise)
              </h3>
              <ol className="space-y-2.5 text-xs text-ink/90 list-decimal pl-5 leading-relaxed">
                <li>
                  Go to <strong>Settings</strong> → <strong>Connectors</strong> → <strong>+ Custom connector</strong>.
                </li>
                <li>
                  Choose <strong>Remote</strong>.
                </li>
                <li>
                  Paste URL:{" "}
                  <code className="text-ink font-mono text-[11px] bg-bg px-1.5 py-0.5 rounded border border-border">
                    {mcpConnectionUrl || `${appUrl}/api/c/<YOUR_TOKEN>/mcp`}
                  </code>
                </li>
                <li>
                  Set Transport to <strong>&quot;Streamable HTTP&quot;</strong>.
                </li>
                <li>
                  Set Authentication to <strong>&quot;None&quot;</strong>.
                </li>
                <li>
                  Click <strong>Add</strong>.
                </li>
              </ol>
            </Card>
          </TabsContent>

          {/* 4. Gemini */}
          <TabsContent value="gemini" className="mt-4">
            <Card className="p-5 sm:p-6 bg-surface border-border space-y-4">
              <h3 className="font-serif font-bold text-ink text-base">
                Connect Gemini (AI Ultra, personal account, web)
              </h3>
              <ol className="space-y-2.5 text-xs text-ink/90 list-decimal pl-5 leading-relaxed">
                <li>
                  Go to <strong>Settings</strong> → <strong>Connected Apps</strong>.
                </li>
                <li>
                  Click <strong>Add a custom app</strong>.
                </li>
                <li>
                  Paste URL:{" "}
                  <code className="text-ink font-mono text-[11px] bg-bg px-1.5 py-0.5 rounded border border-border">
                    {mcpConnectionUrl || `${appUrl}/api/c/<YOUR_TOKEN>/mcp`}
                  </code>
                </li>
                <li>
                  Confirm and enable {APP_NAME}.
                </li>
              </ol>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-[11px] text-muted italic flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 shrink-0" />
          Note: Menu names and settings locations change often in AI platforms; if a label differs slightly, look for &quot;Connectors&quot;, &quot;Apps&quot;, or &quot;Custom MCP&quot;.
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
