import { useState, useRef, useCallback } from "react";
import {
    TbUsers, TbCheck, TbX, TbSearch,
    TbRefresh, TbLoader2, TbEye, TbBan,
    TbBuildingStore,
    TbChevronDown,

} from "react-icons/tb";
import { MdVerified } from "react-icons/md";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

/* ─── helpers ─── */
const fmt = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
        })
        : "—";

const timeSince = (iso) => {
    if (!iso) return "Never";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const ROLE_CFG = {
    admin: { color: "oklch(0.52 0.18 25)", bg: "oklch(0.52 0.18 25 / 0.1)", label: "Admin" },
    seller: { color: "oklch(0.50 0.16 250)", bg: "oklch(0.50 0.16 250 / 0.1)", label: "Seller" },
    customer: { color: "oklch(0.45 0.12 160)", bg: "oklch(0.45 0.12 160 / 0.1)", label: "Customer" },
};

const STATUS_CFG = {
    active: { color: "oklch(0.42 0.14 160)", bg: "oklch(0.42 0.14 160 / 0.1)", label: "Active" },
    restricted: { color: "oklch(0.52 0.18 25)", bg: "oklch(0.52 0.18 25 / 0.1)", label: "Restricted" },
    suspended: { color: "oklch(0.48 0.15 25)", bg: "oklch(0.48 0.15 25 / 0.1)", label: "Suspended" },
};

/* ══════════════════════════════════════════
   MANAGE USERS PAGE
══════════════════════════════════════════ */
const ManageUsers = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const pageRef = useRef(null);

    const [tab, setTab] = useState("users");   // "users" | "requests"
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    /* ── fetch all users ── */
    const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
        queryKey: ["admin-users", roleFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (roleFilter) params.set("role", roleFilter);
            const res = await axiosSecure.get(`/users?${params}`);
            return res.data;
        },
    });


    /* ── fetch seller requests ── */
    const { data: requestsData, isLoading: reqLoading, refetch: refetchReqs } = useQuery({
        queryKey: ["seller-requests"],
        queryFn: async () => {
            const res = await axiosSecure.get("/seller-requests");
            return res.data;
        },
    });

    const users = usersData?.data || [];
    const requests = requestsData?.data || [];

    const filtered = users?.filter(u =>
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    /* ── actions ── */
    const updateRole = useCallback(async (userId, role) => {
        setActionLoading(userId + role);
        try {
            await axiosSecure.patch(`/users/${userId}/role`, { role });
            toast.success(`Role updated to ${role}`);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed");
        } finally {
            setActionLoading(null);
        }
    }, [axiosSecure, queryClient]);

    const updateStatus = useCallback(async (userId, status) => {
        setActionLoading(userId + status);
        try {
            await axiosSecure.patch(`/users/${userId}/status`, { status });
            toast.success(`User ${status}`);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed");
        } finally {
            setActionLoading(null);
        }
    }, [axiosSecure, queryClient]);

    const handleRequest = useCallback(async (reqId, action) => {
        setActionLoading(reqId + action);
        try {
            await axiosSecure.patch(`/seller-requests/${reqId}`, { action });
            if (action === "approve") {
                toast.success("Seller approved! Account upgraded.");
            } else {
                toast.success("Request rejected.");
            }
            queryClient.invalidateQueries({ queryKey: ["seller-requests"] });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed");
        } finally {
            setActionLoading(null);
        }
    }, [axiosSecure, queryClient]);

    const pendingCount = requests.filter(r => r.status === "pending").length;

    return (
        <div ref={pageRef} className="py-6 flex flex-col gap-6">

            {/* ── HEADER + STATS ── */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.02em" }}>
                        User Registry
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        {users.length} total accounts
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => { refetchUsers(); refetchReqs(); }}
                        className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                        <TbRefresh size={15} />
                    </button>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Users", val: users.length, color: "oklch(0.45 0.12 160)" },
                    { label: "Sellers", val: users.filter(u => u.role === "seller").length, color: "oklch(0.50 0.16 250)" },
                    { label: "Admins", val: users.filter(u => u.role === "admin").length, color: "oklch(0.52 0.18 25)" },
                    { label: "Pending Reqs", val: pendingCount, color: "oklch(0.62 0.16 80)" },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-1">
                        <p className="text-2xl font-black leading-none" style={{ color: s.color, fontFamily: "'Georgia', serif" }}>{s.val}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── TABS ── */}
            <div className="flex p-1 rounded-xl bg-accent border border-border self-start">
                {[
                    { key: "users", label: "All Users", icon: TbUsers },
                    { key: "requests", label: `Seller Requests${pendingCount ? ` (${pendingCount})` : ""}`, icon: TbBuildingStore },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all",
                            tab === t.key
                                ? "bg-card text-primary shadow-sm border border-border"
                                : "text-muted-foreground hover:text-foreground"
                        )}>
                        <t.icon size={13} /> {t.label}
                    </button>
                ))}
            </div>

            {/* ── USERS TAB ── */}
            {tab === "users" && (
                <div className="flex flex-col gap-4">
                    {/* Search + filter */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[200px] relative">
                            <TbSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name or email…"
                                className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {["", "customer", "seller", "admin"].map(r => (
                                <button key={r} onClick={() => setRoleFilter(r)}
                                    className={cn(
                                        "px-4 h-10 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all",
                                        roleFilter === r
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card border-border text-muted-foreground hover:text-foreground"
                                    )}>
                                    {r || "All"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    {usersLoading ? (
                        <div className="flex flex-col gap-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 rounded-2xl border border-border bg-card animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center rounded-2xl border border-dashed border-border">
                            <TbUsers size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground font-semibold">No users found</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border bg-card overflow-hidden">
                            {/* Desktop header */}
                            <div className="hidden sm:grid px-5 py-3 border-b border-border bg-accent/40 text-[9px] font-black uppercase tracking-widest text-muted-foreground"
                                style={{ gridTemplateColumns: "1fr 140px 110px 120px 180px" }}>
                                <span>User</span>
                                <span>Role</span>
                                <span>Status</span>
                                <span>Last Seen</span>
                                <span className="text-right">Actions</span>
                            </div>

                            <div className="divide-y divide-border">
                                {filtered.map(u => (
                                    <UserRow key={u._id} user={u}
                                        onRoleChange={updateRole}
                                        onStatusChange={updateStatus}
                                        actionLoading={actionLoading}
                                        onView={setSelectedUser}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── SELLER REQUESTS TAB ── */}
            {tab === "requests" && (
                <div className="flex flex-col gap-3">
                    {reqLoading ? (
                        <div className="flex flex-col gap-2">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl border border-border bg-card animate-pulse" />)}
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="py-16 text-center rounded-2xl border border-dashed border-border">
                            <TbBuildingStore size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground font-semibold">No seller requests</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <SellerRequestCard key={req._id} req={req}
                                onAction={handleRequest} actionLoading={actionLoading} />
                        ))
                    )}
                </div>
            )}

            {/* ── USER DETAIL MODAL ── */}
            {selectedUser && (
                <UserModal user={selectedUser} onClose={() => setSelectedUser(null)}
                    onRoleChange={(id, role) => { updateRole(id, role); setSelectedUser(prev => ({ ...prev, role })); }}
                    onStatusChange={(id, status) => { updateStatus(id, status); setSelectedUser(prev => ({ ...prev, status })); }}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    );
};

/* ══════════════════════════════════════════
   USER ROW
══════════════════════════════════════════ */
const UserRow = ({ user, onRoleChange, onStatusChange, actionLoading, onView }) => {
    const roleCfg = ROLE_CFG[user.role] || ROLE_CFG.customer;
    const statusCfg = STATUS_CFG[user.status] || STATUS_CFG.active;
    const isLoading = (k) => actionLoading === user._id + k;

    return (
        <div className="mu-row">
            {/* Desktop */}
            <div className="hidden sm:grid items-center gap-4 px-5 py-3.5 hover:bg-accent/30 transition-colors"
                style={{ gridTemplateColumns: "1fr 140px 110px 120px 180px" }}>

                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                    <img src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                        alt={user.name}
                        className="w-9 h-9 rounded-xl object-cover border border-border shrink-0" />
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
                            {user.name}
                            {user.role === "admin" && <MdVerified size={12} style={{ color: roleCfg.color }} />}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium truncate">{user.email}</p>
                    </div>
                </div>

                {/* Role */}
                <RoleBadge role={user.role} />

                {/* Status */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{ background: statusCfg.bg, color: statusCfg.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.color }} />
                    {statusCfg.label}
                </span>

                {/* Last seen */}
                <span className="text-xs text-muted-foreground font-semibold">{timeSince(user.lastLoggedIn)}</span>

                {/* Actions */}
                <div className="flex items-center gap-2 justify-end flex-wrap">
                    <button onClick={() => onView(user)}
                        className="w-8 h-8 rounded-lg border border-border bg-accent flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                        <TbEye size={13} />
                    </button>

                    {/* Role dropdown */}
                    {user.role !== "admin" && (
                        <RoleDropdown userId={user._id} currentRole={user.role}
                            onRoleChange={onRoleChange} isLoading={isLoading} />
                    )}

                    {/* Restrict / Activate */}
                    {user.status === "active" ? (
                        <button onClick={() => onStatusChange(user._id, "restricted")}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 h-8 px-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-[10px] font-black hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50">
                            {isLoading("restricted") ? <TbLoader2 size={11} className="animate-spin" /> : <TbBan size={11} />}
                            Restrict
                        </button>
                    ) : (
                        <button onClick={() => onStatusChange(user._id, "active")}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 h-8 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-black hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">
                            {isLoading("active") ? <TbLoader2 size={11} className="animate-spin" /> : <TbCheck size={11} />}
                            Activate
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile */}
            <div className="sm:hidden flex items-center gap-3 px-4 py-3.5 hover:bg-accent/30 transition-colors">
                <img src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover border border-border shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-medium truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <RoleBadge role={user.role} small />
                        <span className="text-[9px] text-muted-foreground font-semibold">{timeSince(user.lastLoggedIn)}</span>
                    </div>
                </div>
                <button onClick={() => onView(user)}
                    className="w-8 h-8 rounded-lg border border-border bg-accent flex items-center justify-center text-muted-foreground shrink-0">
                    <TbEye size={13} />
                </button>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   ROLE DROPDOWN
══════════════════════════════════════════ */
const RoleDropdown = ({ userId, currentRole, onRoleChange, isLoading }) => {
    const [open, setOpen] = useState(false);
    const roles = ["customer", "seller", "admin"].filter(r => r !== currentRole);

    return (
        <div className="relative">
            <button onClick={() => setOpen(v => !v)}
                className="flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border bg-accent text-muted-foreground text-[10px] font-black uppercase tracking-wider hover:text-foreground transition-all">
                Role <TbChevronDown size={10} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[120px]">
                    {roles.map(r => {
                        const cfg = ROLE_CFG[r];
                        return (
                            <button key={r} onClick={() => { onRoleChange(userId, r); setOpen(false); }}
                                disabled={!!isLoading(r)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-black uppercase tracking-wider hover:bg-accent transition-colors text-left">
                                {isLoading(r)
                                    ? <TbLoader2 size={11} className="animate-spin" />
                                    : <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                                }
                                <span style={{ color: cfg.color }}>{cfg.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════
   SELLER REQUEST CARD
══════════════════════════════════════════ */
const SellerRequestCard = ({ req, onAction, actionLoading }) => {
    const [expanded, setExpanded] = useState(false);
    const isPending = req.status === "pending";

    const STATUS_MAP = {
        pending: { color: "oklch(0.62 0.16 80)", bg: "oklch(0.62 0.16 80 / 0.1)", label: "Pending Review" },
        approved: { color: "oklch(0.42 0.14 160)", bg: "oklch(0.42 0.14 160 / 0.1)", label: "Approved" },
        rejected: { color: "oklch(0.52 0.18 25)", bg: "oklch(0.52 0.18 25 / 0.1)", label: "Rejected" },
    };
    const sc = STATUS_MAP[req.status] || STATUS_MAP.pending;

    return (
        <div className="mu-row rounded-2xl border border-border bg-card overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>

            {/* Header */}
            <div className="flex items-center gap-4 px-5 py-4">
                <img
                    src={req.applicantPhoto || `https://ui-avatars.com/api/?name=${req.applicantName}&background=random`}
                    alt={req.applicantName}
                    className="w-11 h-11 rounded-xl object-cover border border-border shrink-0" />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-foreground">{req.applicantName}</p>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: sc.bg, color: sc.color }}>
                            {sc.label}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{req.applicantEmail}</p>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                        🏪 {req.shopName} · {req.district}
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                        <>
                            <button onClick={() => onAction(req._id, "approve", req.applicantEmail)}
                                disabled={!!actionLoading}
                                className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-black hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">
                                {actionLoading === req._id + "approve"
                                    ? <TbLoader2 size={12} className="animate-spin" />
                                    : <TbCheck size={12} />}
                                Approve
                            </button>
                            <button onClick={() => onAction(req._id, "reject", req.applicantEmail)}
                                disabled={!!actionLoading}
                                className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-[11px] font-black hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50">
                                {actionLoading === req._id + "reject"
                                    ? <TbLoader2 size={12} className="animate-spin" />
                                    : <TbX size={12} />}
                                Reject
                            </button>
                        </>
                    )}
                    <button onClick={() => setExpanded(v => !v)}
                        className="w-8 h-8 rounded-xl border border-border bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                        <TbChevronDown size={13} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="border-t border-border px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-accent/20">
                    <DetailField label="Phone" value={req.phone} />
                    <DetailField label="District" value={req.district} />
                    <DetailField label="Specialization" value={req.specialization} />
                    <DetailField label="Experience" value={req.experience} />
                    <DetailField label="NID Number" value={req.nidNumber} sensitive />
                    <DetailField label="Trade License" value={req.tradeLicense || "Not provided"} />
                    <div className="sm:col-span-2">
                        <DetailField label="Shop Address" value={req.address} />
                    </div>
                    <div className="sm:col-span-2">
                        <DetailField label="Bio" value={req.bio} />
                    </div>
                    <div className="sm:col-span-2 text-[10px] text-muted-foreground font-semibold">
                        Applied: {fmt(req.createdAt)}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════
   USER DETAIL MODAL
══════════════════════════════════════════ */
const UserModal = ({ user, onClose, onRoleChange, onStatusChange, actionLoading }) => {
    const roleCfg = ROLE_CFG[user.role] || ROLE_CFG.customer;
    const statusCfg = STATUS_CFG[user.status] || STATUS_CFG.active;
    const roles = ["customer", "seller", "admin"].filter(r => r !== user.role);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={onClose}>
            <div className="w-full max-w-md rounded-3xl border border-border bg-card overflow-hidden"
                style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}
                onClick={e => e.stopPropagation()}>

                {/* Banner */}
                <div className="h-20 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${roleCfg.color}25, ${roleCfg.color}08)` }}>
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to bottom, transparent 50%, var(--color-card))",
                    }} />
                </div>

                <div className="px-6 pb-6" style={{ marginTop: -36 }}>
                    <div className="flex items-end gap-4 justify-between">
                        <img src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                            alt={user.name}
                            className="w-16 h-16 rounded-2xl object-cover border-4 border-card"
                            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }} />
                        <button onClick={onClose}
                            className="w-8 h-8 rounded-xl border border-border bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-all mb-1">
                            <TbX size={14} />
                        </button>
                    </div>

                    <div className="mt-2">
                        <p className="text-xl font-black" style={{ fontFamily: "'Georgia', serif", fontStyle: "italic" }}>{user.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <RoleBadge role={user.role} />
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                                style={{ background: statusCfg.bg, color: statusCfg.color }}>
                                {statusCfg.label}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 text-xs">
                        <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground font-semibold">Member since</span>
                            <span className="font-bold">{fmt(user.createdAt)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground font-semibold">Last login</span>
                            <span className="font-bold">{timeSince(user.lastLoggedIn)}</span>
                        </div>
                    </div>

                    {/* Admin actions */}
                    <div className="mt-4 flex flex-col gap-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Change Role</p>
                        <div className="flex gap-2 flex-wrap">
                            {roles.map(r => {
                                const cfg = ROLE_CFG[r];
                                const isLoading = actionLoading === user._id + r;
                                return (
                                    <button key={r} onClick={() => onRoleChange(user._id, r)}
                                        disabled={!!actionLoading}
                                        className="flex items-center gap-1.5 h-9 px-4 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-50 hover:opacity-90"
                                        style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}30` }}>
                                        {isLoading ? <TbLoader2 size={11} className="animate-spin" /> : null}
                                        → {cfg.label}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-2">Account Status</p>
                        <div className="flex gap-2">
                            {user.status !== "active" && (
                                <button onClick={() => onStatusChange(user._id, "active")}
                                    className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-black hover:bg-emerald-500 hover:text-white transition-all">
                                    <TbCheck size={12} /> Activate
                                </button>
                            )}
                            {user.status === "active" && (
                                <button onClick={() => onStatusChange(user._id, "restricted")}
                                    className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-[11px] font-black hover:bg-rose-500 hover:text-white transition-all">
                                    <TbBan size={12} /> Restrict
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── tiny helpers ─── */
const RoleBadge = ({ role, small }) => {
    const cfg = ROLE_CFG[role] || ROLE_CFG.customer;
    return (
        <span className={cn("inline-flex items-center gap-1 rounded-full font-black uppercase tracking-wider",
            small ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-1")}
            style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.label}
        </span>
    );
};

const DetailField = ({ label, value, sensitive }) => (
    <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-foreground">
            {sensitive ? `••••${String(value).slice(-4)}` : (value || "—")}
        </p>
    </div>
);

export default ManageUsers;