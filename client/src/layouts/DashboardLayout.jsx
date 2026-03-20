import { Outlet, NavLink, Link } from "react-router";
import { useMemo } from "react";
import {
  MdOutlineDashboardCustomize,
  MdOutlineAnalytics,
  MdAddBox,
  MdHome,
} from "react-icons/md";
import { CiCamera } from "react-icons/ci";
import { cn } from "@/lib/utils";
// import useAuth from "@/hooks/useAuth";
import LuminousLogo from "../components/Shared/LuminousLogo/LuminousLogo";

const DashboardLayout = () => {
  //   const { user } = useAuth();

  // Logic: In a real MERN app, you'd fetch 'role' from your MongoDB user object
  // For now, let's assume you'll replace this with your actual role state
  const role = "seller";

  const navigation = useMemo(() => {
    const common = [
      { label: "Stats", to: "/dashboard", icon: MdOutlineAnalytics },
      { label: "Profile", to: "/dashboard/profile", icon: CiCamera },
    ];

    const sellerLinks = [
      { label: "Add Plant", to: "/dashboard/add-plant", icon: MdAddBox },
      {
        label: "My Inventory",
        to: "/dashboard/my-plants",
        icon: MdOutlineDashboardCustomize,
      },
    ];

    const adminLinks = [
      {
        label: "Manage Users",
        to: "/dashboard/manage-users",
        icon: MdOutlineDashboardCustomize,
      },
    ];

    if (role === "admin") return [...common, ...adminLinks];
    if (role === "seller") return [...common, ...sellerLinks];
    return common;
  }, [role]);

  return (
    <div className="relative min-h-screen bg-secondary/20 flex overflow-hidden font-sans">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-72 flex-col bg-background border-r border-primary/5 p-6 space-y-8">
        <div className="flex justify-center pb-4">
          <LuminousLogo />
        </div>

        <nav className="grow space-y-2">
          {navigation.map((item) => (
            <DashboardNavLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="pt-6 border-t border-primary/5">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            <MdHome className="size-5" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-24 md:pb-0">
        {/* Header  */}
        <header className="sticky top-0 z-30 w-full bg-background/60 backdrop-blur-md border-b border-primary/5 px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-linear-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Luminous Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className=" text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
              {role}
            </span>
            {/* User Avatar could go here */}
          </div>
        </header>

        {/* Content Outlet */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION  */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-background/80 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] rounded-2xl flex items-center justify-around p-2 transition-all">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-primary",
                )
              }
            >
              <item.icon className="size-6" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {item.label.split(" ")[0]}{" "}
                {/* Shortens labels for small screens */}
              </span>
            </NavLink>
          ))}

          {/* Mobile Home Button */}
          <Link
            to="/"
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
          >
            <MdHome className="size-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              Exit
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

    
const DashboardNavLink = ({ item }) => (
  <NavLink
    to={item.to}
    end={item.to === "/dashboard"}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-2"
          : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
      )
    }
  >
    <item.icon
      className={cn("size-5 transition-transform group-hover:scale-110")}
    />
    {item.label}
  </NavLink>
);

export default DashboardLayout;
