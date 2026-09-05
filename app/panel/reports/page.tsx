"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconDownload,
  IconSearch,
  IconCheck,
  IconClock,
  IconFilter,
  IconDotsVertical,
  IconActivity,
  IconBolt,
  IconUsers,
  IconDatabase,
  IconPlus,
  IconChevronRight,
  IconChevronDown,
  IconAlertCircle,
  IconAlertTriangle,
} from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ReportItem {
  id: string;
  code: string;
  name: string;
  refreshedAt: string;
  owner: {
    name: string;
    role: string;
    avatar?: string;
    initials: string;
  };
  source: "Activities" | "Deals" | "Contacts" | "Billing";
  risk: "Healthy" | "Critical" | "Warning" | "Low";
  volumeRows: string;
  volumeLag: string;
  status: "Live" | "Reviewing" | "Deprecated";
}

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: "rep-1",
    code: "REP-1847",
    name: "activity_coverage_daily",
    refreshedAt: "Refreshed 09:10",
    owner: {
      name: "Kenji Tan",
      role: "Finance reporting analyst",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      initials: "KT",
    },
    source: "Activities",
    risk: "Healthy",
    volumeRows: "203.7k rows",
    volumeLag: "6m refresh lag",
    status: "Live",
  },
  {
    id: "rep-2",
    code: "REP-1842",
    name: "pipeline_velocity_weekly",
    refreshedAt: "Refreshed 09:20",
    owner: {
      name: "Mira Stone",
      role: "Revenue operations lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      initials: "MS",
    },
    source: "Deals",
    risk: "Healthy",
    volumeRows: "184.2k rows",
    volumeLag: "9m refresh lag",
    status: "Live",
  },
  {
    id: "rep-3",
    code: "REP-1845",
    name: "lead_source_attribution",
    refreshedAt: "Refreshed 06:35",
    owner: {
      name: "Sana Qureshi",
      role: "Data quality engineer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
      initials: "SQ",
    },
    source: "Contacts",
    risk: "Critical",
    volumeRows: "128.3k rows",
    volumeLag: "42m lag warning",
    status: "Reviewing",
  },
  {
    id: "rep-4",
    code: "REP-1853",
    name: "contact_hygiene_audit",
    refreshedAt: "Refreshed 04:00",
    owner: {
      name: "Sana Qureshi",
      role: "Data quality engineer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
      initials: "SQ",
    },
    source: "Contacts",
    risk: "Low",
    volumeRows: "Paused",
    volumeLag: "No live volume",
    status: "Deprecated",
  },
  {
    id: "rep-5",
    code: "REP-1843",
    name: "win_rate_by_owner",
    refreshedAt: "Refreshed 08:45",
    owner: {
      name: "Leo Grant",
      role: "Sales analytics manager",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      initials: "LG",
    },
    source: "Deals",
    risk: "Warning",
    volumeRows: "76.8k rows",
    volumeLag: "18m lag warning",
    status: "Reviewing",
  },
  {
    id: "rep-6",
    code: "REP-1857",
    name: "meeting_to_deal_conversion",
    refreshedAt: "Refreshed 09:05",
    owner: {
      name: "Kenji Tan",
      role: "Finance reporting analyst",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      initials: "KT",
    },
    source: "Activities",
    risk: "Healthy",
    volumeRows: "58.3k rows",
    volumeLag: "11m refresh lag",
    status: "Live",
  },
  {
    id: "rep-7",
    code: "REP-1860",
    name: "editorial_readership_cohorts",
    refreshedAt: "Refreshed 09:30",
    owner: {
      name: "Mira Stone",
      role: "Revenue operations lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      initials: "MS",
    },
    source: "Deals",
    risk: "Healthy",
    volumeRows: "94.1k rows",
    volumeLag: "4m refresh lag",
    status: "Live",
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [timeRange, setTimeRange] = useState<"3M" | "6M" | "12M">("6M");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["rep-2", "rep-3"]));
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDataset, setSelectedDataset] = useState<string>("All datasets");
  const [selectedStatus, setSelectedStatus] = useState<string>("All status");
  const [bulkAssignOwner, setBulkAssignOwner] = useState<string>("Mira Stone");
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState<string>("Live");
  const [page, setPage] = useState<number>(1);
  const rowsPerPage = 6;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedDataset !== "All datasets" && r.source !== selectedDataset) return false;
      if (selectedStatus !== "All status" && r.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.owner.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [reports, selectedDataset, selectedStatus, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / rowsPerPage));
  const displayedReports = filteredReports.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === displayedReports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedReports.map((r) => r.id)));
    }
  };

  const handleBulkAssignOwner = () => {
    if (selectedIds.size === 0) return;
    setReports((prev) =>
      prev.map((r) =>
        selectedIds.has(r.id) ? { ...r, owner: { ...r.owner, name: bulkAssignOwner } } : r
      )
    );
    toast.success(`Assigned ${selectedIds.size} report(s) to ${bulkAssignOwner}`);
  };

  const handleBulkUpdateStatus = () => {
    if (selectedIds.size === 0) return;
    setReports((prev) =>
      prev.map((r) =>
        selectedIds.has(r.id) ? { ...r, status: bulkUpdateStatus as any } : r
      )
    );
    toast.success(`Updated ${selectedIds.size} report(s) to ${bulkUpdateStatus}`);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Code", "Report", "Owner", "Role", "Source", "Risk", "Volume", "Status"];
    const rows = filteredReports.map((r) => [
      r.id,
      r.code,
      r.name,
      `"${r.owner.name}"`,
      `"${r.owner.role}"`,
      r.source,
      r.risk,
      `"${r.volumeRows}"`,
      r.status,
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report-catalog-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported report catalog to CSV");
  };

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/panel/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>&gt;</span>
        <span className="text-foreground font-medium">Reports</span>
      </nav>

      {/* ── Top 4 KPI Ribbon with Sparklines ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Metric 1: Total Revenue */}
        <Card className="border bg-card/80 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground font-bold">
                $
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <IconTrendingUp className="h-3 w-3" />
                8.2%
              </span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                TOTAL REVENUE
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground">
                $1.24M
              </div>
            </div>
            {/* Smooth SVG Sparkline (Green) */}
            <div className="h-8 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 28" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,22 Q20,18 40,20 T80,12 T120,6 L120,28 L0,28 Z"
                  fill="url(#greenGrad)"
                />
                <path
                  d="M0,22 Q20,18 40,20 T80,12 T120,6"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Deals Won */}
        <Card className="border bg-card/80 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center text-teal-400">
                <IconCheck className="h-4 w-4" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <IconTrendingUp className="h-3 w-3" />
                5.4%
              </span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                DEALS WON
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground">
                142
              </div>
            </div>
            {/* Smooth SVG Sparkline (Teal/Green) */}
            <div className="h-8 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 28" preserveAspectRatio="none">
                <path
                  d="M0,20 Q30,16 60,18 T120,8 L120,28 L0,28 Z"
                  fill="url(#greenGrad)"
                />
                <path
                  d="M0,20 Q30,16 60,18 T120,8"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Pipeline Value */}
        <Card className="border bg-card/80 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center text-purple-400">
                <IconActivity className="h-4 w-4" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <IconTrendingUp className="h-3 w-3" />
                12.3%
              </span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                PIPELINE VALUE
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground">
                $4.8M
              </div>
            </div>
            {/* Smooth SVG Sparkline (Teal) */}
            <div className="h-8 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 28" preserveAspectRatio="none">
                <path
                  d="M0,24 Q30,22 60,14 T120,8 L120,28 L0,28 Z"
                  fill="url(#greenGrad)"
                />
                <path
                  d="M0,24 Q30,22 60,14 T120,8"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Win Rate */}
        <Card className="border bg-card/80 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center text-amber-400">
                <IconBolt className="h-4 w-4" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <IconTrendingDown className="h-3 w-3" />
                1.2%
              </span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                WIN RATE
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground">
                34%
              </div>
            </div>
            {/* Smooth SVG Sparkline (Red) */}
            <div className="h-8 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 28" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,10 Q30,12 60,11 T120,13 L120,28 L0,28 Z"
                  fill="url(#redGrad)"
                />
                <path
                  d="M0,10 Q30,12 60,11 T120,13"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Mid Section: Revenue Trend & Revenue by Channel ── */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Revenue Trend Chart (8 cols on lg) */}
        <Card className="lg:col-span-8 border bg-card/80 shadow-xs">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Revenue trend</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                <strong className="text-foreground">$1.82M</strong> across the period
              </p>
            </div>

            {/* Time Toggles: 3M | 6M | 12M */}
            <div className="flex items-center rounded-xl bg-muted/60 p-1 border">
              {(["3M", "6M", "12M"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                    timeRange === t
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-4">
            {/* Smooth Violet Glowing Spline Area Chart */}
            <div className="h-56 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="violetArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="currentColor" strokeOpacity="0.06" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="currentColor" strokeOpacity="0.06" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="currentColor" strokeOpacity="0.06" />

                {/* Filled gradient area */}
                <path
                  d="M 10 140 C 100 130, 160 145, 220 135 C 280 120, 360 100, 440 90 C 520 80, 560 65, 595 50 L 595 190 L 10 190 Z"
                  fill="url(#violetArea)"
                />

                {/* Smooth vibrant curve line */}
                <path
                  d="M 10 140 C 100 130, 160 145, 220 135 C 280 120, 360 100, 440 90 C 520 80, 560 65, 595 50"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>

              {/* Month Axes Markers */}
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground pt-3 px-3 border-t">
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Revenue by Channel (4 cols on lg) */}
        <Card className="lg:col-span-4 border bg-card/80 shadow-xs">
          <CardHeader className="p-5 pb-3 border-b">
            <CardTitle className="text-base font-bold text-foreground">Revenue by channel</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">This quarter, in thousands</p>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            {/* Outbound */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-medium">
                <span className="text-foreground">Outbound</span>
                <span className="font-mono text-muted-foreground">
                  <strong className="text-foreground font-semibold">$486k</strong> 39%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 w-[39%]" />
              </div>
            </div>

            {/* Inbound */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-medium">
                <span className="text-foreground">Inbound</span>
                <span className="font-mono text-muted-foreground">
                  <strong className="text-foreground font-semibold">$372k</strong> 30%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full rounded-full bg-teal-400 w-[30%]" />
              </div>
            </div>

            {/* Partner */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-medium">
                <span className="text-foreground">Partner</span>
                <span className="font-mono text-muted-foreground">
                  <strong className="text-foreground font-semibold">$214k</strong> 17%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 w-[17%]" />
              </div>
            </div>

            {/* Referral */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-medium">
                <span className="text-foreground">Referral</span>
                <span className="font-mono text-muted-foreground">
                  <strong className="text-foreground font-semibold">$168k</strong> 14%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 w-[14%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Lower Analytics Telemetry: Report Coverage, Dataset Mix, Refresh Lag ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Coverage Meter */}
        <Card className="border bg-card/80 shadow-xs">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Report Coverage</span>
              <IconActivity className="h-3.5 w-3.5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-extrabold font-mono text-foreground">60%</div>
              <div className="text-xs text-muted-foreground">
                <strong className="text-emerald-500">6/10</strong> of the catalog is live
              </div>
            </div>

            {/* Vertical Segmented Bar Meter */}
            <div className="flex items-center gap-1 h-8 w-full py-1">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-sm ${
                    i < 15 ? "bg-emerald-500" : "bg-muted/60"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
              <span>Delivery: <strong className="text-foreground">26 subscribers</strong></span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] mr-1">6 Owners</span>
                <div className="flex -space-x-1.5">
                  <div className="h-5 w-5 rounded-full bg-purple-500/80 text-[9px] font-bold text-white flex items-center justify-center border border-background">
                    M
                  </div>
                  <div className="h-5 w-5 rounded-full bg-teal-500/80 text-[9px] font-bold text-white flex items-center justify-center border border-background">
                    K
                  </div>
                  <div className="h-5 w-5 rounded-full bg-amber-500/80 text-[9px] font-bold text-white flex items-center justify-center border border-background">
                    S
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dataset Mix Donut */}
        <Card className="border bg-card/80 shadow-xs">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Dataset Mix</span>
              <span className="text-[10px] text-muted-foreground font-mono">Last refresh</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex items-center gap-4">
            {/* Donut graphic */}
            <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#2dd4bf" strokeWidth="4" strokeDasharray="36 64" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="57 43" strokeDashoffset="-36" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f43f5e" strokeWidth="4" strokeDasharray="7 93" strokeDashoffset="-93" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Rows</span>
                <span className="text-xs font-extrabold font-mono text-foreground">854k</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-teal-400" />
                  Deals
                </span>
                <span className="font-mono text-muted-foreground">307k <span className="text-[10px]">36%</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Contacts & act.
                </span>
                <span className="font-mono text-muted-foreground">487k <span className="text-[10px]">57%</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Billing
                </span>
                <span className="font-mono text-muted-foreground">60k <span className="text-[10px]">7%</span></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Lag Zone */}
        <Card className="border bg-card/80 shadow-xs sm:col-span-2 lg:col-span-1">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Refresh Lag Zone</span>
              <span className="text-[10px] text-muted-foreground font-mono">slowest</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-extrabold font-mono text-foreground">55 min</div>
              <div className="text-xs text-emerald-500 font-medium">
                ↘ 60% under 15m
              </div>
            </div>

            {/* Latency Scale Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden flex">
                <div className="h-full bg-emerald-500 w-[25%]" />
                <div className="h-full bg-teal-400 w-[25%]" />
                <div className="h-full bg-amber-500 w-[25%]" />
                <div className="h-full bg-rose-500 w-[25%]" />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>0m</span>
                <span>15m</span>
                <span>30m</span>
                <span>60m</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Report Catalog Table with Bulk Actions ── */}
      <Card className="border bg-card/85 shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Report Catalog</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              10 visible · 0 unowned · 4 need attention
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[180px] max-w-xs">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="h-8.5 w-full rounded-xl border border-border/70 bg-card pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Dataset filter */}
            <select
              value={selectedDataset}
              onChange={(e) => {
                setSelectedDataset(e.target.value);
                setPage(1);
              }}
              aria-label="Filter reports by dataset"
              className="h-8.5 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="All datasets">All datasets</option>
              <option value="Activities">Activities</option>
              <option value="Deals">Deals</option>
              <option value="Contacts">Contacts</option>
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter reports by status"
              className="h-8.5 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="All status">All status</option>
              <option value="Live">Live</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Deprecated">Deprecated</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-8.5 px-3 text-xs gap-1.5"
            >
              <IconDownload className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </CardHeader>

        {/* ── Contextual Bulk Action Bar ── */}
        {selectedIds.size > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 px-4 bg-muted/40 border-b text-xs animate-in fade-in duration-150">
            <div>
              <div className="font-semibold text-foreground">{selectedIds.size} reports selected</div>
              <div className="text-[11px] text-muted-foreground">
                Assign ownership or move selected reports in one step.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bulkAssignOwner}
                onChange={(e) => setBulkAssignOwner(e.target.value)}
                aria-label="Assign owner to selected reports"
                className="h-8 rounded-lg border border-border/70 bg-card px-2.5 text-xs font-medium text-foreground"
              >
                <option value="Mira Stone">Mira Stone</option>
                <option value="Kenji Tan">Kenji Tan</option>
                <option value="Sana Qureshi">Sana Qureshi</option>
                <option value="Leo Grant">Leo Grant</option>
              </select>
              <Button size="sm" variant="outline" onClick={handleBulkAssignOwner} className="h-8 text-xs gap-1">
                <IconUsers className="h-3.5 w-3.5" />
                Assign owner
              </Button>

              <select
                value={bulkUpdateStatus}
                onChange={(e) => setBulkUpdateStatus(e.target.value)}
                aria-label="Update status of selected reports"
                className="h-8 rounded-lg border border-border/70 bg-card px-2.5 text-xs font-medium text-foreground"
              >
                <option value="Live">Live</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Deprecated">Deprecated</option>
              </select>
              <Button size="sm" onClick={handleBulkUpdateStatus} className="h-8 text-xs gap-1 font-semibold">
                <IconCheck className="h-3.5 w-3.5" />
                Update status
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* ── Table Rows ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all reports"
                    checked={selectedIds.size === displayedReports.length && displayedReports.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-border/70 accent-primary cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Report</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {displayedReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground">
                    No reports match the current filters.
                  </td>
                </tr>
              ) : (
                displayedReports.map((report) => {
                  const isChecked = selectedIds.has(report.id);

                  return (
                    <tr
                      key={report.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isChecked ? "bg-primary/[0.04]" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          aria-label={`Select report ${report.name}`}
                          checked={isChecked}
                          onChange={() => toggleSelectRow(report.id)}
                          className="h-4 w-4 rounded border-border/70 accent-primary cursor-pointer"
                        />
                      </td>

                      {/* Report Name + Code */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                          {report.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-sans">
                          {report.code} · {report.refreshedAt}
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-border/80">
                            {report.owner.avatar && (
                              <AvatarImage src={report.owner.avatar} alt={report.owner.name} />
                            )}
                            <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                              {report.owner.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground leading-tight">
                              {report.owner.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground leading-tight">
                              {report.owner.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            report.source === "Activities"
                              ? "bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30"
                              : report.source === "Deals"
                              ? "bg-purple-500/15 text-purple-500 dark:text-purple-400 border border-purple-500/30"
                              : "bg-teal-500/15 text-teal-500 dark:text-teal-400 border border-teal-500/30"
                          }`}
                        >
                          <span className="text-[10px]">⚡</span>
                          {report.source}
                        </span>
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            report.risk === "Healthy"
                              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                              : report.risk === "Critical"
                              ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                              : report.risk === "Warning"
                              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {report.risk}
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="font-semibold text-foreground">{report.volumeRows}</div>
                        <div className="text-[10px] text-muted-foreground font-sans">{report.volumeLag}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            report.status === "Live"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : report.status === "Reviewing"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              report.status === "Live"
                                ? "bg-emerald-500"
                                : report.status === "Reviewing"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {report.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          aria-label={`Actions for report ${report.name}`}
                          className="h-7 w-7 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <IconDotsVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer Pagination ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 px-4 border-t bg-muted/20 text-xs text-muted-foreground">
          <div>
            Showing 1 - {displayedReports.length} of {filteredReports.length} reports
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2.5 text-xs"
            >
              Previous
            </Button>
            <span className="px-2 font-mono text-xs text-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 px-2.5 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
