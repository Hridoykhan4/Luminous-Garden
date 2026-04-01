import { useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbPackage, TbTruckDelivery, TbCheckupList, TbClockHour4,
  TbTrash, TbCheck, TbMapPin, TbLeaf,
  TbRefresh, TbLoader2, TbX,
} from "react-icons/tb";
import useOrders from "@/hooks/useOrders";
import useUserRole from "@/hooks/useUserRole";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";


const S = {
  pending: { label: "Pending", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-400" },
  confirmed: { label: "Confirmed", dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 border-blue-200", bar: "bg-blue-400" },
  shipped: { label: "In Transit", dot: "bg-indigo-400", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", bar: "bg-indigo-400" },
  delivered: { label: "Delivered", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-400" },
  cancelled: { label: "Cancelled", dot: "bg-rose-400", badge: "bg-rose-50 text-rose-700 border-rose-200", bar: "bg-rose-400" },
};

const NEXT = {
  seller: {
    pending: [{ status: "confirmed", label: "Confirm Order", icon: TbCheck },
    { status: "cancelled", label: "Cancel Order", icon: TbX, danger: true }],
    confirmed: [{ status: "shipped", label: "Mark as Shipped", icon: TbTruckDelivery }],
    shipped: [{ status: "delivered", label: "Mark Delivered", icon: TbCheckupList }],
    delivered: [],
    cancelled: [],
  },
  buyer: {
    pending: [{ status: "cancelled", label: "Cancel Order", icon: TbX, danger: true }],
    confirmed: [],
    shipped: [],
    delivered: [],
    cancelled: [],
  },
};

const TERMINAL = ["delivered", "cancelled"];

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const MyOrders = () => {
  const { role } = useUserRole();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const container = useRef(null);

  const [perspective, setPerspective] = useState(role === "seller" ? "seller" : "customer");
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState(null);

  const { data: ordersData, isLoading, refetch } = useOrders({ perspective, status: statusFilter });
  const orders = ordersData?.data || [];

  // ─────────────────────────────────────────────
  // THE FIX: Kill stale tweens → hard-reset opacity
  // → animate → clearProps so GSAP leaves no
  // inline style residue on any element.
  // ─────────────────────────────────────────────
  useGSAP(() => {
    if (isLoading || !orders.length) return;

    // 1. Kill any in-flight tweens targeting .order-row
    gsap.killTweensOf(".order-row");

    // 2. Hard-reset ALL rows to visible so interrupted
    //    rows are never left at opacity < 1
    gsap.set(".order-row", { opacity: 1, y: 0, clearProps: "all" });

    // 3. Now animate fresh — clearProps removes inline
    //    style once the tween finishes
    gsap.from(".order-row", {
      y: 20,
      opacity: 0,
      stagger: 0.055,
      duration: 0.65,
      ease: "expo.out",
      clearProps: "opacity,transform", // ← crucial: clean up when done
    });
  }, { scope: container, dependencies: [isLoading, perspective, statusFilter, orders.length] });

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    setUpdating(orderId + newStatus);
    try {
      await axiosSecure.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(newStatus === "cancelled" ? "Order cancelled" : `Marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tracking", orderId] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  }, [axiosSecure, queryClient]);

  const handleDelete = useCallback(async (orderId) => {
    if (!window.confirm("Permanently delete this order? This cannot be undone.")) return;
    try {
      await axiosSecure.delete(`/orders/${orderId}`);
      toast.success("Order deleted");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  }, [axiosSecure, queryClient]);

  const allOrders = ordersData?.data || [];
  const cnt = {
    all: ordersData?.totalCount || 0,
    pending: allOrders.filter(o => o.status === "pending").length,
    shipped: allOrders.filter(o => o.status === "shipped").length,
    delivered: allOrders.filter(o => o.status === "delivered").length,
    cancelled: allOrders.filter(o => o.status === "cancelled").length,
  };

  return (
    <div ref={container} className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="font-black italic tracking-tight text-foreground"
            style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}
          >
            {perspective === "seller" ? "Sales Pipeline" : "My Orders"}
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {ordersData?.totalCount || 0} total orders
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {role === "seller" && (
            <div className="flex p-1 rounded-xl bg-accent border border-border">
              {["seller", "customer"].map((p) => (
                <button
                  key={p}
                  onClick={() => { setPerspective(p); setStatusFilter(""); }}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    perspective === p
                      ? "bg-card text-primary shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p === "seller" ? "My Sales" : "My Purchases"}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => refetch()}
            className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
          >
            <TbRefresh size={15} />
          </button>
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "", label: "All", icon: TbPackage, val: cnt.all },
          { key: "pending", label: "Pending", icon: TbClockHour4, val: cnt.pending },
          { key: "shipped", label: "In Transit", icon: TbTruckDelivery, val: cnt.shipped },
          { key: "delivered", label: "Delivered", icon: TbCheckupList, val: cnt.delivered },
          { key: "cancelled", label: "Cancelled", icon: TbX, val: cnt.cancelled },
        // eslint-disable-next-line no-unused-vars
        ].map(({ key, label, icon: Icon, val }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-700 border transition-all",
              statusFilter === key
                ? "bg-secondary border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80",
            )}
          >
            <Icon size={13} />
            <span className="font-semibold">{label}</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-black",
              statusFilter === key ? "bg-primary text-primary-foreground" : "bg-accent text-foreground",
            )}>
              {val}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState filter={statusFilter} perspective={perspective} />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              perspective={perspective}
              role={role}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   ORDER ROW
───────────────────────────────────────────── */
const OrderRow = ({ order, perspective, role, onStatusChange, onDelete, updating }) => {
  const cfg = S[order.status] || S.pending;
  const isSeller = perspective === "seller";
  const isAdmin = role === "admin";
  const isTerminal = TERMINAL.includes(order.status);

  const actions = isAdmin ? [] : (NEXT[isSeller ? "seller" : "buyer"]?.[order.status] || []);
  const canDelete = isAdmin && order.status !== "delivered";

  return (
    <div className={cn(
      "order-row rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200",
      "hover:shadow-md hover:border-border/60",
    )}>
      {/* Status colour bar */}
      <div className={cn("h-0.75", cfg.bar)} />

      {/* ── Desktop ── */}
      <div
        className="hidden sm:grid items-center gap-4 px-5 py-4"
        style={{ gridTemplateColumns: "52px 1fr 120px 130px 160px" }}
      >
        <img
          src={order.plantImage} alt={order.plantName}
          className="w-13 h-13 rounded-xl object-cover border border-border shrink-0"
        />

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3
              className="text-sm font-black italic text-foreground truncate"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {order.plantName}
            </h3>
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-accent border border-border text-muted-foreground shrink-0">
              {order.plantCategory}
            </span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground font-semibold">
              {isSeller ? `👤 ${order.customer.name}` : `🌿 ${order.seller.name}`}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">Qty: {order.quantity}</span>
            <span className="text-xs text-muted-foreground font-semibold">
              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            {order.payment?.method === "cod" && !isTerminal && (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700">COD</span>
            )}
            {order.payment?.status === "paid" && (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">Paid ✓</span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-0.5">Total</p>
          <p className="text-lg font-black text-foreground leading-none" style={{ fontFamily: "'Georgia', serif" }}>
            ৳{order.totalPrice.toLocaleString()}
          </p>
        </div>

        <div>
          <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap",
            cfg.badge,
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot,
              order.status === "shipped" && "animate-pulse"
            )} />
            {cfg.label}
          </span>
        </div>

        <ActionButtons
          order={order}
          actions={actions}
          canDelete={canDelete}
          isAdmin={isAdmin}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          updating={updating}
          isTerminal={isTerminal}
        />
      </div>

      {/* ── Mobile ── */}
      <div className="sm:hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <img
            src={order.plantImage} alt={order.plantName}
            className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black italic text-foreground truncate" style={{ fontFamily: "'Georgia', serif" }}>
              {order.plantName}
            </h3>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              {isSeller ? order.customer.name : order.seller.name}
            </p>
          </div>
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0",
            cfg.badge,
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-semibold">Qty: {order.quantity}</span>
            <span className="text-xs text-muted-foreground font-semibold">
              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
            {order.payment?.status === "paid" && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">Paid ✓</span>
            )}
          </div>
          <p className="text-base font-black text-foreground" style={{ fontFamily: "'Georgia', serif" }}>
            ৳{order.totalPrice.toLocaleString()}
          </p>
        </div>

        {order.delivery?.address && (
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
            <TbMapPin size={12} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-medium truncate">
              {order.delivery.address}{order.delivery.area ? `, ${order.delivery.area}` : ""}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
          <Link
            to={`/orders/track/${order._id}`}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-accent text-muted-foreground text-[11px] font-bold hover:text-primary hover:border-primary transition-all"
          >
            <TbMapPin size={13} /> Track
          </Link>

          {actions.map((action) => (
            <ActionBtn
              key={action.status}
              action={action}
              orderId={order._id}
              onStatusChange={onStatusChange}
              updating={updating}
            />
          ))}

          {canDelete && (
            <button
              onClick={() => onDelete(order._id)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-[11px] font-bold hover:bg-rose-100 transition-all"
            >
              <TbTrash size={13} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ACTION BUTTONS (desktop)
───────────────────────────────────────────── */
const ActionButtons = ({ order, actions, canDelete, isAdmin, onStatusChange, onDelete, updating, isTerminal }) => (
  <div className="flex items-center gap-2 justify-end flex-wrap">
    <Link
      to={`/orders/track/${order._id}`}
      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-accent text-muted-foreground text-[11px] font-semibold hover:text-primary hover:border-primary hover:bg-secondary transition-all whitespace-nowrap"
    >
      <TbMapPin size={12} />
      <span>Track</span>
    </Link>

    {actions.map((action) => (
      <ActionBtn
        key={action.status}
        action={action}
        orderId={order._id}
        onStatusChange={onStatusChange}
        updating={updating}
      />
    ))}

    {canDelete && (
      <button
        onClick={() => onDelete(order._id)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-[11px] font-bold hover:bg-rose-100 active:scale-95 transition-all whitespace-nowrap"
      >
        <TbTrash size={12} />
        <span>Delete</span>
      </button>
    )}

    {isTerminal && !isAdmin && (
      <span className="text-[10px] text-muted-foreground font-semibold italic">
        {order.status === "delivered" ? "Completed ✓" : "Cancelled"}
      </span>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   SINGLE ACTION BUTTON
───────────────────────────────────────────── */
const ActionBtn = ({ action, orderId, onStatusChange, updating }) => {
  const { status, label, icon: Icon, danger } = action;
  const isLoading = updating === orderId + status;

  return (
    <button
      onClick={() => onStatusChange(orderId, status)}
      disabled={!!updating}
      className={cn(
        "flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold border transition-all active:scale-95 whitespace-nowrap",
        danger
          ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white hover:border-rose-500"
          : "border-primary/30 bg-secondary text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary",
        !!updating && "opacity-50 cursor-not-allowed",
      )}
    >
      {isLoading ? <TbLoader2 size={12} className="animate-spin" /> : <Icon size={12} />}
      <span>{label}</span>
    </button>
  );
};

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
const EmptyState = ({ filter, perspective }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-dashed border-border bg-card">
    <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
      <TbLeaf size={28} className="text-primary opacity-40" />
    </div>
    <h3 className="font-black italic text-foreground mb-2" style={{ fontFamily: "'Georgia', serif", fontSize: 20 }}>
      {filter ? `No ${filter} orders` : "No orders yet"}
    </h3>
    <p className="text-sm text-muted-foreground font-medium max-w-xs">
      {perspective === "seller"
        ? "When customers order your plants, they'll appear here."
        : filter
          ? `You have no ${filter} orders right now.`
          : "Browse the marketplace and place your first order."}
    </p>
    {!filter && perspective !== "seller" && (
      <Link
        to="/plants"
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all"
      >
        Browse Plants →
      </Link>
    )}
  </div>
);

export default MyOrders;