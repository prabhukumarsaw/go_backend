"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconShield,
  IconLock,
  IconCheck,
  IconPlus,
  IconRefresh,
  IconMapPin,
  IconLoader2,
  IconDeviceFloppy,
  IconInfoCircle,
  IconSearch,
  IconCopy,
  IconRotate2,
  IconSparkles,
  IconTrash,
  IconEdit,
  IconLayersLinked,
  IconUsers,
  IconHistory,
  IconShieldCheck,
  IconChecklist,
  IconArrowRight,
  IconFilter,
  IconFolder,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  cloneRole,
  applyRoleTemplate,
  getRolePermissionMatrix,
  assignRolePermissions,
  listStaffWithRoles,
  assignUserRole,
  getUserCategoryScopes,
  assignUserCategoryScopes,
  listAuditLogs,
  type Role,
  type MenuMatrixItem,
  type StaffUserRoleSummary,
  type AuditLogEntry,
  type CategoryScope,
} from "@/lib/api/iam";
import { listCategories } from "@/lib/api/articles";
import type { Category } from "@/types/content";
import { toast } from "sonner";

export default function RolesAndIAMPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("matrix");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffSearchQuery, setStaffSearchQuery] = useState("");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [roleFormName, setRoleFormName] = useState("");
  const [roleFormDesc, setRoleFormDesc] = useState("");

  // Scoping tab user selection
  const [scopingUserId, setScopingUserId] = useState<number | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());

  // Local state for selected action IDs in matrix editor
  const [selectedActionIds, setSelectedActionIds] = useState<Set<number>>(new Set());
  const [initialActionIds, setInitialActionIds] = useState<Set<number>>(new Set());

  // 1. Fetch all roles
  const {
    data: rolesData,
    isLoading: isRolesLoading,
    isError: isRolesError,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ["iam-roles"],
    queryFn: () => listRoles(),
  });

  const roles: Role[] = rolesData?.data || [];
  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0] || null;
  const activeRoleId = activeRole ? activeRole.id : null;

  // 2. Fetch permission matrix for the active role
  const {
    data: matrixData,
    isLoading: isMatrixLoading,
    refetch: refetchMatrix,
  } = useQuery({
    queryKey: ["iam-role-matrix", activeRoleId],
    queryFn: () => getRolePermissionMatrix(activeRoleId!),
    enabled: !!activeRoleId,
  });

  const matrix: MenuMatrixItem[] = matrixData?.data || [];

  // 3. Fetch Staff with Roles
  const {
    data: staffData,
    isLoading: isStaffLoading,
    refetch: refetchStaff,
  } = useQuery({
    queryKey: ["iam-staff", staffSearchQuery],
    queryFn: () => listStaffWithRoles(staffSearchQuery),
  });
  const staffList: StaffUserRoleSummary[] = staffData?.data || [];

  // 4. Fetch Categories for Scoping
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => listCategories(),
  });
  const allCategories: Category[] = categoriesData?.data || [];

  // 5. Fetch Scopes for selected user in Scoping Tab
  const { data: userScopesData, refetch: refetchUserScopes } = useQuery({
    queryKey: ["user-scopes", scopingUserId],
    queryFn: () => getUserCategoryScopes(scopingUserId!),
    enabled: !!scopingUserId,
  });

  useEffect(() => {
    if (userScopesData?.data) {
      const ids = new Set<number>(userScopesData.data.map((s) => s.category_id));
      setSelectedCategoryIds(ids);
    }
  }, [userScopesData]);

  // If no scoping user selected, pick first staff
  useEffect(() => {
    if (!scopingUserId && staffList.length > 0) {
      setScopingUserId(staffList[0].user_id);
    }
  }, [staffList, scopingUserId]);

  // 6. Fetch Audit Logs
  const {
    data: auditData,
    isLoading: isAuditLoading,
    refetch: refetchAudit,
  } = useQuery({
    queryKey: ["iam-audit-logs"],
    queryFn: () => listAuditLogs(1, 50),
    enabled: activeTab === "audit",
  });
  const auditLogs: AuditLogEntry[] = auditData?.data || [];

  // Total permissions count
  const allActionIdsList = useMemo(() => {
    const list: number[] = [];
    for (const menu of matrix) {
      for (const act of menu.actions) {
        list.push(act.action_id);
      }
    }
    return list;
  }, [matrix]);

  // Synchronize initial state when matrix loads
  useEffect(() => {
    if (matrix.length > 0) {
      const granted = new Set<number>();
      for (const menu of matrix) {
        for (const action of menu.actions) {
          if (action.granted) {
            granted.add(action.action_id);
          }
        }
      }
      setSelectedActionIds(granted);
      setInitialActionIds(granted);
    }
  }, [matrix]);

  // Dirty state checker
  const isDirty = useMemo(() => {
    if (selectedActionIds.size !== initialActionIds.size) return true;
    for (const id of selectedActionIds) {
      if (!initialActionIds.has(id)) return true;
    }
    return false;
  }, [selectedActionIds, initialActionIds]);

  // Mutations
  const saveMatrixMutation = useMutation({
    mutationFn: ({ roleId, actionIds }: { roleId: number; actionIds: number[] }) =>
      assignRolePermissions(roleId, actionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-role-matrix", activeRoleId] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setInitialActionIds(new Set(selectedActionIds));
      toast.success(`Permissions for role "${activeRole?.name}" saved successfully!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update role permissions.");
    },
  });

  const extractErrorMessage = (err: any, fallback: string): string => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      fallback
    );
  };

  const createRoleMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => createRole(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["iam-roles"] });
      setIsCreateOpen(false);
      setRoleFormName("");
      setRoleFormDesc("");
      if (res.data?.id) {
        setSelectedRoleId(res.data.id);
      }
      toast.success(`Role "${res.data.name}" created successfully!`);
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, "Failed to create role."));
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description?: string } }) =>
      updateRole(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["iam-roles"] });
      setIsEditOpen(false);
      toast.success(`Role "${res.data.name}" updated successfully!`);
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, "Failed to update role."));
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-roles"] });
      setSelectedRoleId(roles[0]?.id || null);
      toast.success("Role deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, "Failed to delete role."));
    },
  });

  const cloneRoleMutation = useMutation({
    mutationFn: ({ sourceId, data }: { sourceId: number; data: { name: string; description?: string } }) =>
      cloneRole(sourceId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["iam-roles"] });
      setIsCloneOpen(false);
      setRoleFormName("");
      setRoleFormDesc("");
      if (res.data?.id) {
        setSelectedRoleId(res.data.id);
      }
      toast.success(`Cloned role "${res.data.name}" created with inherited permissions!`);
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, "Failed to clone role."));
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: ({ roleId, template }: { roleId: number; template: string }) =>
      applyRoleTemplate(roleId, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-role-matrix", activeRoleId] });
      refetchMatrix();
      toast.success("Preset template applied successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to apply template.");
    },
  });

  const assignUserRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      assignUserRole(userId, { role_id: roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-staff"] });
      queryClient.invalidateQueries({ queryKey: ["iam-roles"] });
      toast.success("Staff role updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update user role.");
    },
  });

  const saveScopesMutation = useMutation({
    mutationFn: ({ userId, categoryIds }: { userId: number; categoryIds: number[] }) =>
      assignUserCategoryScopes(userId, categoryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-scopes", scopingUserId] });
      queryClient.invalidateQueries({ queryKey: ["iam-staff"] });
      toast.success("Editorial bureau scopes updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update scopes.");
    },
  });

  // Filtered matrix based on search query
  const filteredMatrix = useMemo(() => {
    if (!searchQuery.trim()) return matrix;
    const q = searchQuery.toLowerCase().trim();
    return matrix.filter((m) => {
      const matchMenu = (m.label || "").toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
      const matchAction = m.actions.some((a) => a.action.toLowerCase().includes(q) || (a.label || "").toLowerCase().includes(q));
      return matchMenu || matchAction;
    });
  }, [matrix, searchQuery]);

  const ACTION_COLUMNS = [
    { key: "view", label: "View", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
    { key: "create", label: "Create", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    { key: "edit", label: "Edit", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    { key: "delete", label: "Delete", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
    { key: "publish", label: "Publish", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30" },
    { key: "approve", label: "Approve", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    { key: "export", label: "Export", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  ];

  const getCleanMenuLabel = (name: string, fallbackLabel?: string): string => {
    const map: Record<string, string> = {
      dashboard: "Dashboard",
      articles: "Articles",
      categories: "Categories & Desks",
      tags: "Tags & Topics",
      media_library: "Media Library",
      live_blogs: "Live Blogs",
      web_stories: "Web Stories",
      epaper: "E-Paper",
      comments: "Comments & Community",
      roles: "Roles & Permissions",
      users: "Staff & Users",
      analytics: "Analytics",
      settings: "Settings",
    };
    return map[name.toLowerCase()] || fallbackLabel || name;
  };

  const formatRoleDisplayName = (name: string): string => {
    const map: Record<string, string> = {
      super_admin: "Super Administrator",
      "super administrator": "Super Administrator",
      editor: "Editor",
      sub_editor: "Sub-Editor",
      "sub editor": "Sub-Editor",
      "sub-editor": "Sub-Editor",
      reporter: "Reporter",
      moderator: "Community Moderator",
      "community moderator": "Community Moderator",
      fact_checker: "Fact Checker",
      "fact checker": "Fact Checker",
      multimedia_producer: "Multimedia Producer",
      "multimedia producer": "Multimedia Producer",
    };
    const lower = (name || "").toLowerCase().trim();
    if (map[lower]) return map[lower];
    return name
      .replace(/_/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Toggle entire column across all loaded menus
  const handleToggleColumn = (actionVerb: string) => {
    const next = new Set(selectedActionIds);
    const matchingActionIds: number[] = [];
    for (const menu of matrix) {
      for (const act of menu.actions) {
        if (act.action.toLowerCase() === actionVerb.toLowerCase()) {
          matchingActionIds.push(act.action_id);
        }
      }
    }
    const allChecked = matchingActionIds.length > 0 && matchingActionIds.every((id) => next.has(id));
    if (allChecked) {
      matchingActionIds.forEach((id) => next.delete(id));
      toast.info(`Revoked all ${actionVerb.toUpperCase()} permissions.`);
    } else {
      matchingActionIds.forEach((id) => next.add(id));
      toast.success(`Granted all ${actionVerb.toUpperCase()} permissions.`);
    }
    setSelectedActionIds(next);
  };

  // Checkbox handlers
  const handleToggleAction = (actionId: number) => {
    const next = new Set(selectedActionIds);
    if (next.has(actionId)) {
      next.delete(actionId);
    } else {
      next.add(actionId);
    }
    setSelectedActionIds(next);
  };

  const handleToggleMenuAll = (menu: MenuMatrixItem) => {
    const next = new Set(selectedActionIds);
    const allMenuActionIds = menu.actions.map((a) => a.action_id);
    const allChecked = allMenuActionIds.every((id) => next.has(id));

    if (allChecked) {
      allMenuActionIds.forEach((id) => next.delete(id));
    } else {
      allMenuActionIds.forEach((id) => next.add(id));
    }
    setSelectedActionIds(next);
  };

  // Bulk column grants across all menus
  const handleBulkGrantByActionType = (actionVerb: string) => {
    handleToggleColumn(actionVerb);
  };

  const handleGrantAll = () => {
    setSelectedActionIds(new Set(allActionIdsList));
  };

  const handleRevokeAll = () => {
    setSelectedActionIds(new Set());
  };

  const handleResetToInitial = () => {
    setSelectedActionIds(new Set(initialActionIds));
  };

  const handleSaveMatrix = () => {
    if (!activeRoleId) return;
    saveMatrixMutation.mutate({
      roleId: activeRoleId,
      actionIds: Array.from(selectedActionIds),
    });
  };

  // Scoping Checkbox toggle
  const handleToggleCategoryScope = (categoryId: number) => {
    const next = new Set(selectedCategoryIds);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    setSelectedCategoryIds(next);
  };

  const coveragePercent = allActionIdsList.length > 0
    ? Math.round((selectedActionIds.size / allActionIdsList.length) * 100)
    : 0;

  const totalStaffCount = staffList.length;
  const systemRolesCount = roles.filter((r) => r.is_system).length;
  const customRolesCount = roles.length - systemRolesCount;

  // Visual helper for badge styling by action type
  const getActionBadgeClass = (action: string, isChecked: boolean) => {
    const verb = action.toLowerCase();
    if (!isChecked) {
      return "bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted/60";
    }
    if (verb.includes("view")) {
      return "bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-400 font-semibold shadow-2xs";
    }
    if (verb.includes("add") || verb.includes("create")) {
      return "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs";
    }
    if (verb.includes("edit")) {
      return "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs";
    }
    if (verb.includes("delete")) {
      return "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-semibold shadow-2xs";
    }
    if (verb.includes("publish") || verb.includes("approve")) {
      return "bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs";
    }
    return "bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400 font-semibold shadow-2xs";
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        title="Roles & Permissions"
        description="Manage user roles, menu access, and editorial permissions."
      >
        <div className="flex items-center gap-2">
          {/* Create Role Modal */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="h-8 shadow-xs font-medium">
                  <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                  New Role
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  Create New Role
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!roleFormName.trim()) return;
                  createRoleMutation.mutate({
                    name: roleFormName.trim(),
                    description: roleFormDesc.trim() || undefined,
                  });
                }}
                className="space-y-4 pt-2"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="role_name" className="text-xs font-semibold">
                    Role Name *
                  </Label>
                  <Input
                    id="role_name"
                    required
                    placeholder="e.g. Senior Reporter, Bureau Editor"
                    value={roleFormName}
                    onChange={(e) => setRoleFormName(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role_desc" className="text-xs font-semibold">
                    Description
                  </Label>
                  <Input
                    id="role_desc"
                    placeholder="e.g. Edits and approves articles for publication"
                    value={roleFormDesc}
                    onChange={(e) => setRoleFormDesc(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createRoleMutation.isPending || !roleFormName.trim()}
                  >
                    {createRoleMutation.isPending ? (
                      <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <IconCheck className="mr-1.5 h-4 w-4" />
                    )}
                    Save Role
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchRoles();
              refetchMatrix();
              refetchStaff();
              refetchAudit();
            }}
            className="h-8"
          >
            <IconRefresh className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </PageHeader>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full min-w-0">
        <Card className="shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Total Roles
              </div>
              <div className="text-xl font-bold text-foreground mt-0.5">
                {roles.length}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {systemRolesCount} Core • {customRolesCount} Custom
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <IconShield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Permission Atoms
              </div>
              <div className="text-xl font-bold text-foreground mt-0.5 font-mono">
                {allActionIdsList.length}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Across {matrix.length} Feature Modules
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <IconChecklist className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Staff Governed
              </div>
              <div className="text-xl font-bold text-foreground mt-0.5 font-mono">
                {totalStaffCount}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Journalists & Editors
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <IconUsers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Security Policy
              </div>
              <div className="text-xl font-bold text-emerald-500 mt-0.5 flex items-center gap-1.5">
                <IconShieldCheck className="h-5 w-5" />
                Active
              </div>
              <div className="text-[10px] text-muted-foreground">
                Zero-Trust ABAC Active
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <IconLock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Studio Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:max-w-xl h-auto p-1 gap-1">
          <TabsTrigger value="matrix" className="text-xs py-1.5 flex items-center gap-1.5">
            <IconShield className="h-3.5 w-3.5" />
            <span>Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="text-xs py-1.5 flex items-center gap-1.5">
            <IconUsers className="h-3.5 w-3.5" />
            <span>Staff ({staffList.length})</span>
          </TabsTrigger>
          <TabsTrigger value="scopes" className="text-xs py-1.5 flex items-center gap-1.5">
            <IconMapPin className="h-3.5 w-3.5" />
            <span>Scopes</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs py-1.5 flex items-center gap-1.5">
            <IconHistory className="h-3.5 w-3.5" />
            <span>Audit Log</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: Granular RBAC Permission Matrix ─── */}
        <TabsContent value="matrix" className="space-y-6 pt-4 w-full min-w-0">
          {isRolesLoading ? (
            <LoadingState message="Loading newsroom roles from database…" />
          ) : isRolesError ? (
            <ErrorState
              title="Failed to load roles"
              message="Could not connect to IAM backend."
              onRetry={() => refetchRoles()}
            />
          ) : (
            <div className="space-y-4 w-full min-w-0">
              {/* Executive Role Switcher Ribbon */}
              <div className="p-3.5 rounded-2xl border bg-card shadow-xs space-y-2.5 w-full min-w-0">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <IconShield className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground tracking-wide">
                      Newsroom Roles ({roles.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary/60" /> {systemRolesCount} System
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500/60" /> {customRolesCount} Custom
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin w-full min-w-0">
                  {roles.map((r) => {
                    const isSelected = activeRoleId === r.id;
                    const displayTitle = formatRoleDisplayName(r.name);

                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRoleId(r.id)}
                        className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer select-none border ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold border-primary shadow-sm ring-2 ring-primary/20 scale-[1.02]"
                            : "bg-muted/40 hover:bg-muted text-foreground border-border/70 hover:border-border"
                        }`}
                      >
                        <IconShield
                          className={`h-3.5 w-3.5 transition-colors ${
                            isSelected ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                        <span className="font-medium">{displayTitle}</span>

                        {r.is_system ? (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wider font-semibold ${
                              isSelected
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground border border-border/50"
                            }`}
                          >
                            System
                          </span>
                        ) : (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wider font-semibold ${
                              isSelected
                                ? "bg-emerald-400/30 text-primary-foreground"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            Custom
                          </span>
                        )}

                        {typeof r.user_count === "number" && r.user_count > 0 && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                              isSelected
                                ? "bg-primary-foreground/25 text-primary-foreground"
                                : "bg-primary/10 text-primary"
                            }`}
                            title={`${r.user_count} staff member(s) assigned`}
                          >
                            {r.user_count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Role Meta Card & Presets Toolbar */}
              {activeRole && (
                <div className="p-4 rounded-2xl border bg-gradient-to-br from-card via-card to-muted/20 shadow-xs space-y-4 w-full min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-lg text-foreground capitalize">
                          {formatRoleDisplayName(activeRole.name)}
                        </h3>
                        {activeRole.is_system ? (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            Core System Role
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="font-mono text-[10px] text-emerald-500 border-emerald-500/30">
                            Custom Role
                          </Badge>
                        )}
                        <Badge variant="outline" className="font-mono text-[10px] text-primary">
                          {coveragePercent}% Access ({selectedActionIds.size} / {allActionIdsList.length} permissions)
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activeRole.description || "Enterprise newsroom role."}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Apply Fast Template Preset */}
                      <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/40">
                        <span className="text-[10px] font-mono text-muted-foreground px-1.5">
                          Template:
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] px-2"
                          onClick={() => applyTemplateMutation.mutate({ roleId: activeRole.id, template: "editor" })}
                        >
                          Editor
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] px-2"
                          onClick={() => applyTemplateMutation.mutate({ roleId: activeRole.id, template: "reporter" })}
                        >
                          Reporter
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] px-2"
                          onClick={() => applyTemplateMutation.mutate({ roleId: activeRole.id, template: "fact_checker" })}
                        >
                          Fact Check
                        </Button>
                      </div>

                      {/* Clone Role Button */}
                      <Dialog open={isCloneOpen} onOpenChange={setIsCloneOpen}>
                        <DialogTrigger
                          render={
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                setRoleFormName(`${activeRole.name} Copy`);
                                setRoleFormDesc(`Cloned from ${activeRole.name}`);
                              }}
                            >
                              <IconCopy className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                              Clone
                            </Button>
                          }
                        />
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-base font-semibold">
                              Clone Role & Inherit Permissions
                            </DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!roleFormName.trim() || !activeRoleId) return;
                              cloneRoleMutation.mutate({
                                sourceId: activeRoleId,
                                data: {
                                  name: roleFormName.trim(),
                                  description: roleFormDesc.trim() || undefined,
                                },
                              });
                            }}
                            className="space-y-4 pt-2"
                          >
                            <p className="text-xs text-muted-foreground">
                              Creating a clone of <strong className="text-foreground">{activeRole.name}</strong> will duplicate all {selectedActionIds.size} granted permission atoms into a new role.
                            </p>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">New Role Name *</Label>
                              <Input
                                required
                                value={roleFormName}
                                onChange={(e) => setRoleFormName(e.target.value)}
                                className="text-xs"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Description</Label>
                              <Input
                                value={roleFormDesc}
                                onChange={(e) => setRoleFormDesc(e.target.value)}
                                className="text-xs"
                              />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCloneOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" size="sm" disabled={cloneRoleMutation.isPending}>
                                {cloneRoleMutation.isPending && (
                                  <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                )}
                                Confirm Clone
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

                      {/* Edit Role Details (Custom roles only) */}
                      {!activeRole.is_system && (
                        <>
                          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                            <DialogTrigger
                              render={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => {
                                    setRoleFormName(activeRole.name);
                                    setRoleFormDesc(activeRole.description || "");
                                  }}
                                >
                                  <IconEdit className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                  Edit
                                </Button>
                              }
                            />
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-base font-semibold">
                                  Edit Role Details
                                </DialogTitle>
                              </DialogHeader>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!roleFormName.trim() || !activeRoleId) return;
                                  updateRoleMutation.mutate({
                                    id: activeRoleId,
                                    data: {
                                      name: roleFormName.trim(),
                                      description: roleFormDesc.trim() || undefined,
                                    },
                                  });
                                }}
                                className="space-y-4 pt-2"
                              >
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold">Role Name *</Label>
                                  <Input
                                    required
                                    value={roleFormName}
                                    onChange={(e) => setRoleFormName(e.target.value)}
                                    className="text-xs"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold">Description</Label>
                                  <Input
                                    value={roleFormDesc}
                                    onChange={(e) => setRoleFormDesc(e.target.value)}
                                    className="text-xs"
                                  />
                                </div>
                                <div className="pt-2 flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit" size="sm" disabled={updateRoleMutation.isPending}>
                                    {updateRoleMutation.isPending && (
                                      <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                    )}
                                    Save Changes
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete custom role "${activeRole.name}"?`)) {
                                deleteRoleMutation.mutate(activeRole.id);
                              }
                            }}
                          >
                            <IconTrash className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </>
                      )}

                      {isDirty && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResetToInitial}
                          className="h-8 text-xs text-muted-foreground"
                        >
                          <IconRotate2 className="mr-1 h-3.5 w-3.5" />
                          Discard
                        </Button>
                      )}

                      <Button
                        size="sm"
                        className={`h-8 px-4 font-semibold text-xs shadow-xs ${
                          isDirty ? "animate-pulse" : ""
                        }`}
                        disabled={saveMatrixMutation.isPending || !isDirty}
                        onClick={handleSaveMatrix}
                      >
                        {saveMatrixMutation.isPending ? (
                          <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <IconDeviceFloppy className="mr-1.5 h-4 w-4" />
                        )}
                        Save Permissions
                      </Button>
                    </div>
                  </div>

                  {/* Filter and Presets Toolbar */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t w-full min-w-0">
                    <div className="relative w-full sm:w-72 shrink-0">
                      <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Filter module or action…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 text-xs"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-mono text-muted-foreground mr-1">
                        Column Actions:
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-mono px-2"
                        onClick={() => handleBulkGrantByActionType("view")}
                      >
                        + VIEW
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-mono px-2"
                        onClick={() => handleBulkGrantByActionType("edit")}
                      >
                        + EDIT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-mono px-2"
                        onClick={() => handleBulkGrantByActionType("publish")}
                      >
                        + PUBLISH
                      </Button>
                      <div className="h-4 w-[1px] bg-border mx-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-mono px-2"
                        onClick={handleGrantAll}
                      >
                        <IconSparkles className="mr-1 h-3 w-3 text-emerald-500" />
                        Grant All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-mono px-2"
                        onClick={handleRevokeAll}
                      >
                        Revoke All
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Permission Matrix Table */}
              {isMatrixLoading ? (
                <LoadingState message="Loading granular permission matrix…" />
              ) : filteredMatrix.length === 0 ? (
                <div className="p-8 text-center border rounded-xl bg-card/40 space-y-2">
                  <p className="text-xs text-muted-foreground font-mono">
                    No menu actions matched your search &quot;{searchQuery}&quot;.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                    Clear Filter
                  </Button>
                </div>
              ) : (
                <div className="border rounded-2xl overflow-hidden bg-card shadow-xs w-full min-w-0">
                  <div className="overflow-x-auto scrollbar-thin w-full">
                    <Table className="min-w-[760px] w-full">
                      <TableHeader className="bg-muted/50 border-b">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="sticky left-0 z-20 bg-muted/95 backdrop-blur-xs w-[190px] min-w-[170px] font-bold text-xs text-foreground pl-3.5 py-2.5 border-r border-border/40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                            Menu Module
                          </TableHead>
                          <TableHead className="w-[85px] min-w-[80px] text-center font-bold text-xs text-foreground py-2.5">
                            Row Quick
                          </TableHead>
                        {ACTION_COLUMNS.map((col) => {
                          const actionIdsOfVerb: number[] = [];
                          for (const m of filteredMatrix) {
                            for (const a of m.actions) {
                              if (a.action.toLowerCase() === col.key) {
                                actionIdsOfVerb.push(a.action_id);
                              }
                            }
                          }
                          const isAllChecked =
                            actionIdsOfVerb.length > 0 &&
                            actionIdsOfVerb.every((id) => selectedActionIds.has(id));
                          const grantedInCol = actionIdsOfVerb.filter((id) =>
                            selectedActionIds.has(id)
                          ).length;

                          return (
                            <TableHead
                              key={col.key}
                              className="text-center py-2 px-1 border-l border-border/40 w-[78px] min-w-[72px]"
                            >
                              <div className="flex flex-col items-center justify-center gap-0.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-foreground">
                                  {col.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleColumn(col.key)}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all cursor-pointer whitespace-nowrap ${
                                    isAllChecked
                                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                                      : "bg-muted/60 text-muted-foreground border-border/80 hover:text-foreground"
                                  }`}
                                  title={`Toggle all ${col.label} permissions`}
                                >
                                  {isAllChecked ? "All" : `${grantedInCol}/${actionIdsOfVerb.length}`}
                                </button>
                              </div>
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMatrix.map((menu) => {
                        const allMenuActionIds = menu.actions.map((a) => a.action_id);
                        const allChecked =
                          allMenuActionIds.length > 0 &&
                          allMenuActionIds.every((id) => selectedActionIds.has(id));
                        const isAllSelected = allChecked && menu.actions.length > 0;
                        const grantedCount = menu.actions.filter((a) =>
                          selectedActionIds.has(a.action_id)
                        ).length;
                        const cleanTitle = getCleanMenuLabel(menu.name, menu.label);

                        return (
                          <TableRow
                            key={menu.menu_id}
                            className="hover:bg-muted/20 border-b transition-colors"
                          >
                            <TableCell className="sticky left-0 z-10 bg-card/95 backdrop-blur-xs w-[190px] min-w-[170px] font-semibold text-xs pl-3.5 py-2.5 border-r border-border/40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                              <div className="flex items-center gap-2">
                                <span className="p-1 rounded-lg bg-muted/60 text-muted-foreground shrink-0">
                                  <IconLayersLinked className="h-3.5 w-3.5" />
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-foreground text-xs truncate">
                                    {cleanTitle}
                                  </div>
                                  <div className="font-mono text-[10px] text-muted-foreground truncate">
                                    <span
                                      className={
                                        grantedCount > 0
                                          ? "text-primary font-semibold"
                                          : ""
                                      }
                                    >
                                      {grantedCount}/{menu.actions.length} granted
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-center py-2.5 w-[85px] min-w-[80px]">
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-6 px-2 text-[10px] font-mono transition-colors ${
                                  isAllSelected
                                    ? "border-emerald-500/40 text-emerald-500 font-semibold bg-emerald-500/5"
                                    : ""
                                }`}
                                onClick={() => handleToggleMenuAll(menu)}
                              >
                                {isAllSelected ? "Deselect" : "Grant All"}
                              </Button>
                            </TableCell>

                            {ACTION_COLUMNS.map((col) => {
                              const act = menu.actions.find(
                                (a) => a.action.toLowerCase() === col.key
                              );

                              if (!act) {
                                return (
                                  <TableCell
                                    key={col.key}
                                    className="text-center text-muted-foreground/30 font-mono text-xs select-none border-l border-border/40 w-[78px] min-w-[72px]"
                                  >
                                    —
                                  </TableCell>
                                );
                              }

                              const isChecked = selectedActionIds.has(act.action_id);

                              return (
                                <TableCell
                                  key={col.key}
                                  className="text-center py-2 px-1 border-l border-border/40 hover:bg-primary/5 transition-colors w-[78px] min-w-[72px]"
                                >
                                  <div className="flex items-center justify-center">
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() =>
                                        handleToggleAction(act.action_id)
                                      }
                                      className="h-4 w-4 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer transition-transform hover:scale-110"
                                      aria-label={`${cleanTitle} ${col.label}`}
                                    />
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 2: Staff Roster & Role Assignments ─── */}
        <TabsContent value="staff" className="space-y-4 pt-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <IconUsers className="h-4 w-4 text-primary" />
                  Staff Members & Role Governance
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Directly reassign staff journalists, editors, and fact-checkers to platform roles.
                </CardDescription>
              </div>
              <div className="w-64">
                <Input
                  placeholder="Search staff name or email…"
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isStaffLoading ? (
                <div className="p-6">
                  <LoadingState message="Loading newsroom staff directory…" />
                </div>
              ) : staffList.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No staff members found.
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <Table className="min-w-[720px]">
                    <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Status & Privileges</TableHead>
                      <TableHead>Assigned IAM Role</TableHead>
                      <TableHead>Bureau Scopes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((st) => (
                      <TableRow key={st.user_id}>
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">
                            {st.display_name}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground">
                            {st.email}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {st.is_super_admin ? (
                              <Badge variant="default" className="text-[10px] font-mono bg-purple-600">
                                SuperAdmin Bypass
                              </Badge>
                            ) : st.is_active ? (
                              <Badge variant="secondary" className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10">
                                Active Staff
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {st.is_super_admin ? (
                            <span className="text-xs font-semibold text-purple-600">
                              Root Authority
                            </span>
                          ) : (
                            <select
                              value={st.role_id || ""}
                              onChange={(e) => {
                                const newRoleId = parseInt(e.target.value, 10);
                                if (!isNaN(newRoleId)) {
                                  assignUserRoleMutation.mutate({
                                    userId: st.user_id,
                                    roleId: newRoleId,
                                  });
                                }
                              }}
                              className="text-xs h-8 px-2 rounded-md border border-input bg-background font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="" disabled>Select Role…</option>
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} {r.is_system ? "(System)" : ""}
                                </option>
                              ))}
                            </select>
                          )}
                        </TableCell>

                        <TableCell>
                          {st.category_scopes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {st.category_scopes.slice(0, 3).map((cs) => (
                                <Badge key={cs.category_id} variant="outline" className="text-[10px]">
                                  {cs.name}
                                </Badge>
                              ))}
                              {st.category_scopes.length > 3 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  +{st.category_scopes.length - 3} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono text-muted-foreground">
                              National Platform (Unrestricted)
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setScopingUserId(st.user_id);
                              setActiveTab("scopes");
                            }}
                          >
                            <IconMapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                            Configure Scopes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 3: Bureau & Category Scopes ─── */}
        <TabsContent value="scopes" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: User Selector */}
            <Card className="shadow-xs md:col-span-1">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                  Select Staff Journalist
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {staffList.map((st) => {
                  const isSelected = scopingUserId === st.user_id;
                  return (
                    <button
                      key={st.user_id}
                      onClick={() => setScopingUserId(st.user_id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30 font-bold text-primary"
                          : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{st.display_name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {st.role_name || "No Role"} • {st.category_scopes.length} Scopes
                        </div>
                      </div>
                      {isSelected && <IconArrowRight className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Right: Category Jurisdiction Selector */}
            <Card className="shadow-xs md:col-span-2">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <IconMapPin className="h-4 w-4 text-primary" />
                    Editorial Jurisdiction & Beat Scopes
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Restrict editorial publishing rights to specific hierarchical categories.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  disabled={saveScopesMutation.isPending || !scopingUserId}
                  onClick={() => {
                    if (scopingUserId) {
                      saveScopesMutation.mutate({
                        userId: scopingUserId,
                        categoryIds: Array.from(selectedCategoryIds),
                      });
                    }
                  }}
                  className="h-8 text-xs font-semibold"
                >
                  {saveScopesMutation.isPending ? (
                    <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save Scopes ({selectedCategoryIds.size})
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="p-3 rounded-xl border bg-muted/20 text-xs text-muted-foreground leading-relaxed flex items-center justify-between">
                  <span>
                    When no categories are selected, the staff member has <strong>national platform-wide access</strong>. Selecting one or more categories restricts their editorial jurisdiction strictly to those topics/desks.
                  </span>
                  {selectedCategoryIds.size > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs ml-3"
                      onClick={() => setSelectedCategoryIds(new Set())}
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
                  {allCategories.map((cat) => {
                    const isChecked = selectedCategoryIds.has(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-primary/10 border-primary/40 font-semibold text-foreground shadow-2xs"
                            : "bg-card border-border/80 text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleCategoryScope(cat.id)}
                          className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div className="flex-1 truncate">
                          <div className="truncate font-medium">{cat.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground truncate">
                            /{cat.slug} {cat.path ? `• ${cat.path}` : ""}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── TAB 4: Security & Permission Audit Trail ─── */}
        <TabsContent value="audit" className="space-y-4 pt-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <IconHistory className="h-4 w-4 text-primary" />
                  Real-Time Permission Audit Trail
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Immutable audit records captured during 5-step ABAC authorization evaluations.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => refetchAudit()}
              >
                <IconRefresh className="h-3.5 w-3.5 mr-1" />
                Refresh Log
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isAuditLoading ? (
                <div className="p-6">
                  <LoadingState message="Loading security audit trail…" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground font-mono">
                  No audit log entries recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <Table className="min-w-[760px]">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-[170px]">Timestamp</TableHead>
                        <TableHead>Staff Identity</TableHead>
                        <TableHead>Action Evaluated</TableHead>
                        <TableHead>Decision</TableHead>
                        <TableHead>Reason / Trace</TableHead>
                        <TableHead className="text-right">Client IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log, idx) => (
                        <TableRow key={log.id || idx}>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : "Just now"}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-xs text-foreground">
                              {log.user_name || `User #${log.user_id}`}
                            </div>
                            {log.user_email && (
                              <div className="text-[10px] font-mono text-muted-foreground">
                                {log.user_email}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold">
                            {log.action_name}
                          </TableCell>
                          <TableCell>
                            {log.decision.includes("GRANT") || log.decision.includes("ALLOW") ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                                GRANTED
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px] font-mono">
                                DENIED
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                            {log.reason}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-right text-muted-foreground">
                            {log.ip_address || "internal"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
