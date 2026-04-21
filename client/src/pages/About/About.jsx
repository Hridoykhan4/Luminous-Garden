/* eslint-disable no-unused-vars */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router";
import {
    TbLeaf, TbServer, TbShieldLock, TbTruckDelivery,
    TbCreditCard, TbDatabase, TbApi, TbBrandGithub,
    TbArrowRight, TbCode, TbUsers, TbPackage,
    TbMapPin, TbMail,
} from "react-icons/tb";
import {
    SiReact, SiNodedotjs, SiMongodb, SiExpress,
    SiFirebase, SiStripe, SiTailwindcss, SiJsonwebtokens,
} from "react-icons/si";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ─── */
const TECH_STACK = [
    { icon: SiReact, label: "React 19", color: "#61DAFB", side: "Frontend" },
    { icon: SiTailwindcss, label: "Tailwind CSS 4", color: "#06B6D4", side: "Frontend" },
    { icon: SiFirebase, label: "Firebase Auth", color: "#FFCA28", side: "Frontend" },
    { icon: SiNodedotjs, label: "Node.js", color: "#68A063", side: "Backend" },
    { icon: SiExpress, label: "Express 5", color: "#888888", side: "Backend" },
    { icon: SiMongodb, label: "MongoDB", color: "#4DB33D", side: "Backend" },
    { icon: SiStripe, label: "Stripe", color: "#635BFF", side: "Payments" },
    { icon: SiJsonwebtokens, label: "JWT + Cookies", color: "#F7AB2A", side: "Auth" },
];

const HOW_IT_WORKS = [
    {
        step: "01",
        icon: TbUsers,
        title: "Create Your Account",
        body: "Sign up as a Collector or Seller. Firebase handles authentication securely — verified in under 60 seconds. JWT tokens are stored as httpOnly cookies, never exposed to client-side scripts.",
        accent: "oklch(0.42 0.14 160)",
        tint: "oklch(0.94 0.04 160)",
    },
    {
        step: "02",
        icon: TbLeaf,
        title: "Browse the Vault",
        body: "Explore hundreds of verified botanical specimens. Real-time stock counts, high-res imagery, full provenance. Every listing passes seller verification before going live.",
        accent: "oklch(0.38 0.10 220)",
        tint: "oklch(0.94 0.03 220)",
    },
    {
        step: "03",
        icon: TbCreditCard,
        title: "Secure Checkout",
        body: "Pay your way — Cash on Delivery, Stripe card payment, or SSLCommerz. Every transaction is atomic: stock is reserved the moment you confirm, eliminating any chance of overselling.",
        accent: "oklch(0.44 0.12 280)",
        tint: "oklch(0.95 0.03 280)",
    },
    {
        step: "04",
        icon: TbTruckDelivery,
        title: "Track Your Delivery",
        body: "Live order tracking powered by OpenStreetMap. Every status change — confirmed, shipped, delivered — is logged in real-time. You always know exactly where your plant is.",
        accent: "oklch(0.44 0.12 55)",
        tint: "oklch(0.95 0.04 55)",
    },
];

const FEATURES = [
    { icon: TbShieldLock, label: "Role-based access", sub: "Customer · Seller · Admin — each with strict permission boundaries" },
    { icon: TbDatabase, label: "Atomic inventory", sub: "Stock reserved on order creation — zero overselling, guaranteed" },
    { icon: TbApi, label: "RESTful API", sub: "Express 5 with async handlers, Zod validation on every endpoint" },
    { icon: TbPackage, label: "Order lifecycle", sub: "Full pipeline from placement → confirmation → shipping → delivery" },
    { icon: TbMapPin, label: "Nationwide delivery", sub: "Coverage across all 64 districts of Bangladesh with geocoding" },
    { icon: TbCode, label: "Clean architecture", sub: "Controller → Service → Repository pattern, maintainable at scale" },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const About = () => {
    const pageRef = useRef(null);

    useGSAP(() => {
        gsap.set([".ab-hero-line", ".ab-hero-sub", ".ab-chip"], { clearProps: "all" });

        /* Hero entrance */
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(".ab-hero-eyebrow", { y: 16, opacity: 0, duration: 0.8 }, 0)
            .from(".ab-hero-line", { yPercent: 110, opacity: 0, stagger: 0.12, duration: 1.0 }, 0.1)
            .from(".ab-hero-sub", { y: 16, opacity: 0, duration: 0.8 }, 0.55)
            .from(".ab-hero-cta", { y: 12, opacity: 0, duration: 0.7 }, 0.7);

        /* Scroll-triggered sections */
        const scrollSections = [
            { selector: ".ab-stack-item", stagger: 0.055 },
            { selector: ".ab-step", stagger: 0.1 },
            { selector: ".ab-feature", stagger: 0.08 },
            { selector: ".ab-dev-card", stagger: 0 },
        ];

        scrollSections.forEach(({ selector, stagger }) => {
            gsap.set(selector, { clearProps: "all" });
            ScrollTrigger.create({
                trigger: selector,
                start: "top 92%",
                once: true,
                onEnter: () =>
                    gsap.fromTo(selector,
                        { y: 32, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.75, stagger, ease: "expo.out", clearProps: "transform,opacity" }
                    ),
            });
        });
    }, { scope: pageRef });

    return (
        <main ref={pageRef} className="relative bg-background overflow-x-hidden">

            {/* ── Ambient blobs ── */}
            <div className="fixed top-0 right-0 pointer-events-none -z-10 rounded-full"
                style={{ width: 500, height: 500, background: "radial-gradient(circle, oklch(0.88 0.06 160 / 0.22) 0%, transparent 70%)", filter: "blur(90px)" }}
                aria-hidden />
            <div className="fixed pointer-events-none -z-10 rounded-full"
                style={{ top: "30%", left: 0, width: 380, height: 380, background: "radial-gradient(circle, oklch(0.90 0.05 180 / 0.16) 0%, transparent 70%)", filter: "blur(80px)" }}
                aria-hidden />

            {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
            <section className="section-spacing pt-20 md:pt-28"
                style={{
                    background: [
                        "radial-gradient(ellipse 68% 58% at 76% 28%, oklch(0.87 0.07 160 / 0.4) 0%, transparent 62%)",
                        "radial-gradient(ellipse 48% 65% at 8% 82%,  oklch(0.90 0.05 155 / 0.28) 0%, transparent 58%)",
                    ].join(","),
                }}>

                {/* Grain */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.018]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px 128px" }}
                    aria-hidden />

                <div className="container-page relative z-10">
                    {/* Eyebrow */}
                    <div className="ab-hero-eyebrow mb-6">
                        <span className="inline-flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-border bg-card shadow-sm">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.2em]">
                                <span className="w-1.5 h-1.5 rounded-full bg-current" style={{ animation: "ab-blink 2s ease-in-out infinite" }} />
                                Open Platform
                            </span>
                            <span className="text-[11px] font-semibold text-muted-foreground">Bangladesh's Botanical Marketplace</span>
                        </span>
                    </div>

                    {/* Headline */}
                    <div className="mb-8 max-w-4xl">
                        <div style={{ overflow: "hidden", lineHeight: 0.88, marginBottom: 4 }}>
                            <h1 className="ab-hero-line font-black tracking-tighter text-foreground"
                                style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: "clamp(3rem,8vw,7rem)", letterSpacing: "-0.045em", display: "block" }}>
                                Growing a
                            </h1>
                        </div>
                        <div style={{ overflow: "hidden", lineHeight: 0.88, marginBottom: 4 }}>
                            <h1 className="ab-hero-line font-black tracking-tighter"
                                style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: "clamp(3rem,8vw,7rem)", letterSpacing: "-0.04em", display: "block", fontStyle: "italic", fontWeight: 300, background: "linear-gradient(135deg, var(--primary) 0%, oklch(0.52 0.18 148) 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                                living economy.
                            </h1>
                        </div>
                    </div>

                    <p className="ab-hero-sub text-muted-foreground font-medium leading-relaxed mb-10 max-w-xl"
                        style={{ fontSize: "clamp(15px,1.8vw,17px)", borderLeft: "2px solid var(--border)", paddingLeft: 14 }}>
                        Luminous Garden connects rare plant collectors with verified local growers across Bangladesh — built on a full-stack platform engineered for trust, speed, and scale.
                    </p>

                    <div className="ab-hero-cta flex items-center gap-4 flex-wrap">
                        <Link to="/plants"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-primary-foreground transition-all hover:-translate-y-0.5"
                            style={{ background: "var(--primary)", boxShadow: "0 4px 20px oklch(0.45 0.12 160 / 0.28)" }}>
                            Browse Vault <TbArrowRight size={15} />
                        </Link>
                        <a href="#how-it-works"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-foreground border border-border bg-card hover:bg-secondary transition-all">
                            How it works
                        </a>
                    </div>
                </div>
            </section>

            <div className="container-page">

                {/* ══════════════════════════════════════
            TECH STACK
        ══════════════════════════════════════ */}
                <section className="section-spacing">
                    <div className="mb-10">
                        <div style={{ overflow: "hidden" }}>
                            <h2 className="title-gradient font-black tracking-tighter text-5xl md:text-6xl"
                                style={{ fontFamily: "'Georgia',serif", letterSpacing: "-0.04em", fontStyle: "italic", fontWeight: 300 }}>
                                Built to last.
                            </h2>
                        </div>
                        <p className="text-muted-foreground font-medium mt-3 max-w-lg text-sm leading-relaxed">
                            Every layer of the stack chosen for performance, security, and developer experience — from UI to database.
                        </p>
                    </div>

                    {/* Stack grid — grouped by side */}
                    {["Frontend", "Backend", "Payments", "Auth"].map(group => {
                        const items = TECH_STACK.filter(t => t.side === group);
                        return (
                            <div key={group} className="mb-8">
                                <p className="text-detail mb-3">{group}</p>
                                <div className="flex flex-wrap gap-3">
                                    {items.map(({ icon: Icon, label, color }) => (
                                        <div key={label} className="ab-stack-item vault-card flex items-center gap-3 px-4 py-3 rounded-2xl! cursor-default group"
                                            style={{ "--hover-color": color }}>
                                            <Icon size={18} style={{ color, flexShrink: 0 }} />
                                            <span className="text-sm font-bold text-foreground">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* ══════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════ */}
                <section id="how-it-works" className="section-spacing">
                    <div className="mb-12">
                        <h2 className="title-gradient font-black tracking-tighter text-5xl md:text-6xl mb-3"
                            style={{ fontFamily: "'Georgia',serif", letterSpacing: "-0.04em" }}>
                            How it works.
                        </h2>
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-lg">
                            From first visit to delivered plant — four steps, zero friction.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {HOW_IT_WORKS.map(({ step, icon: Icon, title, body, accent, tint }) => (
                            <div key={step} className="ab-step vault-card relative overflow-hidden rounded-3xl! p-7 cursor-default group">
                                {/* Top rule */}
                                <div className="absolute top-0 left-6 right-6 rounded-b"
                                    style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }} />

                                {/* Number watermark */}
                                <span className="absolute top-4 right-5 font-black select-none pointer-events-none leading-none"
                                    style={{ fontFamily: "'Georgia',serif", fontSize: 64, letterSpacing: "-0.04em", color: accent, opacity: 0.06 }}>
                                    {step}
                                </span>

                                {/* Icon */}
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                    style={{ background: tint, border: `1px solid ${accent}33` }}>
                                    <Icon size={20} style={{ color: accent }} />
                                </div>

                                {/* Step label */}
                                <span className="text-[9px] font-black uppercase tracking-[0.22em] mb-2 block" style={{ color: accent }}>
                                    Step {step}
                                </span>

                                <h3 className="text-base font-black tracking-tight text-foreground mb-2.5">{title}</h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════
            PLATFORM FEATURES
        ══════════════════════════════════════ */}
                <section className="section-spacing">
                    <div className="mb-12">
                        <h2 className="title-gradient font-black tracking-tighter text-5xl md:text-6xl mb-3"
                            style={{ fontFamily: "'Georgia',serif", letterSpacing: "-0.04em", fontStyle: "italic", fontWeight: 300 }}>
                            Platform features.
                        </h2>
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-lg">
                            Enterprise-grade infrastructure, built by a solo developer for the Bangladeshi market.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="ab-feature vault-card rounded-2xl! p-5 flex gap-4 cursor-default group">
                                <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                                    <Icon size={18} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-foreground mb-1">{label}</p>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════
            DEVELOPER CARD
        ══════════════════════════════════════ */}
                <section className="section-spacing pb-24">
                    <div className="mb-12">
                        <h2 className="title-gradient font-black tracking-tighter text-5xl md:text-6xl mb-3"
                            style={{ fontFamily: "'Georgia',serif", letterSpacing: "-0.04em" }}>
                            The builder.
                        </h2>
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-lg">
                            One developer. One vision. Built end-to-end.
                        </p>
                    </div>

                    <div className="ab-dev-card grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                        {/* Left — bio */}
                        <div className="vault-card rounded-3xl! p-8 relative overflow-hidden">
                            {/* Top accent */}
                            <div className="absolute top-0 left-8 right-8 rounded-b"
                                style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--primary) 40%, transparent)" }} />

                            {/* Avatar placeholder — styled initials */}
                            <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6 relative">
                                <span className="font-black text-primary text-xl" style={{ fontFamily: "'Georgia',serif" }}>LG</span>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-background"
                                    style={{ animation: "ab-blink 2.5s ease-in-out infinite" }} />
                            </div>

                            <div className="mb-2">
                                <p className="text-detail mb-1">Lead Developer</p>
                                <h3 className="text-2xl font-black italic text-foreground tracking-tight"
                                    style={{ fontFamily: "'Georgia',serif" }}>
                                    Luminous Garden
                                </h3>
                            </div>

                            <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 border-l-2 border-border pl-3">
                                This platform was designed, architected, and shipped by a single full-stack developer — from the MongoDB schema and Express API to the React frontend and GSAP animations. Every component, every hook, every pixel.
                            </p>

                            {/* Mini stat row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { n: "10+", l: "Core Features" },
                                    { n: "64", l: "Districts Covered" },
                                    { n: "3", l: "Payment Methods" },
                                ].map(({ n, l }) => (
                                    <div key={l} className="text-center p-3 rounded-xl bg-secondary border border-border">
                                        <p className="font-black text-foreground text-lg leading-none mb-0.5"
                                            style={{ fontFamily: "'Georgia',serif" }}>{n}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground leading-snug">{l}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — what was built */}
                        <div className="flex flex-col gap-4">
                            {[
                                {
                                    icon: TbServer,
                                    title: "Full-Stack Architecture",
                                    body: "Express 5 REST API with Zod validation, JWT httpOnly cookies, role-based middleware, async error handling, and Morgan logging — production patterns throughout.",
                                },
                                {
                                    icon: TbDatabase,
                                    title: "Real-Time Data Layer",
                                    body: "MongoDB with aggregation pipelines for analytics, atomic stock operations, and a full order lifecycle from placement to delivery with event timestamps.",
                                },
                                {
                                    icon: TbCreditCard,
                                    title: "Multi-Gateway Payments",
                                    body: "Stripe Checkout with webhook verification, SSLCommerz integration for local bKash/Nagad flows, and a robust Cash-on-Delivery system — all in one order model.",
                                },
                         
                            ].map(({ icon: Icon, title, body }) => (
                                <div key={title} className="vault-card rounded-2xl! p-5 flex gap-4 cursor-default group">
                                    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                                        <Icon size={17} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground mb-1">{title}</p>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{body}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Contact row */}
                            <div className="flex gap-3 pt-1">
                                <a target="_blank" href="https://github.com/Hridoykhan4"
                                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl border border-border bg-card text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                                    <TbBrandGithub size={16} /> GitHub
                                </a>
                                <a href="mailto:contact@luminousgarden.com"
                                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-black text-primary-foreground transition-all hover:-translate-y-0.5"
                                    style={{ background: "var(--primary)", boxShadow: "0 4px 16px oklch(0.45 0.12 160 / 0.24)" }}>
                                    <TbMail size={16} /> Contact
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            <style>{`
        @keyframes ab-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
        </main>
    );
};

export default About;