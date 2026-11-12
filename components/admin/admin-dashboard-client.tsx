"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow, format, subDays, isAfter } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  GraduationCap,
  BookOpen,
  Activity,
  Bot,
  Sparkles,
  HelpCircle,
  FileText,
  Crown,
  IndianRupee,
  AlertTriangle,
  RotateCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemeToggle } from "@/components/theme-toggle";

export interface AdminEventRow {
  id: number;
  created_at: string;
  actor_id: string | null;
  actor_role: string | null;
  event: string;
  source: "mcp" | "app";
  tool: string | null;
  client_name: string | null;
  batch_id: string | null;
  item_id: string | null;
  success: boolean;
  duration_ms: number | null;
  meta: Record<string, unknown>;
  actor_name?: string;
  batch_name?: string;
}

export interface AdminDashboardProps {
  initialEvents: AdminEventRow[];
  profiles: Array<{
    id: string;
    email: string;
    full_name: string;
    role: "tutor" | "student";
    created_at: string;
    last_seen_at: string | null;
  }>;
  batches: Array<{
    id: string;
    tutor_id: string;
    name: string;
    created_at: string;
  }>;
  items: Array<{
    id: string;
    tutor_id: string;
    batch_id: string | null;
    type: "quiz" | "notes" | "assignment" | "announcement";
    source: "mcp" | "app";
    created_at: string;
  }>;
  attemptsCount: number;
  submissionsCount: number;
  payments: Array<{
    id: string;
    amount_inr: number;
    commission_inr: number;
    created_at: string;
  }>;
}

export function AdminDashboardClient({
  initialEvents,
  profiles,
  batches,
  items,
  attemptsCount,
  submissionsCount,
  payments,
}: AdminDashboardProps) {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "all">("7d");
  const [events, setEvents] = useState<AdminEventRow[]>(initialEvents);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Auto-refresh feed every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/feed");
        if (res.ok) {
          const fresh = await res.json();
          if (Array.isArray(fresh.events)) {
            setEvents(fresh.events);
            setLastRefreshed(new Date());
          }
        }
      } catch (e) {
        console.error("Failed to auto-refresh live feed:", e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/feed");
      if (res.ok) {
        const fresh = await res.json();
        if (Array.isArray(fresh.events)) {
          setEvents(fresh.events);
          setLastRefreshed(new Date());
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper date cutoffs
  const now = new Date();
  const cutoffDays = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 9999;
  const cutoffDate = subDays(now, cutoffDays);
  const prev7dStart = subDays(now, 14);
  const current7dStart = subDays(now, 7);

  // Filtered dataset helpers
  const filterByRange = (dateStr: string) => isAfter(new Date(dateStr), cutoffDate);

  const tutors = profiles.filter((p) => p.role === "tutor");
  const students = profiles.filter((p) => p.role === "student");

  // 1. KPI Calculations (Current 7d vs Previous 7d for change)
  const tutorsCurrent7d = tutors.filter((t) => isAfter(new Date(t.created_at), current7dStart)).length;
  const tutorsPrev7d = tutors.filter(
    (t) => isAfter(new Date(t.created_at), prev7dStart) && !isAfter(new Date(t.created_at), current7dStart)
  ).length;

  const studentsCurrent7d = students.filter((s) => isAfter(new Date(s.created_at), current7dStart)).length;
  const studentsPrev7d = students.filter(
    (s) => isAfter(new Date(s.created_at), prev7dStart) && !isAfter(new Date(s.created_at), current7dStart)
  ).length;

  const batchesCurrent7d = batches.filter((b) => isAfter(new Date(b.created_at), current7dStart)).length;
  const batchesPrev7d = batches.filter(
    (b) => isAfter(new Date(b.created_at), prev7dStart) && !isAfter(new Date(b.created_at), current7dStart)
  ).length;

  // Active users in last 7d from last_seen_at
  const active7dUsers = profiles.filter(
    (p) => p.last_seen_at && isAfter(new Date(p.last_seen_at), current7dStart)
  ).length;

  // MCP calls 7d
  const mcpCalls = events.filter((e) => e.source === "mcp" && e.event === "mcp_tool_call");
  const mcpCallsCurrent7d = mcpCalls.filter((e) => isAfter(new Date(e.created_at), current7dStart)).length;
  const mcpCallsPrev7d = mcpCalls.filter(
    (e) => isAfter(new Date(e.created_at), prev7dStart) && !isAfter(new Date(e.created_at), current7dStart)
  ).length;

  // Items created via AI vs Manual
  const filteredItems = items.filter((i) => filterByRange(i.created_at));
  const aiItemsCount = filteredItems.filter((i) => i.source === "mcp").length;
  const manualItemsCount = filteredItems.filter((i) => i.source === "app").length;

  // Payments / Revenue
  const filteredPayments = payments.filter((p) => filterByRange(p.created_at));
  const gmvInr = filteredPayments.reduce((acc, p) => acc + p.amount_inr, 0);
  const unlocksCount = filteredPayments.length;

  // Calculate percentage change helper
  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? "+100%" : "0%";
    const pct = Math.round(((curr - prev) / prev) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };

  // 2. Charts Data
  // A. Daily signups by role (last 30d)
  const last30Days = Array.from({ length: 30 })
    .map((_, i) => subDays(now, 29 - i))
    .map((d) => format(d, "yyyy-MM-dd"));

  const signupsChartData = last30Days.map((day) => {
    const tutorsCount = tutors.filter((t) => format(new Date(t.created_at), "yyyy-MM-dd") === day).length;
    const studentsCount = students.filter((s) => format(new Date(s.created_at), "yyyy-MM-dd") === day).length;
    return {
      date: format(new Date(day), "MMM dd"),
      Tutors: tutorsCount,
      Students: studentsCount,
    };
  });

  // B. Daily MCP calls stacked by AI client (last 30d)
  const mcpClients = ["Claude", "ChatGPT", "Perplexity", "Gemini", "Other"] as const;
  const mcpCallsChartData = last30Days.map((day) => {
    const dayCalls = mcpCalls.filter((e) => format(new Date(e.created_at), "yyyy-MM-dd") === day);
    const row: Record<string, string | number> = { date: format(new Date(day), "MMM dd") };
    mcpClients.forEach((client) => {
      row[client] = dayCalls.filter((c) => (c.client_name || "Other") === client).length;
    });
    return row;
  });

  // C. MCP calls by tool (bar)
  const toolCounts: Record<string, number> = {};
  mcpCalls.forEach((call) => {
    const tool = call.tool || "unknown";
    toolCounts[tool] = (toolCounts[tool] || 0) + 1;
  });
  const toolsChartData = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tool, count]) => ({ tool, calls: count }));

  // D. Content created by type and source
  const contentTypes = ["quiz", "notes", "assignment", "announcement"] as const;
  const contentChartData = contentTypes.map((type) => {
    const matching = filteredItems.filter((i) => i.type === type);
    return {
      type: type.toUpperCase(),
      "AI (MCP)": matching.filter((i) => i.source === "mcp").length,
      "Manual (App)": matching.filter((i) => i.source === "app").length,
    };
  });

  // 3. Top Tutors Table
  const tutorStats = tutors.map((t) => {
    const tutorBatches = batches.filter((b) => b.tutor_id === t.id);
    const tutorCalls = mcpCalls.filter((e) => e.actor_id === t.id).length;
    return {
      id: t.id,
      name: t.full_name,
      email: t.email,
      batchCount: tutorBatches.length,
      mcpCalls: tutorCalls,
      lastActive: t.last_seen_at,
    };
  }).sort((a, b) => b.mcpCalls - a.mcpCalls || b.batchCount - a.batchCount).slice(0, 10);

  // 4. Failed MCP calls (last 20)
  const failedMcpCalls = events
    .filter((e) => e.source === "mcp" && !e.success)
    .slice(0, 20);

  // Helper for human-readable live feed
  const formatEventText = (e: AdminEventRow) => {
    const actor = e.actor_name || (e.actor_role === "tutor" ? "A tutor" : e.actor_role === "student" ? "A student" : "A user");
    const client = e.client_name ? `via ${e.client_name}` : "";

    switch (e.event) {
      case "mcp_tool_call":
        return `${actor} ran MCP tool "${e.tool}" ${client}`;
      case "tutor_registered":
        return `${actor} registered as a Tutor`;
      case "student_registered":
        return `${actor} registered as a Student`;
      case "login":
        return `${actor} signed in`;
      case "batch_created":
        return `${actor} created a new batch`;
      case "students_added":
        return `${actor} enrolled ${Number(e.meta?.count) || 1} student(s) ${client}`;
      case "batch_joined":
        return `${actor} joined batch "${e.batch_name || "classroom"}"`;
      case "join_pending":
        return `${actor} requested to join a batch`;
      case "item_published":
        return `${actor} published a ${String(e.meta?.type || "content item")} ${e.source === "mcp" ? "via AI" : "manually"}`;
      case "quiz_submitted":
        return `${actor} completed a quiz (score: ${e.meta?.score_pct ?? "?"}%)`;
      case "assignment_submitted":
        return `${actor} submitted an assignment`;
      case "submission_graded":
        return `${actor} graded a submission`;
      case "premium_unlocked":
        return `${actor} unlocked premium access (₹${e.meta?.amount_inr ?? 0})`;
      case "install_prompt_accepted":
        return `${actor} installed Classy PWA app`;
      default:
        return `${actor} triggered ${e.event}`;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between selection:bg-primary-soft selection:text-primary">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              C
            </div>
            <div>
              <h1 className="font-serif font-bold text-base sm:text-lg text-ink leading-tight flex items-center gap-2">
                Classy Founder Console
                <Badge className="bg-primary-soft text-primary border-transparent text-[10px] uppercase font-semibold tracking-wider">
                  Live
                </Badge>
              </h1>
              <p className="text-[11px] text-muted hidden sm:block">
                Platform telemetry, educator growth, and business health
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/t">
            <Button variant="ghost" size="sm" className="rounded-xl border border-border/60 h-8 px-2.5 text-xs text-muted hover:text-ink gap-1">
              <span>Tutor View</span>
            </Button>
          </Link>
          {/* Date range filter */}
          <div className="flex items-center rounded-xl bg-bg border border-border p-0.5 text-xs font-semibold">
            {(["7d", "30d", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all ${
                  dateRange === r ? "bg-surface text-primary shadow-xs font-bold" : "text-muted hover:text-ink"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="rounded-xl border-border h-8 px-2.5 text-xs gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : "text-muted"}`} />
            <span className="hidden md:inline">Refresh</span>
          </Button>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =================================================================== */}
        {/* 1. KPI CARDS GRID (2 cols on mobile, 5 cols on lg) */}
        {/* =================================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Core Metrics Overview
            </h2>
            <span className="text-[11px] text-muted">
              Auto-refreshing • Last updated {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* 1. Tutors */}
            <Card className="rounded-2xl border-border bg-surface shadow-2xs">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs font-medium flex items-center justify-between">
                  <span>Tutors</span>
                  <Users className="w-3.5 h-3.5 text-primary" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  {tutors.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted flex items-center gap-1">
                {tutorsCurrent7d >= tutorsPrev7d ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                )}
                <span>{calcChange(tutorsCurrent7d, tutorsPrev7d)} vs prev 7d</span>
              </CardContent>
            </Card>

            {/* 2. Students */}
            <Card className="rounded-2xl border-border bg-surface shadow-2xs">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs font-medium flex items-center justify-between">
                  <span>Students</span>
                  <GraduationCap className="w-3.5 h-3.5 text-accent" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  {students.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted flex items-center gap-1">
                {studentsCurrent7d >= studentsPrev7d ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                )}
                <span>{calcChange(studentsCurrent7d, studentsPrev7d)} vs prev 7d</span>
              </CardContent>
            </Card>

            {/* 3. Batches */}
            <Card className="rounded-2xl border-border bg-surface shadow-2xs">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs font-medium flex items-center justify-between">
                  <span>Batches</span>
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  {batches.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted flex items-center gap-1">
                {batchesCurrent7d >= batchesPrev7d ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                )}
                <span>{calcChange(batchesCurrent7d, batchesPrev7d)} vs prev 7d</span>
              </CardContent>
            </Card>

            {/* 4. Active Users 7d */}
            <Card className="rounded-2xl border-border bg-surface shadow-2xs">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs font-medium flex items-center justify-between">
                  <span>Active Users (7d)</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  {active7dUsers}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted">
                <span>From profiles.last_seen_at</span>
              </CardContent>
            </Card>

            {/* 5. MCP Calls 7d */}
            <Card className="rounded-2xl border-border bg-surface shadow-2xs">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs font-medium flex items-center justify-between">
                  <span>MCP Calls (7d)</span>
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  {mcpCallsCurrent7d}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted flex items-center gap-1">
                {mcpCallsCurrent7d >= mcpCallsPrev7d ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                )}
                <span>{calcChange(mcpCallsCurrent7d, mcpCallsPrev7d)} vs prev 7d</span>
              </CardContent>
            </Card>

            {/* 6. AI vs Manual Items */}
            <Card className="rounded-2xl border-border bg-surface shadow-2xs">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs font-medium flex items-center justify-between">
                  <span>AI vs Manual Items</span>
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  {aiItemsCount} <span className="text-sm font-sans text-muted">/ {manualItemsCount}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted">
                <span>{Math.round((aiItemsCount / Math.max(1, filteredItems.length)) * 100)}% created via MCP</span>
              </CardContent>
            </Card>

            {/* 7. Quiz Attempts */}
            <Card className="rounded-2xl border-border bg-surface shadow-2xs">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs font-medium flex items-center justify-between">
                  <span>Quiz Attempts</span>
                  <HelpCircle className="w-3.5 h-3.5 text-primary" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  {attemptsCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted">
                <span>Evaluated against fixed keys</span>
              </CardContent>
            </Card>

            {/* 8. Submissions */}
            <Card className="rounded-2xl border-border bg-surface shadow-2xs">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs font-medium flex items-center justify-between">
                  <span>Submissions</span>
                  <FileText className="w-3.5 h-3.5 text-accent" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  {submissionsCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted">
                <span>Assignments turned in</span>
              </CardContent>
            </Card>

            {/* 9. Premium Unlocks */}
            <Card className="rounded-2xl border-border bg-surface shadow-2xs">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs font-medium flex items-center justify-between">
                  <span>Premium Unlocks</span>
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  {unlocksCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted">
                <span>Paid student 30-day tiers</span>
              </CardContent>
            </Card>

            {/* 10. Platform GMV */}
            <Card className="rounded-2xl border-border bg-surface shadow-2xs">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs font-medium flex items-center justify-between">
                  <span>Platform GMV</span>
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  ₹{gmvInr}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted">
                <span>100% routed to tutors (₹0 platform fee)</span>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 2. RECHARTS SECTION (Responsive, Light & Dark Friendly) */}
        {/* =================================================================== */}
        <section className="space-y-6">
          <h2 className="font-serif text-lg font-bold text-ink">
            Growth & AI Client Usage Trends
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Daily signups by role (30d) */}
            <Card className="rounded-3xl border-border bg-surface shadow-xs p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-serif font-bold text-ink">
                  Daily Signups by Role (30 Days)
                </CardTitle>
                <CardDescription className="text-xs text-muted">
                  New tutor and student registrations
                </CardDescription>
              </CardHeader>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={signupsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tutorsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Area type="monotone" dataKey="Tutors" stroke="#4F46E5" fill="url(#tutorsGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Students" stroke="#10B981" fill="url(#studentsGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 2: Daily MCP calls stacked by AI client (30d) */}
            <Card className="rounded-3xl border-border bg-surface shadow-xs p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-serif font-bold text-ink">
                  Daily MCP Calls by AI Client (30 Days)
                </CardTitle>
                <CardDescription className="text-xs text-muted">
                  Volume of calls initiated from Claude, ChatGPT, Gemini, and Perplexity
                </CardDescription>
              </CardHeader>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mcpCallsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar dataKey="Claude" stackId="a" fill="#D97706" />
                    <Bar dataKey="ChatGPT" stackId="a" fill="#10B981" />
                    <Bar dataKey="Perplexity" stackId="a" fill="#0284C7" />
                    <Bar dataKey="Gemini" stackId="a" fill="#6366F1" />
                    <Bar dataKey="Other" stackId="a" fill="#6B7280" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 3: MCP Calls by Tool */}
            <Card className="rounded-3xl border-border bg-surface shadow-xs p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-serif font-bold text-ink">
                  MCP Tool Invocations
                </CardTitle>
                <CardDescription className="text-xs text-muted">
                  Frequency of tool execution by tutors&apos; AI assistants
                </CardDescription>
              </CardHeader>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={toolsChartData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis dataKey="tool" type="category" tick={{ fontSize: 10 }} stroke="#888888" width={110} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="calls" fill="#4F46E5" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 4: Content Created by Type & Source */}
            <Card className="rounded-3xl border-border bg-surface shadow-xs p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-serif font-bold text-ink">
                  Content Creation: AI (MCP) vs Manual (App)
                </CardTitle>
                <CardDescription className="text-xs text-muted">
                  Distribution across quizzes, notes, assignments, and announcements
                </CardDescription>
              </CardHeader>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="type" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar dataKey="AI (MCP)" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Manual (App)" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 3. TABLES SECTION */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Tutors Table */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Top Tutors
            </h2>
            <Card className="rounded-3xl border-border bg-surface overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Tutor Name</TableHead>
                      <TableHead className="text-xs text-center">Batches</TableHead>
                      <TableHead className="text-xs text-center">MCP Calls</TableHead>
                      <TableHead className="text-xs text-right">Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tutorStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-xs text-muted">
                          No tutor activity recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tutorStats.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium text-xs">
                            <div className="truncate max-w-[140px] sm:max-w-none text-ink font-semibold">
                              {t.name}
                            </div>
                            <div className="text-[11px] text-muted truncate max-w-[140px] sm:max-w-none">
                              {t.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs font-mono font-semibold">
                            {t.batchCount}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            <Badge className="bg-primary-soft text-primary border-transparent text-[11px] font-mono">
                              {t.mcpCalls}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted">
                            {t.lastActive ? formatDistanceToNow(new Date(t.lastActive), { addSuffix: true }) : "Never"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </section>

          {/* Failed MCP Calls Table (Last 20) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Failed MCP Calls (Last 20)
              </h2>
              <span className="text-xs text-muted">Debugging log</span>
            </div>

            <Card className="rounded-3xl border-border bg-surface overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Tool</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs">Duration</TableHead>
                      <TableHead className="text-xs text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedMcpCalls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-xs text-muted">
                          🎉 Zero failed MCP tool calls. All executions succeeded!
                        </TableCell>
                      </TableRow>
                    ) : (
                      failedMcpCalls.map((fc) => (
                        <TableRow key={fc.id}>
                          <TableCell className="font-mono text-xs font-semibold text-destructive">
                            {fc.tool || "unknown"}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="border-border text-[10px]">
                              {fc.client_name || "Other"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted font-mono">
                            {fc.duration_ms ? `${fc.duration_ms}ms` : "-"}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted whitespace-nowrap">
                            {formatDistanceToNow(new Date(fc.created_at), { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </section>
        </div>

        {/* =================================================================== */}
        {/* 4. LIVE ACTIVITY FEED (Last 50 events, auto-refresh every 30s) */}
        {/* =================================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-serif text-lg font-bold text-ink">
                Live Activity Feed
              </h2>
            </div>
            <span className="text-xs text-muted">
              Auto-updating • {events.length} events logged
            </span>
          </div>

          <Card className="rounded-3xl border-border bg-surface shadow-xs p-4 sm:p-6">
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 divide-y divide-border/60">
              {events.slice(0, 50).map((e) => (
                <div key={e.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] ${
                        e.source === "mcp"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          : "bg-primary-soft text-primary"
                      }`}
                    >
                      {e.source === "mcp" ? <Bot className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="font-medium text-ink leading-relaxed">
                        {formatEventText(e)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted">
                        <span className="capitalize">{e.source}</span>
                        {e.client_name && <span>• {e.client_name}</span>}
                        {e.duration_ms && <span>• {e.duration_ms}ms</span>}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-muted whitespace-nowrap shrink-0">
                    {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
