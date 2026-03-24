/* eslint-disable react-hooks/set-state-in-effect */
import { useRef, useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { CiLogout, CiMenuBurger, CiUser } from "react-icons/ci";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { TbLeaf, TbX } from "react-icons/tb";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
import useAuth from "@/hooks/useAuth";
import LuminousLogo from "../LuminousLogo/LuminousLogo";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Marketplace", to: "/plants" },
  { label: "About", to: "/about" },
];

const Navbar = () => {
  const { user, logOut } = useAuth();
  const location = useLocation();
  const logoutRef = useRef();
  const headerRef = useRef(null);
  const linksRef = useRef([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* close drawer on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* scroll border */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* entrance */
  useGSAP(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -64, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", delay: 0.05 },
    );
    gsap.from(linksRef.current.filter(Boolean), {
      y: -12,
      opacity: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: "expo.out",
      delay: 0.3,
    });
  }, []);

  /* dropdown entrance */
  const onDropdownOpen = (open) => {
    if (!open) return;
    setTimeout(() => {
      const el = document.querySelector('[data-slot="dropdown-menu-content"]');
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.93, y: -8, filter: "blur(6px)" },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.32,
          ease: "back.out(1.6)",
        },
      );
    }, 0);
  };

  /* logout toast */
  const handleLogout = () => {
    if (logoutRef.current) return;
    logoutRef.current = toast.custom(
      (t) => (
        <div
          className={cn(
            "flex flex-col p-6 w-80 rounded-4xl border border-primary/15 bg-white/98 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] transition-all duration-300",
            t.visible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4",
          )}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <TbLeaf size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-black text-foreground">
                Leaving the Garden?
              </p>
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.18em]">
                Confirm sign out
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                logoutRef.current = null;
                const id = toast.loading("Signing out…");
                await logOut();
                toast.success("See you next time 🌱", { id });
              }}
              className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
            >
              Sign out
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                logoutRef.current = null;
              }}
              className="flex-1 h-11 rounded-xl bg-secondary text-secondary-foreground text-[10px] font-black uppercase tracking-widest border border-border hover:bg-secondary/70 transition-all"
            >
              Stay
            </button>
          </div>
        </div>
      ),
      { position: "top-center", duration: Infinity },
    );
  };

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-300",
          scrolled
            ? "bg-background/95 border-b border-border shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
            : "bg-background/60 border-b border-transparent",
        )}
      >
        <div className="container-page">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <LuminousLogo />

            {/* ── Desktop nav — ONLY md and above ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link, idx) => (
                <NavLink
                  end
                  key={link.to}
                  to={link.to}
                  ref={(el) => (linksRef.current[idx] = el)}
                >
                  {({ isActive }) => (
                    <span
                      className={cn(
                        "inline-flex items-center px-4 py-2 rounded-xl text-[13px] transition-all duration-200 cursor-pointer select-none",
                        isActive
                          ? "bg-secondary text-primary font-black border border-border"
                          : "font-semibold text-muted-foreground hover:text-foreground hover:bg-accent",
                      )}
                    >
                      {link.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* ── Right side ── */}
            <div className="flex items-center gap-2">
              {user ? (
                /* Avatar dropdown — always visible when logged in */
                <DropdownMenu onOpenChange={onDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border border-border bg-card hover:border-primary hover:shadow-[0_0_0_3px_var(--secondary)] transition-all duration-200 cursor-pointer outline-none">
                      <span className="hidden sm:block text-[12px] font-bold text-foreground max-w-25 truncate">
                        {user.displayName?.split(" ")[0] || "Account"}
                      </span>
                      <Avatar className="h-8 w-8 border border-primary/20">
                        <AvatarImage
                          src={user.photoURL}
                          alt={user.displayName}
                        />
                        <AvatarFallback className="bg-secondary text-primary text-xs font-black">
                          {user.displayName?.[0] ?? <CiUser size={14} />}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-2xl p-2 bg-card/98 backdrop-blur-2xl border border-border shadow-2xl z-9999"
                  >
                    <DropdownMenuLabel className="px-3 py-2">
                      <p className="text-sm font-black text-foreground">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {user.email}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="opacity-50" />
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-xl focus:bg-secondary my-0.5"
                    >
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 py-2.5 px-3"
                      >
                        <MdOutlineDashboardCustomize
                          className="text-primary shrink-0"
                          size={16}
                        />
                        <span className="text-sm font-semibold">Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer rounded-xl focus:bg-destructive/10 text-destructive focus:text-destructive flex items-center gap-3 py-2.5 px-3 my-0.5"
                    >
                      <CiLogout size={16} className="shrink-0" />
                      <span className="text-sm font-semibold">Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* Logged-out buttons — desktop only */
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 rounded-xl text-[13px] font-black bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-[0_4px_14px_oklch(0.45_0.12_160/0.28)]"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* ── Hamburger — ONLY below md ── */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-card hover:border-primary transition-colors"
                aria-label="Open navigation menu"
              >
                <CiMenuBurger size={20} className="text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
};

/* ══════════════════════════════════════════
   MOBILE DRAWER
══════════════════════════════════════════ */
const MobileDrawer = ({ open, onClose, user, onLogout }) => {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;
    if (open) {
      document.body.style.overflow = "hidden";
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.22 });
      gsap.to(drawerRef.current, { x: "0%", duration: 0.38, ease: "expo.out" });
      gsap.from(".m-nav-item", {
        x: 28,
        opacity: 0,
        stagger: 0.055,
        duration: 0.38,
        ease: "expo.out",
        delay: 0.12,
      });
    } else {
      document.body.style.overflow = "";
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.18 });
      gsap.to(drawerRef.current, {
        x: "100%",
        duration: 0.28,
        ease: "expo.in",
      });
    }
  }, [open]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          opacity: 0,
        }}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(82vw, 360px)",
          background: "var(--background)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.1)",
          transform: "translateX(100%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <LuminousLogo />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-accent hover:bg-secondary transition-colors"
          >
            <TbX size={17} className="text-muted-foreground" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 flex flex-col gap-1 px-4 pt-7 pb-4 overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <NavLink
              end
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="m-nav-item block"
            >
              {({ isActive }) => (
                <div
                  className={cn(
                    "px-5 py-4 rounded-2xl text-lg transition-all border-l-4",
                    isActive
                      ? "bg-secondary text-primary font-black border-l-primary"
                      : "text-muted-foreground font-semibold border-l-transparent hover:bg-accent hover:text-foreground",
                  )}
                  style={{
                    fontFamily: isActive ? "'Georgia', serif" : "inherit",
                    fontStyle: isActive ? "italic" : "normal",
                  }}
                >
                  {link.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Auth */}
        <div className="px-4 pb-10 flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
                <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                  <AvatarImage src={user.photoURL} alt={user.displayName} />
                  <AvatarFallback className="bg-secondary text-primary text-xs font-black">
                    {user.displayName?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-black text-foreground truncate">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center justify-center gap-2 h-12 rounded-2xl border border-border bg-secondary text-secondary-foreground text-xs font-black uppercase tracking-widest hover:bg-secondary/70 transition-all"
              >
                <MdOutlineDashboardCustomize
                  size={16}
                  className="text-primary"
                />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex items-center justify-center gap-2 h-12 rounded-2xl border border-destructive/25 bg-destructive/5 text-destructive text-xs font-black uppercase tracking-widest hover:bg-destructive/10 transition-all"
              >
                <CiLogout size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center justify-center h-12 rounded-2xl border border-border bg-accent text-foreground text-sm font-bold hover:bg-secondary transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="flex items-center justify-center h-12 rounded-2xl bg-primary text-primary-foreground text-sm font-black hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_24px_oklch(0.45_0.12_160/0.3)]"
              >
                Get Started →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
