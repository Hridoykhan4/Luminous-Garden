import {  useMemo, useRef } from "react";
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
                    "relative text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )
                }
              >
                {link.label}
                {/*  indicator */}
                <span className="absolute -bottom-5.5 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary/20"
                >
                  <Avatar className="h-9 w-9 border border-primary/10">
                    <AvatarImage src={user?.photoURL} />
                    <AvatarFallback>
                      <CiUser />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 animate-in fade-in zoom-in-95 duration-200"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">{user?.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <MdOutlineDashboardCustomize className="text-primary" />{" "}
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logOut}
                  className="text-destructive flex items-center gap-2 cursor-pointer"
                >
                  <CiLogout /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                asChild
                className="hover:bg-primary/5 text-muted-foreground hover:text-primary"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu with Shadcn Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden">
                <CiMenuBurger size={24} className="text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-75 sm:w-75">
              <SheetHeader className="text-left border-b pb-4">
                <SheetTitle>
                  <LuminousLogo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-10">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        "text-xl font-semibold transition-all",
                        isActive
                          ? "text-primary translate-x-2"
                          : "text-muted-foreground hover:text-primary hover:translate-x-1",
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                {!user && (
                  <div className="flex mx-3 flex-col gap-3 pt-6 border-t">
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/signup">Join Luminous</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
