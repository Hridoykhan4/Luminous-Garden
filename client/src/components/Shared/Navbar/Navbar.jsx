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

const Navbar = () => {
  const headerRef = useRef(null);
  const linksRef = useRef([]);
  const { user, logOut } = useAuth();

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
                {/* Modern Indicator Layer */}
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

              <DropdownMenuContent align="end" className="w-60 p-2">
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
                  onClick={logOut}
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
        <div className="grid grid-cols-2 gap-4 pb-10 border-t pt-6">
          <Button variant="outline" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </SheetContent>
  </Sheet>
);

export default Navbar;
