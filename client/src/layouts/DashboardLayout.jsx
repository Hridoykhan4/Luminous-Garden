import { Outlet, NavLink, Link, useLocation } from "react-router";
import { useMemo, useRef, useEffect } from "react";
import {
  MdAddBox,
  MdHome,
  MdAccountCircle,
  MdOutlineInventory2,
  MdManageAccounts,
  MdLogout,
  MdReceiptLong,
  MdStorefront,
} from "react-icons/md";
import { TbLeaf, TbLayoutDashboard } from "react-icons/tb";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import LuminousLogo from "../components/Shared/LuminousLogo/LuminousLogo";
import useUserRole from "@/hooks/useUserRole";
import useAuth from "@/hooks/useAuth";
import { FcStatistics } from "react-icons/fc";

/* ─────────────────────────────────────────
   NAV CONFIG (DRY + SCALABLE)
───────────────────────────────────────── */
const NAV_CONFIG = {

  customer: [
    { label: "My Orders", to: "/dashboard/my-orders", icon: MdReceiptLong },
    { label: "Become a Seller", to: "/dashboard/be-seller", icon: MdStorefront },
  ],
  seller: [
    { label: "My Orders", to: "/dashboard/my-orders", icon: MdReceiptLong },
    { label: "New Specimen", to: "/dashboard/add-plant", icon: MdAddBox },
    {
      label: "Inventory",
      to: "/dashboard/my-plants",
      icon: MdOutlineInventory2,
    },
  ],
  admin: [
    {
      label: "Statistics",
      to: "/dashboard",
      icon: FcStatistics,
    },
    {
      label: "User Registry",
      to: "/dashboard/manage-users",
      icon: MdManageAccounts,
    },
  ],
  common: [
    { label: "Profile", to: "/dashboard/profile", icon: MdAccountCircle },
  ],
};

/* ─────────────────────────────────────────
   MAIN LAYOUT
───────────────────────────────────────── */
const DashboardLayout = () => {
  const { user, logOut } = useAuth();
  const { role, isRoleLoading } = useUserRole();
  const location = useLocation();

  const containerRef = useRef(null);
  const outletRef = useRef(null);

  /* ─────────────────────────────────────────
     HEADER TITLE (SMART)
  ───────────────────────────────────────── */
  const headerTitle = useMemo(() => {
    const path = location.pathname;

    if (path.includes("/update-plant/")) return "Refine Specimen";
    if (path === "/dashboard") return "Intelligence Overview";

    return path.split("/").pop().replace(/-/g, " ");
  }, [location.pathname]);

  /* ─────────────────────────────────────────
     NAVIGATION (ROLE BASED)
  ───────────────────────────────────────── */
  const navigation = useMemo(() => {
    if (isRoleLoading) return [];

    const base = NAV_CONFIG.common;

    if (role === "admin") return [...NAV_CONFIG.admin, ...base];
    if (role === "seller") return [...base, ...NAV_CONFIG.seller];

    return [...NAV_CONFIG.customer, ...base];
  }, [role, isRoleLoading]);

  /* ─────────────────────────────────────────
     ANIMATIONS (CLEAN + SAFE)
  ───────────────────────────────────────── */
  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.from(".sidebar-item", {
        x: -40,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "expo.out",
      });

      tl.from(
        ".header-anim",
        {
          y: -20,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
        },
        "-=0.5",
      );
    },
    { scope: containerRef },
  );

  /* Page transition */
  useEffect(() => {
    if (!outletRef.current) return;

    gsap.fromTo(
      outletRef.current,
      { opacity: 0, y: 20, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "power3.out",
      },
    );
  }, [location.pathname]);

  /* ─────────────────────────────────────────
     UI
  ───────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="flex min-h-screen bg-background text-foreground overflow-hidden"
    >
      {/* ───────── SIDEBAR ───────── */}
      <aside className="hidden lg:flex w-80 flex-col bg-card border-r border-border p-8 z-50">
        <div className="sidebar-item mb-14">
          <LuminousLogo />
        </div>

        <nav className="flex-1 space-y-3">
          {isRoleLoading ? (
            <SidebarSkeleton />
          ) : (
            navigation.map((item) => (
              <div key={item.to} className="sidebar-item">
                <DashboardNavLink item={item} />
              </div>
            ))
          )}
        </nav>

        {/* USER */}
        <div className="sidebar-item mt-auto pt-6 border-t border-border">
          <UserCard user={user} role={role} />

          <button
            onClick={logOut}
            className="w-full flex items-center justify-between px-5 py-4 mt-5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition bg-accent rounded-xl"
          >
            Logout
            <MdLogout className="size-5" />
          </button>
        </div>
      </aside>

      {/* ───────── MAIN ───────── */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
        {/* HEADER */}
        <header className="header-anim sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-10 py-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <TbLeaf size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                System Core
              </span>
            </div>

            <h2 className="text-3xl font-black italic capitalize tracking-tight">
              {headerTitle}.
            </h2>
          </div>

          <Link
            to="/"
            className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider"
          >
            <MdHome size={16} />
            Home
          </Link>
        </header>

        {/* CONTENT */}
        <div ref={outletRef} className="px-10 pb-16 max-w-400 w-full">
          <Outlet />
        </div>
      </main>

      {/* ───────── MOBILE NAV ───────── */}
      <MobileNav navigation={navigation} />
    </div>
  );
};

/* ─────────────────────────────────────────
   SUB COMPONENTS
───────────────────────────────────────── */

const DashboardNavLink = ({ item }) => (
  <NavLink
    to={item.to}
    end={item.to === "/dashboard"}
    className={({ isActive }) =>
      cn(
        "flex items-center justify-between px-5 py-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all group",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )
    }
  >
    <div className="flex items-center gap-3">
      <item.icon className="size-5" />
      {item.label}
    </div>
  </NavLink>
);

const UserCard = ({ user, role }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent border border-border">
    <img
      src={user?.photoURL}
      className="size-10 rounded-lg object-cover"
      alt="avatar"
    />
    <div>
      <p className="text-sm font-bold truncate">{user?.displayName}</p>
      <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
        {role}
      </p>
    </div>
  </div>
);

const MobileNav = ({ navigation }) => (
  <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
    <div className="flex justify-around bg-card border border-border rounded-2xl py-3 shadow-xl">
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/dashboard"}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center text-xs",
              isActive ? "text-primary scale-110" : "text-muted-foreground",
            )
          }
        >
          <item.icon className="size-5" />
        </NavLink>
      ))}
      <Link to="/" className="text-muted-foreground">
        <MdHome size={20} />
      </Link>
    </div>
  </nav>
);

const SidebarSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-accent animate-pulse rounded-xl" />
    ))}
  </div>
);

export default DashboardLayout;
