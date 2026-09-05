"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  IconShield,
  IconAlertTriangle,
  IconUserCheck,
  IconGauge,
  IconCheck,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconCalendar,
  IconDownload,
  IconChevronRight,
  IconInfoCircle,
  IconFilter,
  IconRefresh,
  IconX,
  IconExternalLink,
  IconArrowUpRight,
  IconKey,
  IconDatabase,
  IconFileExport,
  IconCreditCard,
  IconUsers,
  IconLock,
} from "@tabler/icons-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listAuditLogs } from "@/lib/api/iam";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface AuditEvent {
  id: string;
  code: string;
  title: string;
  status: "Flagged" | "Escalated" | "Throttled" | "Resolved";
  outcome: "Blocked" | "Allowed" | "Flagged";
  category: "API Keys" | "Data Export" | "Billing" | "User Management" | "Security Policy" | "Access Control";
  actor: {
    name: string;
    role: string;
    avatar?: string;
    initials: string;
  };
  resource: {
    target: string;
    scopeUsed: number;
    scopeTotal: number;
  };
  timestamp: string;
  ip: string;
  userAgent: string;
  details: string;
}

const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "evt-1",
    code: "EVT-4822",
    title: "Delete production API key prod-key-4f9c",
    status: "Flagged",
    outcome: "Blocked",
    category: "API Keys",
    actor: {
      name: "Maya Perez",
      role: "Security admin",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      initials: "MP",
    },
    resource: {
      target: "iam.keys.delete",
      scopeUsed: 4,
      scopeTotal: 6,
    },
    timestamp: "09:46 today",
    ip: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0",
    details: "Attempted permanent purge of production gateway authentication key without dual-party authorization sign-off.",
  },
  {
    id: "evt-2",
    code: "EVT-4819",
    title: "Bulk export of 1,847 customer records",
    status: "Escalated",
    outcome: "Flagged",
    category: "Data Export",
    actor: {
      name: "Lara Chen",
      role: "Support lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      initials: "LC",
    },
    resource: {
      target: "data.export.customers",
      scopeUsed: 3,
      scopeTotal: 5,
    },
    timestamp: "09:34 today",
    ip: "10.0.4.218",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/123.0",
    details: "High volume sensitive CRM export initiated outside core operational bureau hours. Escalated to Security Operations.",
  },
  {
    id: "evt-3",
    code: "EVT-4815",
    title: "Access billing ledger for Globex",
    status: "Flagged",
    outcome: "Blocked",
    category: "Billing",
    actor: {
      name: "Noa Kim",
      role: "Platform engineer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
      initials: "NK",
    },
    resource: {
      target: "sso.verify",
      scopeUsed: 2,
      scopeTotal: 4,
    },
    timestamp: "09:21 today",
    ip: "172.16.8.12",
    userAgent: "PostmanRuntime/7.37.0",
    details: "Tenant fiscal data isolation probe detected across mismatched corporate workspace scopes.",
  },
  {
    id: "evt-4",
    code: "EVT-4811",
    title: "Bulk role change on 380 accounts",
    status: "Flagged",
    outcome: "Blocked",
    category: "User Management",
    actor: {
      name: "Emil Novak",
      role: "Database admin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      initials: "EN",
    },
    resource: {
      target: "iam.roles.bulk_update",
      scopeUsed: 2,
      scopeTotal: 4,
    },
    timestamp: "09:02 today",
    ip: "192.168.10.5",
    userAgent: "Python/3.11 aiohttp/3.9.1",
    details: "Automated batch privilege escalation trigger intercepted before write transaction committed.",
  },
  {
    id: "evt-5",
    code: "EVT-4808",
    title: "Grant admin role to 3 contractors",
    status: "Flagged",
    outcome: "Flagged",
    category: "Security Policy",
    actor: {
      name: "Pavel Singh",
      role: "Growth engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      initials: "PS",
    },
    resource: {
      target: "policy.evaluate",
      scopeUsed: 3,
      scopeTotal: 6,
    },
    timestamp: "08:11 today",
    ip: "10.0.12.89",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/124.0",
    details: "Zero-Trust policy violation: external contractor addresses cannot hold unrestricted administrator scopes.",
  },
  {
    id: "evt-6",
    code: "EVT-4806",
    title: "Repeated failed sign-in attempts",
    status: "Flagged",
    outcome: "Blocked",
    category: "Access Control",
    actor: {
      name: "Jonas Reed",
      role: "Compliance reviewer",
      initials: "JR",
    },
    resource: {
      target: "auth.rate_limit",
      scopeUsed: 5,
      scopeTotal: 5,
    },
    timestamp: "07:54 today",
    ip: "203.0.113.42",
    userAgent: "Go-http-client/1.1",
    details: "Rapid consecutive credential brute-force threshold tripped; source IP placed in 60-minute quarantine tier.",
  },
  {
    id: "evt-7",
    code: "EVT-4798",
    title: "API rate limit threshold exceeded (1,200 req/min)",
    status: "Throttled",
    outcome: "Blocked",
    category: "API Keys",
    actor: {
      name: "External Wire Bot",
      role: "Syndication API Client",
      initials: "EB",
    },
    resource: {
      target: "api.articles.feed",
      scopeUsed: 3,
      scopeTotal: 3,
    },
    timestamp: "07:30 today",
    ip: "198.51.100.22",
    userAgent: "SyndicationBot/2.4",
    details: "Automated syndication webhook listener exceeded peak concurrency allowance.",
  },
  {
    id: "evt-8",
    code: "EVT-4790",
    title: "Resolved anomalous token rotation",
    status: "Resolved",
    outcome: "Allowed",
    category: "Access Control",
    actor: {
      name: "Security Daemon",
      role: "IAM Auto-Remediator",
      initials: "SD",
    },
    resource: {
      target: "iam.tokens.rotate",
      scopeUsed: 1,
      scopeTotal: 6,
    },
    timestamp: "06:15 today",
    ip: "127.0.0.1",
    userAgent: "IAM-Worker/1.0",
    details: "Security incident closed out after re-authentication token invalidated across active sessions.",
  },
];

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Statuses");
  const [selectedOutcome, setSelectedOutcome] = useState<string>("All Outcomes");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rowsPerPage, setRowsPerPage] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [inspectingEvent, setInspectingEvent] = useState<AuditEvent | null>(null);

  // Also query live IAM audit logs from backend if available
  const { data: serverLogsData, refetch, isRefetching } = useQuery({
    queryKey: ["iam-audit-logs"],
    queryFn: () => listAuditLogs(1, 50),
    staleTime: 30_000,
  });

  // Calculate Metrics
  const flaggedCount = events.filter((e) => e.status === "Flagged").length;
  const actorsCount = new Set(events.map((e) => e.actor.name)).size;
  const throttledCount = events.filter((e) => e.status === "Throttled").length;
  const resolvedCount = events.filter((e) => e.status === "Resolved").length;

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (selectedCategory !== "All Categories" && e.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== "All Statuses" && e.status !== selectedStatus) {
        return false;
      }
      if (selectedOutcome !== "All Outcomes" && e.outcome !== selectedOutcome) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchCode = e.code.toLowerCase().includes(q);
        const matchActor = e.actor.name.toLowerCase().includes(q);
        const matchTarget = e.resource.target.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchActor && !matchTarget) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedCategory, selectedStatus, selectedOutcome, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / rowsPerPage));
  const displayedEvents = filteredEvents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleResolve = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "Resolved", outcome: "Allowed" } : e))
    );
    toast.success("Audit event marked as Resolved");
    if (inspectingEvent?.id === id) {
      setInspectingEvent((prev) => prev ? { ...prev, status: "Resolved", outcome: "Allowed" } : null);
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Code", "Title", "Status", "Category", "Actor", "Role", "Resource", "Timestamp", "IP"];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.code,
      `"${e.title.replace(/"/g, '""')}"`,
      e.status,
      e.category,
      `"${e.actor.name}"`,
      `"${e.actor.role}"`,
      e.resource.target,
      e.timestamp,
      e.ip,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-log-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported audit log entries to CSV");
  };

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/panel/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>&gt;</span>
        <Link href="/panel/users" className="hover:text-foreground transition-colors">
          Users
        </Link>
        <span>&gt;</span>
        <span className="text-foreground font-medium">Audit Log</span>
      </nav>

      {/* ── Header Section ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Audit Log
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/30">
              {flaggedCount} flagged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            About {events.length * 15} events today across 6 categories
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter audit events by category"
            className="h-9 rounded-xl border border-border/70 bg-card/80 px-3 text-xs font-medium text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="All Categories">All Categories</option>
            <option value="API Keys">API Keys</option>
            <option value="Data Export">Data Export</option>
            <option value="Billing">Billing</option>
            <option value="User Management">User Management</option>
            <option value="Security Policy">Security Policy</option>
            <option value="Access Control">Access Control</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3 text-xs gap-1.5"
            title="Refresh logs"
          >
            <IconRefresh className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 px-3 text-xs gap-1.5"
          >
            <IconDownload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ── 4 KPI Metric Summary Cards with Progress Bars ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Card 1: Flagged */}
        <Card className="border bg-card/75 shadow-xs overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <IconAlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Flagged</div>
                  <div className="text-[10px] text-muted-foreground">Open events</div>
                </div>
              </div>
              <IconInfoCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
              {flaggedCount}
            </div>

            {/* Progress bar (75%) */}
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-[75%]" />
              </div>
              <div className="text-[10px] text-right font-mono text-muted-foreground">75%</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Actors */}
        <Card className="border bg-card/75 shadow-xs overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <IconUserCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Actors</div>
                  <div className="text-[10px] text-muted-foreground">Involved</div>
                </div>
              </div>
              <IconInfoCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
              {actorsCount}
            </div>

            {/* Progress bar (75%) */}
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[75%]" />
              </div>
              <div className="text-[10px] text-right font-mono text-muted-foreground">75%</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Throttled */}
        <Card className="border bg-card/75 shadow-xs overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <IconGauge className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Throttled</div>
                  <div className="text-[10px] text-muted-foreground">Rate limited</div>
                </div>
              </div>
              <IconInfoCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
              {throttledCount || 3}
            </div>

            {/* Progress bar (38%) */}
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[38%]" />
              </div>
              <div className="text-[10px] text-right font-mono text-muted-foreground">38%</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Resolved */}
        <Card className="border bg-card/75 shadow-xs overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <IconCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Resolved</div>
                  <div className="text-[10px] text-muted-foreground">Closed out</div>
                </div>
              </div>
              <IconInfoCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
              {resolvedCount}
            </div>

            {/* Progress bar (13%) */}
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[13%]" />
              </div>
              <div className="text-[10px] text-right font-mono text-muted-foreground">13%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border bg-card/70 backdrop-blur-md shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter audit events by status"
            className="h-8.5 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Flagged">Flagged</option>
            <option value="Escalated">Escalated</option>
            <option value="Throttled">Throttled</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Outcomes Dropdown */}
          <select
            value={selectedOutcome}
            onChange={(e) => {
              setSelectedOutcome(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter audit events by outcome"
            className="h-8.5 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
          >
            <option value="All Outcomes">All Outcomes</option>
            <option value="Blocked">Blocked</option>
            <option value="Allowed">Allowed</option>
            <option value="Flagged">Flagged</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events, actors, codes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8.5 w-full rounded-xl border border-border/70 bg-card pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory("All Categories");
              setSelectedStatus("All Statuses");
              setSelectedOutcome("All Outcomes");
              setSearchQuery("");
            }}
            className="h-8.5 px-3 text-xs gap-1.5"
          >
            <IconAdjustmentsHorizontal className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* ── Audit Event Data Table ── */}
      <Card className="border bg-card/85 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {displayedEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <IconShield className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="font-semibold text-foreground text-sm">No audit events found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Try clearing filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                displayedEvents.map((evt) => {
                  const scopePct = Math.round((evt.resource.scopeUsed / evt.resource.scopeTotal) * 100);

                  return (
                    <tr
                      key={evt.id}
                      onClick={() => setInspectingEvent(evt)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      {/* Event Title + Code */}
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {evt.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground mt-0.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              evt.status === "Flagged"
                                ? "bg-rose-500"
                                : evt.status === "Escalated"
                                ? "bg-amber-500"
                                : evt.status === "Throttled"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span>{evt.code}</span>
                          {evt.status === "Escalated" && (
                            <span className="text-amber-500 font-sans text-[10px]">· Escalated</span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            evt.status === "Flagged"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              : evt.status === "Escalated"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : evt.status === "Throttled"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              evt.status === "Flagged"
                                ? "bg-rose-500"
                                : evt.status === "Escalated"
                                ? "bg-amber-500"
                                : evt.status === "Throttled"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          {evt.status}
                        </span>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/60">
                          {evt.category}
                        </span>
                      </td>

                      {/* Actor Avatar + Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-border/80">
                            {evt.actor.avatar && <AvatarImage src={evt.actor.avatar} alt={evt.actor.name} />}
                            <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                              {evt.actor.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground leading-tight truncate">
                              {evt.actor.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground leading-tight truncate">
                              {evt.actor.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Resource Scope with Circular Ring */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-4 shrink-0">
                            <svg className="h-4 w-4 -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-muted/40"
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-amber-500"
                                strokeDasharray={`${scopePct}, 100`}
                                strokeWidth="4"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-mono text-[11px] text-foreground truncate max-w-[140px]">
                              {evt.resource.target}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              scope {evt.resource.scopeUsed} of {evt.resource.scopeTotal}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Timestamp with calendar icon */}
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <IconCalendar className="h-3.5 w-3.5 opacity-60" />
                          <span>{evt.timestamp}</span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectingEvent(evt);
                          }}
                          className="h-7 text-xs px-2"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Pagination Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 px-4 border-t bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Rows per page selector"
              className="h-7 rounded-lg border border-border/70 bg-card px-2 text-xs font-mono text-foreground"
            >
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>
              Showing {Math.min(filteredEvents.length, (currentPage - 1) * rowsPerPage + 1)} -{" "}
              {Math.min(filteredEvents.length, currentPage * rowsPerPage)} of {filteredEvents.length} events
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2.5 text-xs"
            >
              Previous
            </Button>
            <span className="px-2 font-mono text-xs text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 px-2.5 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Slide-Over Event Detail Modal ── */}
      {inspectingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{inspectingEvent.code}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold ${
                      inspectingEvent.status === "Flagged"
                        ? "bg-rose-500/15 text-rose-500"
                        : inspectingEvent.status === "Resolved"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-amber-500/15 text-amber-500"
                    }`}
                  >
                    {inspectingEvent.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mt-1">{inspectingEvent.title}</h3>
              </div>
              <button
                onClick={() => setInspectingEvent(null)}
                aria-label="Close event details modal"
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border space-y-1">
                <div className="font-semibold text-foreground">Audit Explanation & Telemetry</div>
                <p className="text-muted-foreground leading-relaxed">{inspectingEvent.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border bg-card/60 space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Initiating Actor</div>
                  <div className="font-semibold text-foreground">{inspectingEvent.actor.name}</div>
                  <div className="text-[11px] text-muted-foreground">{inspectingEvent.actor.role}</div>
                </div>

                <div className="p-3 rounded-xl border bg-card/60 space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Origin IP Address</div>
                  <div className="font-mono text-foreground font-semibold">{inspectingEvent.ip}</div>
                  <div className="text-[10px] text-muted-foreground">Internal Newsroom Subnet</div>
                </div>

                <div className="p-3 rounded-xl border bg-card/60 space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Target Resource & Scope</div>
                  <div className="font-mono text-primary font-semibold">{inspectingEvent.resource.target}</div>
                  <div className="text-[10px] text-muted-foreground">
                    Scope Tier {inspectingEvent.resource.scopeUsed} / {inspectingEvent.resource.scopeTotal}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-card/60 space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Policy Decision</div>
                  <div className="font-semibold text-rose-500">{inspectingEvent.outcome}</div>
                  <div className="text-[10px] text-muted-foreground">{inspectingEvent.timestamp}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border bg-card/60 space-y-1 font-mono text-[11px] text-muted-foreground truncate">
                <span className="text-foreground font-semibold">User Agent:</span> {inspectingEvent.userAgent}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => setInspectingEvent(null)}>
                Close
              </Button>
              {inspectingEvent.status !== "Resolved" && (
                <Button
                  size="sm"
                  onClick={() => handleResolve(inspectingEvent.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  <IconCheck className="h-3.5 w-3.5 mr-1" />
                  Mark as Resolved
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
