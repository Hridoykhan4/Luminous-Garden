import { Outlet, NavLink, Link, useLocation } from "react-router";
import { useMemo, useRef, useEffect } from "react";
import {
  MdOutlineDashboardCustomize,
  MdOutlineAnalytics,
  MdAddBox,
  MdHome,
  MdAccountCircle,
} from "react-icons/md";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import LuminousLogo from "../components/Shared/LuminousLogo/LuminousLogo";
import useUserRole from "@/hooks/useUserRole";
import useAuth from "@/hooks/useAuth";

const DashboardLayout = () => {
  const { user } = useAuth();
  const { role, isRoleLoading } = useUserRole();
  const location = useLocation();
  const container = useRef();
  const outletRef = useRef();

  // 1. Entrance Animations
  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.from(".sidebar-anim", {
        x: -30,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: "expo.out",
      });

      tl.from(
        ".mobile-nav-anim",
        {
          y: 100,
          opacity: 0,
          duration: 1.2,
          ease: "power4.out",
        },
        0.2,
      );
    },
    { scope: container },
  );

  // 2. Page Transition Logic
  useEffect(() => {
    gsap.fromTo(
      outletRef.current,
      { opacity: 0, y: 15, filter: "blur(10px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "power3.out",
      },
    );
  }, [location.pathname]);

  const navigation = useMemo(() => {
    if (isRoleLoading) return [];
    const common = [
      { label: "Stats", to: "/dashboard", icon: MdOutlineAnalytics },
      { label: "Profile", to: "/dashboard/profile", icon: MdAccountCircle },
    ];
    const sellerLinks = [
      { label: "Add Plant", to: "/dashboard/add-plant", icon: MdAddBox },
      {
        label: "Inventory",
        to: "/dashboard/my-plants",
        icon: MdOutlineDashboardCustomize,
      },
    ];
    const adminLinks = [
      {
        label: "Users",
        to: "/dashboard/manage-users",
        icon: MdOutlineDashboardCustomize,
      },
    ];

    if (role === "admin") return [...common, ...adminLinks];
    if (role === "seller") return [...common, ...sellerLinks];
    return common;
  }, [role, isRoleLoading]);

  return (
    <div
      ref={container}
      className="relative min-h-screen bg-[#F1F5F9] flex overflow-hidden font-sans"
    >
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-72 flex-col bg-white/70 backdrop-blur-xl border-r border-slate-200 p-6 m-4 rounded-[2.5rem] shadow-sm">
        <div className="sidebar-anim mb-12 px-2">
          <LuminousLogo />
        </div>

        <nav className="grow space-y-2">
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

        <div className="sidebar-anim mt-auto pt-6">
          <div className="flex items-center gap-3 p-4 bg-white shadow-sm border border-slate-100 rounded-3xl mb-4">
            <img
              src={user?.photoURL}
              className="size-10 rounded-full ring-2 ring-primary/10"
              alt="avatar"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-800 truncate">
                {user?.displayName}
              </p>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {role}
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-5 py-3 text-slate-400 hover:text-rose-500 transition-all text-xs font-black uppercase tracking-tighter group"
          >
            <MdHome className="size-5 group-hover:-rotate-12 transition-transform" />
            Exit Garden
          </Link>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="header-anim sticky top-0 z-40 bg-[#F1F5F9]/80 backdrop-blur-md px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 capitalize italic">
            {location.pathname.split("/").pop()?.replace("-", " ") ||
              "Overview"}
          </h2>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-primary"></span>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Node Active
            </span>
          </div>
        </header>

        <div
          ref={outletRef}
          className="px-4 md:px-10 pb-32 md:pb-10 max-w-7xl w-full mx-auto"
        >
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE NAVIGATION (Hydration Fixed) --- */}
      <nav className="mobile-nav-anim md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-4xl flex items-center justify-around p-2 py-3">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center p-3 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-slate-400",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="size-6" />
                  {isActive && (
                    <span className="absolute -bottom-1 size-1.5 bg-primary rounded-full shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <Link to="/" className="p-3 text-slate-400">
            <MdHome className="size-6" />
          </Link>
        </div>
      </nav>
    </div>
  );
};

const SidebarSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-12 w-full bg-slate-200/50 animate-pulse rounded-2xl"
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
        "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-tighter transition-all duration-300 group",
        isActive
          ? "bg-primary text-white shadow-lg shadow-primary/30 -translate-y-1 scale-[1.02]"
          : "text-slate-500 hover:bg-white hover:text-primary hover:shadow-sm",
      )
    }
  >
    <item.icon className="size-5 transition-transform group-hover:rotate-6" />
    {item.label}
  </NavLink>
);

export default DashboardLayout;
