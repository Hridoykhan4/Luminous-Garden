import { useState, useRef } from "react";
import useOrders from "@/hooks/useOrders";
import useUserRole from "@/hooks/useUserRole";
import {
  TbPackage,
  TbTruckDelivery,
  TbCheckupList,
  TbClockHour4,
  TbArrowRight,
  TbDotsVertical,
} from "react-icons/tb";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const MyOrders = () => {
  const { role } = useUserRole();
  const [perspective, setPerspective] = useState(
    role === "seller" ? "seller" : "buyer",
  );
  const { data: ordersData, isLoading } = useOrders({ perspective });
  const container = useRef();

  useGSAP(() => {
    if (!isLoading) {
      gsap.from(".order-item", {
        y: 20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: "back.out(1.7)",
      });
    }
  }, [isLoading, perspective]);

  if (isLoading)
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin size-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );

  const orders = ordersData?.data || [];

  return (
    <div ref={container} className="space-y-6 md:space-y-8 px-2 md:px-0">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-slate-900">
            {perspective === "seller" ? "Sales Pipeline" : "My Purchases"}
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Floral logistics & tracking
          </p>
        </div>

        {role === "seller" && (
          <div className="flex p-1 bg-slate-100 rounded-xl md:rounded-2xl w-full sm:w-fit border border-slate-200">
            <button
              onClick={() => setPerspective("seller")}
              className={cn(
                "flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                perspective === "seller"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-400",
              )}
            >
              As Seller
            </button>
            <button
              onClick={() => setPerspective("buyer")}
              className={cn(
                "flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                perspective === "buyer"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-400",
              )}
            >
              As Buyer
            </button>
          </div>
        )}
      </div>

      {/* ── STATS: Horizontal scroll on tiny devices ── */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar lg:grid lg:grid-cols-4 lg:overflow-visible">
        <StatCard
          label="Total"
          value={orders.length}
          icon={TbPackage}
          color="emerald"
        />
        <StatCard
          label="Pending"
          value={orders.filter((o) => o.status === "pending").length}
          icon={TbClockHour4}
          color="amber"
        />
        <StatCard
          label="Transit"
          value={orders.filter((o) => o.status === "shipped").length}
          icon={TbTruckDelivery}
          color="blue"
        />
        <StatCard
          label="Done"
          value={orders.filter((o) => o.status === "delivered").length}
          icon={TbCheckupList}
          color="slate"
        />
      </div>

      {/* ── CONTENT ── */}
      <div className="space-y-4">
        {/* Desktop Header (Hidden on Mobile) */}
        <div className="hidden md:grid grid-cols-5 px-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Plant Info
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {perspective === "seller" ? "Customer" : "Seller"}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Status
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
            Details
          </span>
        </div>

        {orders.map((order) => (
          <div
            key={order._id}
            className="order-item group bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-4 md:px-8 md:py-5 flex flex-col md:grid md:grid-cols-5 items-center gap-4 transition-all hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5"
          >
            {/* 1. Details (Mobile: Split layout) */}
            <div className="w-full flex items-center gap-4">
              <img
                src={order.plantImage}
                className="size-14 md:size-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                alt=""
              />
              <div>
                <p className="font-bold text-slate-900 text-sm md:text-base">
                  {order.plantName}
                </p>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                  QTY: {order.quantity}
                </p>
              </div>
            </div>

            {/* 2. Person (Mobile: Visible next to details) */}
            <div className="w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-start border-t border-slate-50 md:border-none pt-3 md:pt-0">
              <span className="md:hidden text-[9px] font-black uppercase text-slate-400">
                {perspective === "seller" ? "From" : "To"}
              </span>
              <p className="text-xs font-bold text-slate-700">
                {perspective === "seller"
                  ? order.customer.name
                  : order.seller.name}
              </p>
            </div>

            {/* 3. Price */}
            <div className="w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-start border-t border-slate-50 md:border-none pt-3 md:pt-0">
              <span className="md:hidden text-[9px] font-black uppercase text-slate-400">
                Cost
              </span>
              <p className="font-black text-slate-900 italic text-base md:text-lg">
                ${order.totalPrice}
              </p>
            </div>

            {/* 4. Status */}
            <div className="w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-start border-t border-slate-50 md:border-none pt-3 md:pt-0">
              <span className="md:hidden text-[9px] font-black uppercase text-slate-400">
                State
              </span>
              <StatusBadge status={order.status} />
            </div>

            {/* 5. Action (Full width button on mobile) */}
            <div className="w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t border-slate-50 md:border-none">
              <button className="w-full md:w-fit md:ml-auto flex items-center justify-center gap-2 px-4 py-3 md:p-2 rounded-xl bg-slate-900 md:bg-slate-100 text-white md:text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <span className="md:hidden text-[10px] font-black uppercase tracking-widest">
                  View Order Details
                </span>
                <TbArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="p-16 md:p-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm font-medium italic">
              Empty dimension. No orders found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };
  return (
    <div
      className={cn(
        "min-w-30 md:min-w-0 p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all",
        colors[color],
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <Icon className="size-4 md:size-6" />
        <span className="text-lg md:text-2xl font-black italic">{value}</span>
      </div>
      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-70 leading-none">
        {label}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-700 ring-amber-200",
    shipped: "bg-blue-100 text-blue-700 ring-blue-200",
    delivered: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    cancelled: "bg-rose-100 text-rose-700 ring-rose-200",
  };
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-tight ring-1 ring-inset whitespace-nowrap",
        styles[status] || styles.pending,
      )}
    >
      {status}
    </span>
  );
};

export default MyOrders;
