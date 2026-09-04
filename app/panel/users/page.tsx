"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconUsers,
  IconUserPlus,
  IconSearch,
  IconCheck,
  IconPhone,
  IconId,
  IconArticle,
  IconKey,
  IconBrandX,
  IconCertificate,
  IconTrash,
  IconLoader2,
  IconRefresh,
  IconUpload,
  IconArrowRight,
  IconArrowLeft,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import {
  listEmployees,
  onboardEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  type Employee,
  type OnboardEmployeePayload,
} from "@/lib/api/employees";
import { uploadMedia } from "@/lib/api/media";
import { listRoles } from "@/lib/api/iam";
import { toast } from "sonner";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [wizardStep, setWizardStep] = useState<"identity" | "editorial" | "address">("identity");

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [profileModalEmp, setProfileModalEmp] = useState<Employee | null>(null);

  // 1. Fetch Real Database Employees
  const {
    data: empData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["employees", selectedDept],
    queryFn: () => listEmployees(undefined, selectedDept),
  });

  const employees = empData?.data || [];

  const { data: roleData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => listRoles(),
  });
  const roles = roleData?.data || [];

  // Form state for Onboarding
  const [formData, setFormData] = useState<OnboardEmployeePayload>({
    display_name: "",
    email: "",
    phone: "",
    password: "",
    avatar_url: "",
    employee_code: `EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    designation: "Special Correspondent",
    department: "Editorial",
    role_id: 2,
    tenant_id: 1,
    address: "",
    pin_code: "",
    bio: "",
    press_card_no: "",
    x_handle: "",
  });

  const handleAvatarSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setAvatarFile(file);

    // Read as permanent Base64 Data URL for uninterrupted client-side preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAvatarPreview(base64);
    };
    reader.readAsDataURL(file);
    toast.success("Photo attached! It will be uploaded on final submission.");
  };

  const handleAvatarRemove = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setFormData((prev) => ({ ...prev, avatar_url: "" }));
  };

  // 3. Database Mutations
  const onboardMutation = useMutation({
    mutationFn: (payload: OnboardEmployeePayload) => onboardEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsOnboardOpen(false);
      setWizardStep("identity");
      setAvatarFile(null);
      setAvatarPreview("");
      toast.success(
        `Journalist ${formData.display_name || "staff"} onboarded and saved to PostgreSQL database!`
      );
      // Reset Form
      setFormData({
        display_name: "",
        email: "",
        phone: "",
        password: "",
        avatar_url: "",
        employee_code: `EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        designation: "Special Correspondent",
        department: "Editorial",
        role_id: 2,
        tenant_id: 1,
        address: "",
        pin_code: "",
        bio: "",
        press_card_no: "",
        x_handle: "",
      });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to onboard employee into database.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      updateEmployeeStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee status synchronized in database.");
    },
    onError: () => {
      toast.error("Failed to update employee status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee removed from newsroom database.");
    },
    onError: () => {
      toast.error("Failed to remove employee.");
    },
  });

  const filteredEmployees = employees.filter((emp) => {
    return (
      (emp.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (emp.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (emp.phone || "").includes(search) ||
      (emp.employee_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (emp.designation || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.display_name?.trim() || !formData.email?.trim()) {
      toast.error("Please enter full legal name and email address.");
      setWizardStep("identity");
      return;
    }

    let finalAvatarUrl = formData.avatar_url || "";

    // Upload image to media service under users folder on final submission
    if (avatarFile) {
      setIsUploadingAvatar(true);
      try {
        const res = await uploadMedia(avatarFile, "news", "users");
        const item = res.data;
        const cleanPath = (item.storage_path || item.filename || "").replace(/\\/g, "/");
        finalAvatarUrl =
          item.url &&
          (item.url.startsWith("http://") ||
            item.url.startsWith("https://") ||
            item.url.startsWith("/uploads/"))
            ? item.url
            : cleanPath.startsWith("/uploads/")
              ? cleanPath
              : `/uploads/${cleanPath}`;
      } catch (err: any) {
        toast.error("Failed to upload avatar photo: " + (err?.message || "Storage error"));
        setIsUploadingAvatar(false);
        return;
      } finally {
        setIsUploadingAvatar(false);
      }
    }

    onboardMutation.mutate({
      ...formData,
      avatar_url: finalAvatarUrl,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Team & Staff"
        description="Manage journalists, editors, press cards, and team accounts."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 text-xs"
          >
            <IconRefresh
              className={`h-3.5 w-3.5 mr-1 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Dialog
            open={isOnboardOpen}
            onOpenChange={(open) => {
              setIsOnboardOpen(open);
              if (!open) {
                setWizardStep("identity");
                setAvatarFile(null);
                setAvatarPreview("");
              }
            }}
          >
            <DialogTrigger
              render={
                <Button size="sm" className="h-8 shadow-xs font-medium">
                  <IconUserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Add Team Member
                </Button>
              }
            />
            <DialogContent className="sm:max-w-3xl p-6">
              <DialogHeader className="pb-2 border-b">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <IconId className="h-5 w-5 text-primary" />
                  Onboard Newsroom Journalist & Editorial Staff
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <Tabs
                  value={wizardStep}
                  onValueChange={(val) => setWizardStep(val as any)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="identity" className="text-xs">
                      1. Identity & Credentials
                    </TabsTrigger>
                    <TabsTrigger value="editorial" className="text-xs">
                      2. Role & State Edition
                    </TabsTrigger>
                    <TabsTrigger value="address" className="text-xs">
                      3. Address, Bio & Press ID
                    </TabsTrigger>
                  </TabsList>

                  {/* ─── Tab 1: Identity & Credentials ─── */}
                  <TabsContent value="identity" className="space-y-4 pt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border bg-muted/20">
                      <div
                        className="relative group h-20 w-20 rounded-full overflow-hidden border-2 border-primary/40 bg-muted flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                        onClick={() => fileInputRef.current?.click()}
                        title="Click to select profile photo"
                      >
                        {avatarPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <IconUsers className="h-10 w-10 text-muted-foreground" />
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium">
                          <IconUpload className="h-4 w-4 mb-0.5" />
                          <span>{avatarPreview ? "Change" : "Select"}</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <Label className="text-xs font-semibold">
                              Journalist Profile Photo
                            </Label>
                            <p className="text-[11px] text-muted-foreground">
                              PNG, JPG, WEBP up to 5MB. Automatically saved to <strong className="text-foreground font-mono">users/</strong> folder upon submission.
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/png, image/jpeg, image/webp, image/gif"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAvatarSelect(file);
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <IconUpload className="mr-1.5 h-3.5 w-3.5" />
                              {avatarPreview ? "Change Photo" : "Upload Photo"}
                            </Button>
                            {avatarPreview && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-destructive hover:bg-destructive/10"
                                onClick={handleAvatarRemove}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        {avatarPreview && (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-mono pt-1">
                            <IconCheck className="h-3.5 w-3.5" />
                            <span>Photo attached (will upload to users/ on submit)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold">
                          Full Legal / Bylined Name *
                        </Label>
                        <Input
                          id="name"
                          required
                          placeholder="e.g. Priya Sharma"
                          value={formData.display_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              display_name: e.target.value,
                            })
                          }
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-semibold">
                          Newsroom Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="e.g. priya.sharma@newsplatform.in"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="phone"
                          className="text-xs font-semibold flex items-center gap-1.5"
                        >
                          <IconPhone className="h-3.5 w-3.5 text-primary" /> Phone / WhatsApp Hotline
                        </Label>
                        <Input
                          id="phone"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="password"
                          className="text-xs font-semibold flex items-center gap-1.5"
                        >
                          <IconKey className="h-3.5 w-3.5 text-amber-500" /> Temporary Login Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Step 1 Footer */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOnboardOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (!formData.display_name?.trim()) {
                            toast.error("Please enter Full Legal / Bylined Name.");
                            return;
                          }
                          if (!formData.email?.trim()) {
                            toast.error("Please enter Newsroom Email Address.");
                            return;
                          }
                          setWizardStep("editorial");
                        }}
                      >
                        Next: Role & State Edition
                        <IconArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* ─── Tab 2: Role & Jurisdiction ─── */}
                  <TabsContent value="editorial" className="space-y-4 pt-3">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="emp-code" className="text-xs font-semibold">
                          Employee Code / ID *
                        </Label>
                        <Input
                          id="emp-code"
                          required
                          value={formData.employee_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              employee_code: e.target.value,
                            })
                          }
                          className="text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="dept" className="text-xs font-semibold">
                          Editorial Division / Beat
                        </Label>
                        <Select
                          value={formData.department}
                          onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              department: val || "Editorial",
                            })
                          }
                        >
                          <SelectTrigger id="dept" className="text-xs">
                            <SelectValue placeholder="Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Editorial">Editorial & Opinions</SelectItem>
                            <SelectItem value="Bureau">State & District Bureau</SelectItem>
                            <SelectItem value="Desk">Digital Live Desk</SelectItem>
                            <SelectItem value="FactCheck">Fact Check Division</SelectItem>
                            <SelectItem value="Video">Multimedia & Video Desk</SelectItem>
                            <SelectItem value="SocialMedia">Social Syndication</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="designation" className="text-xs font-semibold">
                          Designation Title *
                        </Label>
                        <Input
                          id="designation"
                          required
                          placeholder="e.g. Senior Bureau Chief"
                          value={formData.designation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              designation: e.target.value,
                            })
                          }
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="role" className="text-xs font-semibold">
                          IAM Role Assignment
                        </Label>
                        <Select
                          value={String(formData.role_id || 2)}
                          onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              role_id: parseInt(val || "2") || 2,
                            })
                          }
                        >
                          <SelectTrigger id="role" className="text-xs">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.length > 0 ? (
                              roles.map((r: any) => (
                                <SelectItem key={r.id} value={String(r.id)}>
                                  {r.name}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="1">Super Administrator</SelectItem>
                                <SelectItem value="2">Senior Editor</SelectItem>
                                <SelectItem value="3">Bureau Chief</SelectItem>
                                <SelectItem value="4">Reporter</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="tenant" className="text-xs font-semibold">
                          Newsroom Bureau Assignment
                        </Label>
                        <Select
                          value={String(formData.tenant_id || 1)}
                          onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              tenant_id: parseInt(val || "1") || 1,
                            })
                          }
                        >
                          <SelectTrigger id="tenant" className="text-xs">
                            <SelectValue placeholder="Newsroom Desk" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">National Central Newsroom Desk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Step 2 Footer */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setWizardStep("identity")}
                      >
                        <IconArrowLeft className="mr-1.5 h-4 w-4" />
                        Back: Identity
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (!formData.employee_code?.trim()) {
                            toast.error("Please enter Employee Code / ID.");
                            return;
                          }
                          if (!formData.designation?.trim()) {
                            toast.error("Please enter Designation Title.");
                            return;
                          }
                          setWizardStep("address");
                        }}
                      >
                        Next: Address & Bio
                        <IconArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* ─── Tab 3: Address, Bio & Press Card ─── */}
                  <TabsContent value="address" className="space-y-4 pt-3">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="address" className="text-xs font-semibold">
                          Bureau / Residential Address
                        </Label>
                        <Input
                          id="address"
                          placeholder="Street, locality, city"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="pincode" className="text-xs font-semibold">
                          Postal PIN Code
                        </Label>
                        <Input
                          id="pincode"
                          placeholder="e.g. 834001"
                          value={formData.pin_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pin_code: e.target.value,
                            })
                          }
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="presscard"
                          className="text-xs font-semibold flex items-center gap-1.5"
                        >
                          <IconCertificate className="h-3.5 w-3.5 text-amber-500" /> PIB / State Press Accreditation ID
                        </Label>
                        <Input
                          id="presscard"
                          placeholder="e.g. PIB-DEL-2026-99"
                          value={formData.press_card_no}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              press_card_no: e.target.value,
                            })
                          }
                          className="text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="xhandle"
                          className="text-xs font-semibold flex items-center gap-1.5"
                        >
                          <IconBrandX className="h-3.5 w-3.5" /> Journalist X (Twitter) Handle
                        </Label>
                        <Input
                          id="xhandle"
                          placeholder="@username"
                          value={formData.x_handle}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              x_handle: e.target.value,
                            })
                          }
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bio" className="text-xs font-semibold">
                        Author Profile Biography (Reader Byline Bio)
                      </Label>
                      <Textarea
                        id="bio"
                        placeholder="Brief 2-3 lines about journalistic beat, achievements, and coverage area…"
                        rows={3}
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        className="text-xs resize-none"
                      />
                    </div>

                    {/* Step 3 Footer: Final Submit */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setWizardStep("editorial")}
                      >
                        <IconArrowLeft className="mr-1.5 h-4 w-4" />
                        Back: Role & State
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={onboardMutation.isPending || isUploadingAvatar}
                      >
                        {onboardMutation.isPending || isUploadingAvatar ? (
                          <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <IconCheck className="mr-1.5 h-4 w-4" />
                        )}
                        Complete Onboarding & Save Staff
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <IconSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search database by name, email, code, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs font-mono"
            />
          </div>

          <Select
            value={selectedDept}
            onValueChange={(val) => setSelectedDept(val || "all")}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Beat / Dept" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Beats</SelectItem>
              <SelectItem value="Editorial">Editorial</SelectItem>
              <SelectItem value="Bureau">Bureau</SelectItem>
              <SelectItem value="Desk">Desk</SelectItem>
              <SelectItem value="FactCheck">Fact Check</SelectItem>
              <SelectItem value="Video">Video Desk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span>
            Database Staff: <strong>{filteredEmployees.length}</strong>
          </span>
          <span>•</span>
          <span>
            Active:{" "}
            <strong className="text-emerald-500">
              {filteredEmployees.filter((e) => e.is_active).length}
            </strong>
          </span>
        </div>
      </div>

      {/* Database Staff Table & Mobile Cards */}
      {isLoading ? (
        <LoadingState message="Connecting to employee records…" />
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          icon={IconUsers}
          title="No staff members found"
          description="Try modifying your search or add a new team member."
        />
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="rounded-lg border bg-card p-3.5 space-y-3 shadow-xs transition-colors hover:border-primary/40 cursor-pointer"
                onClick={() => setProfileModalEmp(emp)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                      {emp.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={emp.avatar_url}
                          alt={emp.display_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-xs">
                          {(emp.display_name || "TM").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-foreground truncate">
                        {emp.display_name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {emp.designation} • {emp.department}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {emp.role_name || "Staff"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1.5">
                    <IconArticle className="h-3.5 w-3.5 text-primary" />
                    <span>{emp.article_count || 0} articles</span>
                    <span>·</span>
                    <span className="font-mono">{((emp.total_views || 0) / 1000).toFixed(0)}k views</span>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={emp.is_active}
                      onCheckedChange={(checked) =>
                        statusMutation.mutate({
                          id: emp.id,
                          isActive: checked,
                        })
                      }
                      disabled={statusMutation.isPending}
                    />
                    <span
                      className={`text-[10px] font-mono ${emp.is_active ? "text-emerald-500" : "text-muted-foreground"}`}
                    >
                      {emp.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Journalist / Profile</TableHead>
                  <TableHead>Contact & Address</TableHead>
                  <TableHead>Bureau & Beat</TableHead>
                  <TableHead>About & Press ID</TableHead>
                  <TableHead>Activity & KPI</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow
                  key={emp.id}
                  className="hover:bg-muted/20 cursor-pointer"
                  onClick={() => setProfileModalEmp(emp)}
                >
                  {/* Journalist / Profile */}
                  <TableCell className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                        {emp.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={emp.avatar_url}
                            alt={emp.display_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-xs">
                            {(emp.display_name || "JS").slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                          {emp.display_name}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {emp.employee_code} • {emp.designation}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact & Address */}
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    <div>{emp.email}</div>
                    {emp.phone && (
                      <div className="text-foreground text-[11px] flex items-center gap-1">
                        <IconPhone className="h-3 w-3 text-emerald-500" />
                        {emp.phone}
                      </div>
                    )}
                    {(emp.address || emp.pin_code) && (
                      <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                        {emp.address} {emp.pin_code ? `(${emp.pin_code})` : ""}
                      </div>
                    )}
                  </TableCell>

                  {/* Bureau & Beat */}
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {emp.tenant_name || "National"}
                    </Badge>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {emp.department} • {emp.role_name || "Reporter"}
                    </div>
                  </TableCell>

                  {/* About & Press ID */}
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                    <div
                      className="truncate text-foreground text-[11px]"
                      title={emp.bio || "Staff journalist"}
                    >
                      {emp.bio || "Staff journalist"}
                    </div>
                    {emp.press_card_no && (
                      <div className="text-[10px] font-mono text-amber-500/90 flex items-center gap-1 mt-0.5">
                        <IconCertificate className="h-3 w-3" />
                        {emp.press_card_no}
                      </div>
                    )}
                  </TableCell>

                  {/* Activity & KPI */}
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    <div className="flex items-center gap-1 text-foreground font-semibold">
                      <IconArticle className="h-3.5 w-3.5 text-primary" />
                      {emp.article_count || 0} articles
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {((emp.total_views || 0) / 1000).toFixed(0)}k views
                    </div>
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={emp.is_active}
                        onCheckedChange={(checked) =>
                          statusMutation.mutate({
                            id: emp.id,
                            isActive: checked,
                          })
                        }
                        disabled={statusMutation.isPending}
                      />
                      <span
                        className={`text-[10px] font-mono ${emp.is_active ? "text-emerald-500" : "text-muted-foreground"}`}
                      >
                        {emp.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setProfileModalEmp(emp)}
                      >
                        <IconId className="mr-1 h-3.5 w-3.5" />
                        Press Card
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        title="Delete Employee"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to remove ${emp.display_name} from staff?`
                            )
                          ) {
                            deleteMutation.mutate(emp.id);
                          }
                        }}
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </>
      )}

      {/* Press ID Card / Detailed Profile Modal */}
      {profileModalEmp && (
        <Dialog
          open={!!profileModalEmp}
          onOpenChange={(open) => !open && setProfileModalEmp(null)}
        >
          <DialogContent className="sm:max-w-xl p-6">
            <DialogHeader className="pb-2 border-b">
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>Newsroom Press Accreditation & Dossier</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {profileModalEmp.employee_code}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Press Header Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/60 shadow-xs">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary bg-muted shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      profileModalEmp.avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileModalEmp.display_name)}`
                    }
                    alt={profileModalEmp.display_name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground leading-tight">
                    {profileModalEmp.display_name}
                  </h3>
                  <p className="text-xs text-primary font-medium">
                    {profileModalEmp.designation} • {profileModalEmp.department}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Edition: {profileModalEmp.tenant_name || "National"} | PIB ID:{" "}
                    {profileModalEmp.press_card_no || "N/A"}
                  </p>
                </div>
              </div>

              {/* Editorial Bio & Mission */}
              <div className="p-3.5 rounded-lg border bg-muted/20 text-xs space-y-1.5">
                <span className="font-semibold text-foreground">
                  Author Biography & Beat:
                </span>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  {profileModalEmp.bio || "No biography added yet."}
                </p>
              </div>

              {/* Detailed Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                  <span className="text-muted-foreground text-[10px]">
                    CONTACT:
                  </span>
                  <div className="text-foreground font-semibold">
                    {profileModalEmp.phone || "N/A"}
                  </div>
                  <div className="text-muted-foreground text-[11px] truncate">
                    {profileModalEmp.email}
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                  <span className="text-muted-foreground text-[10px]">
                    ADDRESS & PIN:
                  </span>
                  <div className="text-foreground font-semibold truncate">
                    {profileModalEmp.address || "Bureau Office"}
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    PIN: {profileModalEmp.pin_code || "N/A"}
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                  <span className="text-muted-foreground text-[10px]">
                    PUBLISHING ACTIVITY:
                  </span>
                  <div className="text-primary font-bold text-sm">
                    {profileModalEmp.article_count || 0} Published
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    {((profileModalEmp.total_views || 0) / 1000).toFixed(0)}k Total Views
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                  <span className="text-muted-foreground text-[10px]">
                    GOVERNANCE:
                  </span>
                  <div className="text-foreground font-semibold">
                    {profileModalEmp.role_name || "Reporter"}
                  </div>
                  <div className="text-emerald-500 text-[11px]">
                    Joined: {profileModalEmp.joined_at?.slice(0, 10)}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <Button size="sm" onClick={() => setProfileModalEmp(null)}>
                Close Dossier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
