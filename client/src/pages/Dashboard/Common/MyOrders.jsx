import { useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbPackage, TbTruckDelivery, TbCheckupList, TbClockHour4,
  TbArrowUpRight, TbTrash, TbX, TbCheck, TbChevronDown,
  TbMapPin, TbLeaf, TbRefresh,
} from "react-icons/tb";
import { TbLoader2 } from "react-icons/tb";
import useOrders from "@/hooks/useOrders";
import useUserRole from "@/hooks/useUserRole";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────── */
const STATUS_CFG = {
  pending:   { label: "Pending",   color: "oklch(0.62 0.16 80)",  bg: "oklch(0.97 0.04 80)",  border: "oklch(0.85 0.08 80 / 0.5)"  },
  confirmed: { label: "Confirmed", color: "oklch(0.50 0.16 250)", bg: "oklch(0.96 0.03 250)", border: "oklch(0.82 0.08 250 / 0.5)" },
  shipped:   { label: "Shipped",   color: "oklch(0.48 0.14 220)", bg: "oklch(0.95 0.03 220)", border: "oklch(0.80 0.08 220 / 0.5)" },
  delivered: { label: "Delivered", color: "oklch(0.42 0.14 160)", bg: "oklch(0.95 0.04 160)", border: "oklch(0.80 0.10 160 / 0.5)" },
  cancelled: { label: "Cancelled", color: "oklch(0.48 0.15 25)",  bg: "oklch(0.97 0.03 25)",  border: "oklch(0.85 0.08 25 / 0.5)"  },
};

/* Next allowed statuses per role */
const SELLER_NEXT = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["shipped"],
  shipped:   ["delivered"],
  delivered: [],
  cancelled: [],
};
const BUYER_NEXT = {
  pending: ["cancelled"],
  confirmed: [], shipped: [], delivered: [], cancelled: [],
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const MyOrders = () => {
  const { role }    = useUserRole();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [perspective, setPerspective] = useState(role === "seller" ? "seller" : "buyer");
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState(null); // orderId being updated

  const { data: ordersData, isLoading, refetch } = useOrders({ perspective, status: statusFilter });
  const orders = ordersData?.data || [];
  const container = useRef(null);

  useGSAP(() => {
    if (!isLoading) {
      gsap.from(".order-row", {
        y: 24, opacity: 0, stagger: 0.06, duration: 0.65, ease: "expo.out",
      });
    }
  }, [isLoading, perspective, statusFilter]);

  /* ── Status update ── */
  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await axiosSecure.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tracking", orderId] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  }, [axiosSecure, queryClient]);

  /* ── Delete (admin) ── */
  const handleDelete = useCallback(async (orderId) => {
    if (!window.confirm("Permanently delete this order?")) return;
    try {
      await axiosSecure.delete(`/orders/${orderId}`);
      toast.success("Order deleted");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch {
      toast.error("Delete failed");
    }
  }, [axiosSecure, queryClient]);

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === "pending").length,
    shipped:   orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  return (
    <div ref={container} style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{
            fontFamily: "'Georgia', serif",
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 900, fontStyle: "italic",
            letterSpacing: "-0.03em", color: "var(--foreground)", marginBottom: 4,
          }}>
            {perspective === "seller" ? "Sales Pipeline" : "My Purchases"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 500 }}>
            {ordersData?.totalCount || 0} order{(ordersData?.totalCount || 0) !== 1 ? "s" : ""} found
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Perspective toggle — sellers only */}
          {role === "seller" && (
            <div style={{
              display: "flex", padding: 4, borderRadius: 12,
              background: "var(--accent)", border: "1px solid var(--border)",
            }}>
              {["seller", "buyer"].map((p) => (
                <button key={p} onClick={() => setPerspective(p)} style={{
                  padding: "6px 16px", borderRadius: 8, border: "none",
                  background: perspective === p ? "var(--card)" : "transparent",
                  color: perspective === p ? "var(--primary)" : "var(--muted-foreground)",
                  fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: "pointer", transition: "all 0.18s",
                  boxShadow: perspective === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}>
                  {p === "seller" ? "Sales" : "Purchases"}
                </button>
              ))}
            </div>
          )}

          <button onClick={() => refetch()} style={{
            width: 38, height: 38, borderRadius: 10,
            border: "1px solid var(--border)", background: "var(--card)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--muted-foreground)", transition: "all 0.18s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
          >
            <TbRefresh size={16} />
          </button>
        </div>
      </div>

      {/* ── Stat chips ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { key: "", label: "All Orders",  icon: TbPackage,      val: counts.all       },
          { key: "pending", label: "Pending", icon: TbClockHour4, val: counts.pending   },
          { key: "shipped", label: "In Transit", icon: TbTruckDelivery, val: counts.shipped  },
          { key: "delivered", label: "Delivered", icon: TbCheckupList, val: counts.delivered },
        ].map(({ key, label, icon: Icon, val }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 16px", borderRadius: 12, cursor: "pointer",
              border: statusFilter === key ? "1px solid var(--primary)" : "1px solid var(--border)",
              background: statusFilter === key ? "var(--secondary)" : "var(--card)",
              color: statusFilter === key ? "var(--primary)" : "var(--muted-foreground)",
              transition: "all 0.18s",
            }}
          >
            <Icon size={14} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>{label}</span>
            <span style={{
              padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 900,
              background: statusFilter === key ? "var(--primary)" : "var(--accent)",
              color: statusFilter === key ? "var(--primary-foreground)" : "var(--foreground)",
            }}>
              {val}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div style={{ display: "grid", gap: 10 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              height: 88, borderRadius: 18, border: "1px solid var(--border)",
              background: "var(--card)", animation: "mo-shimmer 1.4s ease-in-out infinite",
            }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          padding: "64px 24px", textAlign: "center",
          borderRadius: 20, border: "1px dashed var(--border)", background: "var(--card)",
        }}>
          <TbLeaf size={36} style={{ color: "var(--primary)", opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontFamily: "'Georgia', serif", fontSize: 18, fontWeight: 900, fontStyle: "italic", color: "var(--foreground)", marginBottom: 6 }}>
            No orders found
          </p>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 500 }}>
            {statusFilter ? `No ${statusFilter} orders right now` : "You haven't placed any orders yet"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              perspective={perspective}
              role={role}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              isUpdating={updating === order._id}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes mo-shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ORDER ROW
───────────────────────────────────────────── */
const OrderRow = ({ order, perspective, role, onStatusChange, onDelete, isUpdating }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending;

  const isSeller = perspective === "seller";
  const isAdmin  = role === "admin";
  const nextStatuses = isAdmin
    ? Object.keys(STATUS_CFG).filter(s => s !== order.status && s !== "pending")
    : isSeller
    ? (SELLER_NEXT[order.status] || [])
    : (BUYER_NEXT[order.status]  || []);

  const canDelete   = isAdmin;
  const hasActions  = nextStatuses.length > 0 || canDelete;

  return (
    <div
      className="order-row"
      style={{
        borderRadius: 18, border: "1px solid var(--border)",
        // background: "var(--card)", overflow: "hidden",
        transition: "border-color 0.22s, box-shadow 0.22s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.boxShadow = `0 4px 20px ${cfg.color}18`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Colored top accent line */}
      <div style={{ height: 3, background: cfg.color, opacity: 0.6 }} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto auto",
        alignItems: "center",
        gap: 16, padding: "14px 18px",
      }} className="order-inner-grid">

        {/* Image */}
        <img
          src={order.plantImage} alt={order.plantName}
          style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }}
        />

        {/* Main info */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <h3 style={{
              fontFamily: "'Georgia', serif", fontSize: 15, fontWeight: 900, fontStyle: "italic",
              color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {order.plantName}
            </h3>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-foreground)", background: "var(--accent)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 5 }}>
              {order.plantCategory}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
              {isSeller ? `👤 ${order.customer.name}` : `🌿 ${order.seller.name}`}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
              Qty: {order.quantity}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Price */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 2 }}>Total</p>
          <p style={{ fontFamily: "'Georgia', serif", fontSize: 18, fontWeight: 900, color: "var(--foreground)", lineHeight: 1 }}>
            ৳{order.totalPrice.toLocaleString()}
          </p>
        </div>

        {/* Status badge */}
        <div style={{ flexShrink: 0 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 999,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
            {cfg.label}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* Track button */}
          <Link
            to={`/orders/track/${order._id}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              height: 34, padding: "0 12px", borderRadius: 9,
              border: "1px solid var(--border)", background: "var(--accent)",
              color: "var(--muted-foreground)", fontSize: 11, fontWeight: 700,
              textDecoration: "none", transition: "all 0.15s", whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.background = "var(--secondary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted-foreground)"; e.currentTarget.style.background = "var(--accent)"; }}
          >
            <TbMapPin size={13} />
            <span className="hidden sm:inline">Track</span>
          </Link>

          {/* Status / delete menu */}
          {hasActions && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  height: 34, padding: "0 10px", borderRadius: 9,
                  border: "1px solid var(--border)", background: "var(--card)",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                  color: "var(--muted-foreground)", fontSize: 11, fontWeight: 700,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
              >
                {isUpdating ? <TbLoader2 size={14} style={{ animation: "mo-spin 0.8s linear infinite" }} /> : <TbChevronDown size={14} />}
                <span className="hidden sm:inline">Actions</span>
              </button>

              {menuOpen && (
                <>
                  {/* Click outside close */}
                  <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setMenuOpen(false)} />
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0,
                    minWidth: 180, borderRadius: 14, zIndex: 100,
                    background: "var(--card)", border: "1px solid var(--border)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden",
                    padding: 6,
                  }}>
                    {nextStatuses.length > 0 && (
                      <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-foreground)", padding: "4px 8px 6px" }}>
                        Move to
                      </p>
                    )}
                    {nextStatuses.map((ns) => {
                      const nsCfg = STATUS_CFG[ns];
                      return (
                        <button key={ns} onClick={() => { setMenuOpen(false); onStatusChange(order._id, ns); }} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 9,
                          padding: "9px 10px", borderRadius: 9, border: "none",
                          background: "transparent", cursor: "pointer",
                          fontSize: 13, fontWeight: 700, color: nsCfg.color,
                          textAlign: "left", transition: "background 0.15s",
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.background = nsCfg.bg}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: nsCfg.color, flexShrink: 0 }} />
                          {nsCfg.label}
                        </button>
                      );
                    })}

                    {canDelete && (
                      <>
                        {nextStatuses.length > 0 && <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />}
                        <button onClick={() => { setMenuOpen(false); onDelete(order._id); }} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 9,
                          padding: "9px 10px", borderRadius: 9, border: "none",
                          background: "transparent", cursor: "pointer",
                          fontSize: 13, fontWeight: 700, color: "oklch(0.48 0.15 25)",
                          textAlign: "left", transition: "background 0.15s",
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "oklch(0.97 0.03 25)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <TbTrash size={14} /> Delete Order
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-only: delivery address */}
      <div className="mo-mobile-addr" style={{ padding: "0 18px 12px", display: "flex", alignItems: "center", gap: 6 }}>
        <TbMapPin size={12} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {order.delivery.address}{order.delivery.area ? `, ${order.delivery.area}` : ""}
        </span>
      </div>

      <style>{`
        @keyframes mo-spin  { to { transform: rotate(360deg); } }
        @media (min-width: 768px) { .mo-mobile-addr { display: none !important; } }
        @media (max-width: 640px) {
          .order-inner-grid {
            grid-template-columns: auto 1fr !important;
            grid-template-rows: auto auto auto !important;
          }
          .order-inner-grid > *:nth-child(3),
          .order-inner-grid > *:nth-child(4),
          .order-inner-grid > *:nth-child(5) {
            grid-column: 1 / -1;
            display: flex; justify-content: space-between; align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;