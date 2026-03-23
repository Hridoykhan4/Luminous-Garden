import { useMemo, useRef } from "react";
import { Link, NavLink } from "react-router";
import { CiLogout, CiMenuBurger, CiUser } from "react-icons/ci";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import useAuth from "@/hooks/useAuth";
import LuminousLogo from "../LuminousLogo/LuminousLogo";
import toast from "react-hot-toast";
import { TbLeaf } from "react-icons/tb";

const Navbar = () => {
  const logoutToastRef = useRef();
  const headerRef = useRef(null);
  const linksRef = useRef([]);
  const { user, logOut } = useAuth();

  const handleLogout = () => {
    if (logoutToastRef.current) return;
    logoutToastRef.current = toast.custom(
      (t) => (
        <div
          className={cn(
            "flex flex-col p-6 min-w-80 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem] border-2 border-primary/20 bg-white/95 backdrop-blur-2xl transition-all duration-500",
            t.visible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-10 opacity-0 scale-90",
          )}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
              <TbLeaf size={28} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900">
                Leaving the Garden?
              </h3>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                Session Termination
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                logoutToastRef.current = null;
                const load = toast.loading("Clearing session...");
                await logOut();
                toast.success("Safe travels, collector.", {
                  id: load,
                  icon: "🌱",
                  position: "top-left",
                });
              }}
              className="flex-1 h-14 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/25"
            >
              Confirm
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                logoutToastRef.current = null;
              }}
              className="flex-1 h-14 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest rounded-2xl border border-slate-200 hover:bg-slate-200 transition-all"
            >
              Stay
            </button>
          </div>
        </div>
      ),
      { position: "top-center", duration: Infinity },
    );
  };

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      );

      tl.from(
        linksRef.current,
        {
          y: -10,
          opacity: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.4",
      );
    },
    { scope: headerRef },
  );

  const animateDropdown = (open) => {
    if (open) {
      setTimeout(() => {
        gsap.fromTo(
          '[data-slot="dropdown-menu-content"]',
          { opacity: 0, scale: 0.9, y: -10, filter: "blur(10px)" },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.4,
            ease: "back.out(1.7)",
          },
        );
      }, 0);
    }
  };

  const navLinks = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: "Marketplace", to: "/plants" },
      { label: "About Us", to: "/about" },
    ],
    [],
  );

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-primary/5 bg-background/70 backdrop-blur-xl transition-all duration-300"
    >
      <div className="flex h-16 items-center justify-between container-page px-4 md:px-8">
        <div className="flex items-center gap-8">
          <LuminousLogo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, idx) => (
              <NavLink
                end
                key={link.to}
                to={link.to}
                ref={(el) => (linksRef.current[idx] = el)}
                className={({ isActive }) =>
                  cn(
                    "relative text-sm font-medium transition-colors hover:text-primary group",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )
                }
              >
                {link.label}

                <span
                  className={cn(
                    "absolute -bottom-5.5 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full",
                    "active-nav-indicator",
                  )}
                />
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu onOpenChange={animateDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full p-0 ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 focus-visible:ring-primary"
                >
                  <Avatar className="h-9 w-9 border border-primary/10 transition-transform hover:scale-105">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                    <AvatarFallback className="bg-primary/5">
                      <CiUser className="text-primary size-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-60 p-2 bg-white/90 z-1000 backdrop-blur-3xl"
              >
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">
                      {user?.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />

                <DropdownMenuItem
                  asChild
                  className="focus:bg-primary/5 cursor-pointer"
                >
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 py-2"
                  >
                    <MdOutlineDashboardCustomize className="text-primary size-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer flex items-center gap-3 py-2"
                >
                  <CiLogout className="size-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                asChild
                className="hover:text-primary transition-colors"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95"
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <MobileNav navLinks={navLinks} user={user} />
        </div>
      </div>
    </header>
  );
};

// 3. Extracted Mobile Component for Cleanliness
const MobileNav = ({ navLinks, user }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button
        size="icon"
        variant="ghost"
        className="md:hidden hover:bg-primary/5"
      >
        <CiMenuBurger size={24} className="text-primary" />
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-full sm:w-87.5 flex flex-col">
      <SheetHeader className="text-left border-b pb-6">
        <SheetTitle>
          <LuminousLogo />
        </SheetTitle>
        <SheetDescription className="sr-only">
          Mobile navigation menu
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-4 mt-8 grow">
        {navLinks.map((link) => (
          <NavLink
            end
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "text-2xl font-bold py-2 border-l-4 border-transparent pl-4 transition-all",
                isActive
                  ? "text-primary border-primary bg-primary/5"
                  : "text-muted-foreground",
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {!user && (
        <div className="flex flex-col  justify-center  w-1/2 mx-auto pb-5  gap-4">
          <Button
            variant="outline"
            asChild
            className="h-16 rounded-3xl font-black uppercase tracking-widest border-2"
          >
            <Link to="/login">Login</Link>
          </Button>
          <Button
            asChild
            className="h-16 rounded-3xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <Link to="/signup">Join</Link>
          </Button>
        </div>
      )}
    </SheetContent>
  </Sheet>
);

export default Navbar;
