import { Outlet, NavLink, Link, useLocation } from "react-router";
import { useMemo, useRef, useEffect } from "react";
import {
  MdOutlineAnalytics,
  MdAddBox,
  MdHome,
  MdAccountCircle,
  MdOutlineInventory2,
  MdManageAccounts,
  MdLogout,
} from "react-icons/md";
import { TbLeaf, TbLayoutDashboard } from "react-icons/tb";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import LuminousLogo from "../components/Shared/LuminousLogo/LuminousLogo";
import useUserRole from "@/hooks/useUserRole";
import useAuth from "@/hooks/useAuth";

const DashboardLayout = () => {
  const { user, logOut } = useAuth();
  const { role, isRoleLoading } = useUserRole();
  const location = useLocation();
  const container = useRef();
  const outletRef = useRef();

  // --- 1. INTELLIGENT HEADER LOGIC ---
  const getHeaderTitle = (path) => {
    if (path.includes("/update-plant/")) return "Refine Specimen";
    if (path === "/dashboard") return "Intelligence Overview";
    const segments = path.split("/");
    const last = segments[segments.length - 1];
    return last.replace(/-/g, " ");
  };

  // --- 2. PREMIUM ENTRANCE ANIMATIONS ---
  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.from(".sidebar-anim", {
        x: -50,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "expo.out",
      });
      tl.from(
        ".header-anim",
        {
          y: -20,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.8",
      );
    },
    { scope: container },
  );

  // --- 3. SEAMLESS PAGE TRANSITIONS ---
  useEffect(() => {
    gsap.fromTo(
      outletRef.current,
      { opacity: 0, y: 20, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "back.out(1.2)",
      },
    );
  }, [location.pathname]);

  const navigation = useMemo(() => {
    if (isRoleLoading) return [];
    const common = [
      { label: "Overview", to: "/dashboard", icon: TbLayoutDashboard },
      { label: "Statistics", to: "/dashboard/stats", icon: MdOutlineAnalytics },
      { label: "Profile", to: "/dashboard/profile", icon: MdAccountCircle },
    ];  
    const sellerLinks = [
      { label: "New Specimen", to: "/dashboard/add-plant", icon: MdAddBox },
      {
        label: "Inventory",
        to: "/dashboard/my-plants",
        icon: MdOutlineInventory2,
      },
    ];
    const adminLinks = [
      {
        label: "User Registry",
        to: "/dashboard/manage-users",
        icon: MdManageAccounts,
      },
    ];

    if (role === "admin") return [...common, ...adminLinks];
    if (role === "seller") return [...common, ...sellerLinks];
    return common;
  }, [role, isRoleLoading]);

  return (
    <div
      ref={container}
      className="relative min-h-screen bg-[#F8FAFC] flex overflow-hidden font-sans selection:bg-emerald-500 selection:text-white"
    >
      {/* --- SIDEBAR: THE COMMAND CENTER --- */}
      <aside className="hidden lg:flex w-80 flex-col bg-white border-r border-slate-200 p-8 relative z-50">
        <div className="sidebar-anim mb-16">
          <LuminousLogo />
        </div>

        <nav className="grow space-y-3">
          {isRoleLoading ? (
            <SidebarSkeleton />
          ) : (
            navigation.map((item) => (
              <div key={item.to} className="sidebar-anim">
                <DashboardNavLink item={item} />
              </div>
            ))
          )}
        </nav>

        {/* --- USER FOOTER --- */}
        <div className="sidebar-anim mt-auto pt-8 border-t border-slate-100">
          <div className="group relative flex items-center gap-4 p-4 bg-slate-50 rounded-4xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 mb-6">
            <div className="relative">
              <img
                src={user?.photoURL}
                className="size-12 rounded-2xl object-cover ring-4 ring-white shadow-md"
                alt="avatar"
              />
              <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-900 truncate tracking-tight">
                {user?.displayName}
              </p>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                {role}
              </p>
            </div>
          </div>

          <button
            onClick={logOut}
            className="w-full flex items-center justify-between px-6 py-4 text-slate-400 hover:text-rose-500 transition-all text-[10px] font-black uppercase tracking-[0.3em] group bg-slate-50/50 rounded-2xl hover:bg-rose-50"
          >
            Terminal Exit
            <MdLogout className="size-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </aside>

      {/* --- MAIN STAGE --- */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
        {/* --- STELLAR HEADER --- */}
        <header className="header-anim sticky top-0 z-40 bg-[#F8FAFC]/80 backdrop-blur-2xl px-12 py-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600">
              <TbLeaf size={14} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                Internal System
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 capitalize italic">
              {getHeaderTitle(location.pathname)}.
            </h2>
          </div>

          <div>
            <Link
              to="/"
              className="hidden md:flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
            >
              <MdHome size={18} />
              Return Home
            </Link>
          </div>
        </header>

        {/* --- DYNAMIC CONTENT SLOT --- */}
        <div ref={outletRef} className="px-12 pb-20 max-w-400 w-full">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE NAVIGATION: THE FLOATING HUB --- */}
      <nav className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-100">
        <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] flex items-center justify-around flex-wrap ">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center p-4 transition-all duration-500",
                  isActive
                    ? "text-emerald-400 scale-125"
                    : "text-slate-500 hover:text-slate-300",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="size-6" />
                  {isActive && (
                    <span className="absolute -bottom-1 size-1 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <Link to="/" className="p-4 text-slate-500">
            <MdHome size={24} />
          </Link>
        </div>
      </nav>
    </div>
  );
};

// --- SUB-COMPONENTS: THE POLISHED DETAILS ---

const SidebarSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="h-14 w-full bg-slate-100 animate-pulse rounded-3xl"
      />
    ))}
  </div>
);

const DashboardNavLink = ({ item }) => (
  <NavLink
    to={item.to}
    end={item.to === "/dashboard"}
    className={({ isActive }) =>
      cn(
        "flex items-center justify-between px-6 py-5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 group",
        isActive
          ? "bg-slate-900 text-white shadow-2xl shadow-slate-400/40 -translate-y-1"
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-900",
      )
    }
  >
    <div className="flex items-center gap-4">
      <item.icon
        className={cn(
          "size-5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110",
        )}
      />
      {item.label}
    </div>
    <div className="size-1.5 rounded-full bg-current opacity-0 group-[.active]:opacity-100 transition-opacity" />
  </NavLink>
);

export default DashboardLayout;
