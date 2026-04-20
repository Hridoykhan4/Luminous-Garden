/* eslint-disable no-unused-vars */
import { useRef, useState } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    TbLeaf, TbArrowRight, TbBrandGithub,
    TbMail, TbMapPin, TbShieldCheck,
    TbTruckDelivery, TbCertificate,
} from "react-icons/tb";
import useAuth from "@/hooks/useAuth";
import useUserRole from "@/hooks/useUserRole";
gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const EXPLORE_LINKS = [
    { label: "All Specimens", to: "/plants" },
    { label: "Indoor Plants", to: "/plants?cat=Indoor" },
    { label: "Outdoor Plants", to: "/plants?cat=Outdoor" },
    { label: "Flowering", to: "/plants?cat=Flowering" },
    { label: "Succulents", to: "/plants?cat=Succulent" },
];

const COMPANY_LINKS = [
    { label: "About Us", to: "/about" },
    // { label: "How It Works", to: "/explore" },
];

// Role-aware links injected at runtime — see footer body
const DASHBOARD_LINKS = {
    common: [
        { label: "My Orders", to: "/dashboard/my-orders" },
        { label: "Profile", to: "/dashboard/profile" },
    ],
    seller: [
        { label: "Add Plant", to: "/dashboard/add-plant" },
        { label: "My Inventory", to: "/dashboard/my-plants" },
    ],
    admin: [
        { label: "Manage Users", to: "/dashboard/manage-users" },
        { label: "All Orders", to: "/dashboard/all-orders" },
    ],
    guest: [
        { label: "Sign In", to: "/login" },
        { label: "Get Started", to: "/signup" },
    ],
};

const TRUST_ITEMS = [
    { icon: TbShieldCheck, label: "Secure Payments", sub: "SSL · bKash · COD" },
    { icon: TbTruckDelivery, label: "Dhaka Delivery", sub: "Same-day for city orders" },
    { icon: TbCertificate, label: "Verified Growers", sub: "ID-checked nurseries" },
];

/* ─────────────────────────────────────────────
   FOOTER COMPONENT
───────────────────────────────────────────── */
const Footer = () => {
    const { user } = useAuth();
    const { role } = useUserRole();
    const footerRef = useRef(null);
    const [email, setEmail] = useState("");
    const [subDone, setSubDone] = useState(false);

    /* ── Role-aware account links ── */
    const accountLinks = user
        ? [
            ...DASHBOARD_LINKS.common,
            ...(role === "seller" ? DASHBOARD_LINKS.seller : []),
            ...(role === "admin" ? DASHBOARD_LINKS.admin : []),
            ...(!role || role === "user" ? [{ label: "Become a Seller", to: "/dashboard/be-seller" }] : []),
        ]
        : DASHBOARD_LINKS.guest;

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        // TODO: wire to your email service
        setSubDone(true);
        setEmail("");
    };

    return (
        <footer ref={footerRef} aria-label="Site footer">

            {/* ── TRUST STRIP ─────────────────────────────── */}
            <div
                style={{
                    borderTop: "1px solid var(--border)",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--secondary)",
                }}
            >
                <div className="container-page">
                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
                        {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="flex items-center gap-3 py-4 sm:px-8 first:sm:pl-0 last:sm:pr-0">
                                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                    <Icon size={16} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-foreground">{label}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── MAIN FOOTER BODY ─────────────────────────── */}
            <div
                className="bg-primary/10"

            >
                <div className="container-page section-spacing">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.6fr] gap-10 lg:gap-12">

                        {/* ── COL 1: Brand + newsletter ── */}
                        <div className="ft-col flex flex-col gap-6">
                            {/* Logo reimagined in dark context */}
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                                    <TbLeaf size={16} className="text-primary-foreground" />
                                </div>
                                <span
                                    style={{ fontFamily: "'Georgia', serif", fontSize: 18, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.03em" }}
                                    className="text-primary"
                                >
                                    Luminous Garden
                                </span>
                            </div>

                            {/* Tagline */}
                            <p style={{ fontSize: 14, lineHeight: 1.75, color: "oklch(0.72 0.04 160 / 0.65)", fontWeight: 500 }}>
                                Curated botanical specimens from verified local growers. Every plant, a living investment.
                            </p>

                            {/* Location */}
                            <div className="flex items-center gap-2">
                                <TbMapPin size={13} style={{ color: "oklch(0.65 0.14 160)", flexShrink: 0 }} />
                                <span style={{ fontSize: 12, color: "oklch(0.65 0.04 160 / 0.55)", fontWeight: 500 }}>
                                    Dhaka, Bangladesh
                                </span>
                            </div>

                            {/* Newsletter */}
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "oklch(0.65 0.14 160)", marginBottom: 10 }}>
                                    Garden dispatches
                                </p>
                                {subDone ? (
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
                                        style={{ borderColor: "oklch(0.55 0.18 160 / 0.35)", background: "oklch(0.55 0.18 160 / 0.08)" }}>
                                        <TbLeaf size={14} style={{ color: "oklch(0.70 0.18 160)" }} />
                                        <span style={{ fontSize: 12, color: "oklch(0.70 0.18 160)", fontWeight: 700 }}>
                                            You're on the list 🌿
                                        </span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubscribe} className="flex gap-2">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            style={{
                                                flex: 1, height: 40, paddingLeft: 14, paddingRight: 12,
                                                borderRadius: 12, fontSize: 13, fontWeight: 500,
                                                border: "1px solid oklch(0.32 0.03 160 / 0.6)",
                                                outline: "none",
                                                transition: "border-color 0.18s",
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = "oklch(0.55 0.18 160 / 0.7)"}
                                            onBlur={(e) => e.target.style.borderColor = "oklch(0.32 0.03 160 / 0.6)"}
                                        />
                                        <button
                                            type="submit"
                                            style={{
                                                width: 40, height: 40, borderRadius: 12, border: "none",
                                                background: "oklch(0.45 0.14 160)", cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "background 0.18s, transform 0.18s",
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.52 0.16 160)"; e.currentTarget.style.transform = "translateX(2px)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(0.45 0.14 160)"; e.currentTarget.style.transform = "translateX(0)"; }}
                                        >
                                            <TbArrowRight size={16} color="white" />
                                        </button>
                                    </form>
                                )}
                                <p style={{ fontSize: 10, color: "oklch(0.50 0.03 160)", fontWeight: 500, marginTop: 7 }}>
                                    No spam. Plant care tips & new arrivals only.
                                </p>
                            </div>
                        </div>

                        {/* ── COL 2: Explore ── */}
                        <div className="ft-col">
                            <h4 style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(0.65 0.14 160)", marginBottom: 18 }}>
                                Marketplace
                            </h4>
                            <nav className="flex flex-col gap-3">
                                {EXPLORE_LINKS.map(({ label, to }) => (
                                    <FooterLink key={label} to={to} label={label} />
                                ))}
                            </nav>
                        </div>

                        {/* ── COL 3: Company ── */}
                        <div className="ft-col">
                            <h4 style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(0.65 0.14 160)", marginBottom: 18 }}>
                                Company
                            </h4>
                            <nav className="flex flex-col gap-3">
                                {COMPANY_LINKS.map(({ label, to }) => (
                                    <FooterLink key={label} to={to} label={label} />
                                ))}
                            </nav>
                        </div>

                        {/* ── COL 4: Account (role-aware) ── */}
                        <div className="ft-col">
                            <h4 style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(0.65 0.14 160)", marginBottom: 18 }}>
                                {user ? "Your Account" : "Get Started"}
                            </h4>
                            <nav className="flex flex-col gap-3">
                                {accountLinks.map(({ label, to }) => (
                                    <FooterLink key={label} to={to} label={label} />
                                ))}
                            </nav>

                            {/* CTA block for guests */}
                            {!user && (
                                <div
                                    className="mt-6 p-4 rounded-2xl"
                                    style={{
                                        border: "1px solid oklch(0.55 0.18 160 / 0.2)",
                                        background: "oklch(0.55 0.18 160 / 0.06)",
                                    }}
                                >
                                    <p style={{
                                        fontFamily: "'Georgia', serif", fontSize: 15, fontWeight: 900,
                                        fontStyle: "italic", color: "oklch(0.92 0.02 160)",
                                        marginBottom: 6, lineHeight: 1.2,
                                    }}>
                                        Start collecting today.
                                    </p>
                                    <p style={{ fontSize: 12, color: "oklch(0.60 0.04 160 / 0.7)", fontWeight: 500, marginBottom: 14, lineHeight: 1.55 }}>
                                        Join hundreds of plant collectors across Bangladesh.
                                    </p>
                                    <Link
                                        to="/signup"
                                        className="flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-black transition-all"
                                        style={{
                                            background: "oklch(0.45 0.14 160)",
                                            color: "oklch(0.97 0.01 160)",
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "oklch(0.52 0.16 160)"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "oklch(0.45 0.14 160)"}
                                    >
                                        <TbLeaf size={14} /> Create free account
                                    </Link>
                                </div>
                            )}

                            {/* Seller-specific CTA */}
                            {user && role === "user" && (
                                <div
                                    className="mt-6 p-4 rounded-2xl"
                                    style={{
                                        border: "1px solid oklch(0.55 0.18 160 / 0.2)",
                                        background: "oklch(0.55 0.18 160 / 0.06)",
                                    }}
                                >
                                    <p style={{ fontSize: 12, color: "oklch(0.70 0.04 160 / 0.75)", fontWeight: 500, marginBottom: 10, lineHeight: 1.55 }}>
                                        Got plants to sell? Become a verified grower.
                                    </p>
                                    <Link
                                        to="/dashboard/be-seller"
                                        className="flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-black"
                                        style={{ background: "oklch(0.45 0.14 160)", color: "oklch(0.97 0.01 160)" }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "oklch(0.52 0.16 160)"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "oklch(0.45 0.14 160)"}
                                    >
                                        Apply as Seller →
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* ── BOTTOM BAR ───────────────────────────────── */}
                <div
                    className="ft-bottom"
                    style={{ borderTop: "1px solid oklch(0.22 0.02 160 / 0.7)" }}
                >
                    <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                        {/* Left: copyright */}
                        <p style={{ fontSize: 12, color: "oklch(0.42 0.03 160)", fontWeight: 500 }}>
                            © {new Date().getFullYear()} Luminous Garden. Built with care in Bangladesh.
                        </p>

                        {/* Centre: legal links */}
                        <div className="flex items-center gap-4">
                            {["Privacy Policy", "Terms of Service", "Refund Policy"].map((label) => (
                                <span
                                    key={label}
                                    style={{
                                        fontSize: 11, color: "oklch(0.42 0.03 160)", fontWeight: 500,
                                        cursor: "pointer", transition: "color 0.15s",
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = "oklch(0.65 0.14 160)"}
                                    onMouseLeave={(e) => e.currentTarget.style.color = "oklch(0.42 0.03 160)"}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>

                        {/* Right: contact + github */}
                        <div className="flex items-center gap-3">
                            <a
                                href="mailto:hello@luminousgarden.com"
                                className="flex items-center gap-1.5"
                                style={{ fontSize: 11, color: "oklch(0.42 0.03 160)", fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "oklch(0.65 0.14 160)"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "oklch(0.42 0.03 160)"}
                            >
                                <TbMail size={13} /> Contact
                            </a>
                            <a
                                href="https://github.com/Hridoykhan4"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    width: 30, height: 30, borderRadius: 8,
                                    border: "1px solid oklch(0.26 0.02 160 / 0.8)",
                                    // background: "oklch(0.18 0.02 160)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "oklch(0.42 0.03 160)", transition: "all 0.15s",
                                    textDecoration: "none",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "oklch(0.55 0.18 160 / 0.5)"; e.currentTarget.style.color = "oklch(0.65 0.14 160)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "oklch(0.26 0.02 160 / 0.8)"; e.currentTarget.style.color = "oklch(0.42 0.03 160)"; }}
                            >
                                <TbBrandGithub size={15} />
                            </a>
                        </div>
                    </div>
                </div>


            </div>
        </footer>
    );
};

/* ─────────────────────────────────────────────
   FOOTER LINK — reusable nav link
───────────────────────────────────────────── */
const FooterLink = ({ to, label }) => (
    <Link
        to={to}
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "oklch(0.60 0.04 160 / 0.75)",
            textDecoration: "none",
            transition: "color 0.18s, gap 0.18s",
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.color = "oklch(0.82 0.12 160)";
            e.currentTarget.style.gap = "10px";
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.color = "oklch(0.60 0.04 160 / 0.75)";
            e.currentTarget.style.gap = "6px";
        }}
    >
        <TbArrowRight size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
        {label}
    </Link>
);

export default Footer;