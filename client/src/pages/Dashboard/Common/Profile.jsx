import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
    TbUser, TbMail, TbCalendar, TbShield, TbEdit,
    TbCheck, TbX, TbUpload, TbClock,
    TbPackage, TbActivity, TbLock,
} from "react-icons/tb";
import { MdVerified } from "react-icons/md";
import useAuth from "@/hooks/useAuth";
import useUserRole from "@/hooks/useUserRole";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useOrders from "@/hooks/useOrders";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { imageUpload } from "@/api/utils";
import useUploadProgress from "@/hooks/useUploadProgress";

/* ─── helpers ─── */
const fmt = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
        })
        : "—";

const fmtFull = (iso) =>
    iso
        ? new Date(iso).toLocaleString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
        : "—";

const timeSince = (iso) => {
    if (!iso) return "Never";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return fmt(iso);
};

const ROLE_CFG = {
    admin: { color: "oklch(0.52 0.18 25)", bg: "oklch(0.52 0.18 25 / 0.1)", label: "Administrator" },
    seller: { color: "oklch(0.50 0.16 250)", bg: "oklch(0.50 0.16 250 / 0.1)", label: "Verified Seller" },
    customer: { color: "oklch(0.45 0.12 160)", bg: "oklch(0.45 0.12 160 / 0.1)", label: "Member" },
};

/* ══════════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════════ */
const Profile = () => {
    const { user, updateUserProfile } = useAuth();
    const { role } = useUserRole();
    const axiosSecure = useAxiosSecure();
    const pageRef = useRef(null);
    const { uploadWithProgress } = useUploadProgress();

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
    const [photoFile, setPhotoFile] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);

    // orders for activity
    const { data: ordersData } = useOrders({ perspective: role });
    const orders = ordersData?.data || [];

    const roleCfg = ROLE_CFG[role] || ROLE_CFG.customer;

    /* entrance */
    useGSAP(() => {
        gsap.from(".prof-card", {
            y: 28, opacity: 0, stagger: 0.08, duration: 0.7, ease: "expo.out",
        });
    }, { scope: pageRef });

    /* photo pick */
    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPreviewURL(URL.createObjectURL(file));
    };

    /* save */
    const handleSave = async () => {
        if (!displayName.trim()) return toast.error("Name cannot be empty");
        setSaving(true);
        try {
            let finalPhoto = photoURL;

            if (photoFile) {
                const photoURL = await imageUpload(photoFile, uploadWithProgress);
                finalPhoto = photoURL;
            }

            // Update Firebase auth profile
            await updateUserProfile(displayName.trim(), finalPhoto);

            // Sync to your DB
            await axiosSecure.patch("/users/me", {
                name: displayName.trim(),
                photo: finalPhoto,
            });

            toast.success("Profile updated!");
            setEditing(false);
            setPhotoFile(null);
            setPreviewURL(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditing(false);
        setDisplayName(user?.displayName || "");
        setPhotoURL(user?.photoURL || "");
        setPhotoFile(null);
        setPreviewURL(null);
    };

    /* order stats */
    const stats = {
        total: orders.length,
        delivered: orders.filter(o => o.status === "delivered").length,
        pending: orders.filter(o => o.status === "pending").length,
        cancelled: orders.filter(o => o.status === "cancelled").length,
    };

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

    return (
        <div ref={pageRef} className="py-6 flex flex-col gap-6">

            {/* ── HERO CARD ── */}
            <div className="prof-card relative rounded-3xl overflow-hidden border border-border bg-card"
                style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>

                {/* Banner */}
                <div className="h-28 relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${roleCfg.color}30, ${roleCfg.color}08, var(--color-secondary))`,
                    }}>
                    {/* subtle grid pattern */}
                    <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: `radial-gradient(circle, ${roleCfg.color}20 1px, transparent 1px)`,
                        backgroundSize: "24px 24px",
                    }} />
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to bottom, transparent 60%, var(--color-card))",
                    }} />
                </div>

                <div className="px-6 pb-6" style={{ marginTop: -48 }}>
                    <div className="flex flex-wrap items-end gap-4 justify-between">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-card"
                                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                                <img
                                    src={previewURL || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {editing && (
                                <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center cursor-pointer"
                                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                                    <TbUpload size={14} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            )}
                            {/* Online indicator */}
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-card" />
                        </div>

                        {/* Edit controls */}
                        <div className="flex items-center gap-2 pb-1">
                            {!editing ? (
                                <button onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-accent text-muted-foreground text-xs font-bold hover:text-foreground hover:border-primary transition-all">
                                    <TbEdit size={13} /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button onClick={cancelEdit}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-accent text-muted-foreground text-xs font-bold transition-all hover:text-foreground">
                                        <TbX size={13} /> Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:opacity-90 disabled:opacity-60">
                                        {saving
                                            ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <TbCheck size={13} />}
                                        Save
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Name & role */}
                    <div className="mt-3">
                        {editing ? (
                            <input
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                className="text-2xl font-black bg-transparent border-b-2 border-primary outline-none w-full max-w-xs"
                                style={{ fontFamily: "'Georgia', serif", fontStyle: "italic" }}
                                placeholder="Your name"
                            />
                        ) : (
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.02em" }}>
                                    {user?.displayName}
                                </h2>
                                <MdVerified size={18} style={{ color: roleCfg.color }} />
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                                style={{ background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.color}30` }}>
                                <TbShield size={10} /> {roleCfg.label}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                <TbCalendar size={12} /> Member since {fmt(user?.metadata?.creationTime)}
                            </span>
                        </div>
                    </div>

                    {/* Protected fields notice */}
                    {editing && (
                        <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                            <TbLock size={13} />
                            Email address cannot be changed for security reasons.
                        </div>
                    )}
                </div>
            </div>

            {/* ── INFO + STATS GRID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Account Info */}
                <div className="prof-card rounded-2xl border border-border bg-card overflow-hidden"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                    <SectionHead icon={TbUser} title="Account Info" />
                    <div className="p-5 flex flex-col gap-4">
                        <InfoField icon={TbMail} label="Email" value={user?.email} locked />
                        <InfoField icon={TbUser} label="Display Name" value={user?.displayName} />
                        <InfoField icon={TbShield} label="Role" value={roleCfg.label} />
                        <InfoField icon={TbClock} label="Last seen" value={timeSince(user?.metadata?.lastSignInTime)} />
                        <InfoField
                            icon={TbCalendar}
                            label="Account created"
                            value={fmtFull(user?.metadata?.creationTime)}
                        />
                    </div>
                </div>

                {/* Order Stats */}
                <div className="prof-card rounded-2xl border border-border bg-card overflow-hidden"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                    <SectionHead icon={TbActivity} title="Activity Overview" />
                    <div className="p-5 grid grid-cols-2 gap-3">
                        <StatTile value={stats.total} label="Total Orders" color="oklch(0.45 0.12 160)" />
                        <StatTile value={stats.delivered} label="Delivered" color="oklch(0.42 0.14 160)" />
                        <StatTile value={stats.pending} label="Pending" color="oklch(0.62 0.16 80)" />
                        <StatTile value={stats.cancelled} label="Cancelled" color="oklch(0.52 0.18 25)" />
                    </div>
                    {/* session info */}
                    <div className="px-5 pb-5 flex flex-col gap-2">
                        <div className="h-px bg-border" />
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session</span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-semibold text-emerald-600">Active Now</span>
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                            Last login: <span className="text-foreground font-semibold">{fmtFull(user?.metadata?.lastSignInTime)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RECENT ACTIVITY ── */}
            {recentOrders.length > 0 && (
                <div className="prof-card rounded-2xl border border-border bg-card overflow-hidden"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                    <SectionHead icon={TbPackage} title="Recent Orders" />
                    <div className="divide-y divide-border">
                        {recentOrders.map(order => (
                            <div key={order._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/40 transition-colors">
                                <img src={order.plantImage} alt={order.plantName}
                                    className="w-10 h-10 rounded-xl object-cover border border-border shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-foreground truncate"
                                        style={{ fontFamily: "'Georgia', serif", fontStyle: "italic" }}>
                                        {order.plantName}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium">{fmt(order.createdAt)}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-black text-foreground">৳{order.totalPrice?.toLocaleString()}</p>
                                    <StatusPill status={order.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── SECURITY NOTE ── */}
            <div className="prof-card rounded-2xl border border-border bg-card p-5"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                <SectionHead icon={TbLock} title="Security" />
                <div className="mt-4 flex flex-col gap-3">
                    <SecurityRow label="Email verified" value={user?.emailVerified ? "Yes" : "No"} ok={user?.emailVerified} />
                    <SecurityRow label="Authentication" value="Email & Password" ok />
                    <SecurityRow label="Account status" value="Active" ok />
                </div>
            </div>
        </div>
    );
};

/* ─── sub-components ─── */
// eslint-disable-next-line no-unused-vars
const SectionHead = ({ icon: Icon, title }) => (
    <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
        <Icon size={13} className="text-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground">{title}</span>
    </div>
);

// eslint-disable-next-line no-unused-vars
const InfoField = ({ icon: Icon, label, value, locked }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Icon size={13} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-foreground truncate">{value || "—"}</p>
        </div>
        {locked && <TbLock size={12} className="text-muted-foreground shrink-0" />}
    </div>
);

const StatTile = ({ value, label, color }) => (
    <div className="rounded-xl p-4 border border-border bg-accent/30 flex flex-col gap-1">
        <p className="text-2xl font-black leading-none" style={{ color, fontFamily: "'Georgia', serif" }}>{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
);

const StatusPill = ({ status }) => {
    const MAP = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        confirmed: "bg-blue-50 text-blue-700 border-blue-200",
        shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
        delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
        cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
        <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border", MAP[status] || MAP.pending)}>
            {status}
        </span>
    );
};

const SecurityRow = ({ label, value, ok }) => (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
        <span className={cn(
            "flex items-center gap-1.5 text-xs font-bold",
            ok ? "text-emerald-600" : "text-rose-600"
        )}>
            {ok ? <TbCheck size={12} /> : <TbX size={12} />}
            {value}
        </span>
    </div>
);

export default Profile;