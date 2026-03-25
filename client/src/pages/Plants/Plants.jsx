/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbSearch,
  TbChevronLeft,
  TbChevronRight,
  TbLeaf,
  TbRefresh,
  TbLayoutGrid,
  TbList,
  TbX,
  TbCurrencyTaka,
  TbDroplet,
  TbSun,
  TbSparkles,
} from "react-icons/tb";
import { ShoppingBag, Coins, TrendingUp, Gem } from "lucide-react";

import PlantCard from "@/components/Shared/PlantCard";
import PlantSkeleton from "@/components/Shared/PlantSkeleton/PlantSkeleton";
import usePlants from "@/hooks/usePlants";

/* ─────────────────────────────────────
   CONSTANTS
───────────────────────────────────── */
const CATEGORIES = [
  { value: "all", label: "All Species", icon: TbLeaf },
  { value: "Indoor", label: "Indoor", icon: TbDroplet },
  { value: "Outdoor", label: "Outdoor", icon: TbSun },
  { value: "Flowering", label: "Flowering", icon: TbSparkles },
  { value: "Succulent", label: "Succulent", icon: TbLeaf },
];

const LIMIT = 8;

/* Light-mode ink accents — dark enough on white, harmonized with --primary */
const STAT_META = [
  {
    key: "specimens",
    label: "Specimens",
    icon: ShoppingBag,
    accent: "oklch(0.38 0.10 160)",
    bg: "oklch(0.93 0.04 160)",
    border: "oklch(0.86 0.06 160)",
  },
  {
    key: "avg",
    label: "Avg Price",
    icon: Coins,
    accent: "oklch(0.38 0.09 100)",
    bg: "oklch(0.94 0.04 100)",
    border: "oklch(0.87 0.06 100)",
  },
  {
    key: "highest",
    label: "Peak Price",
    icon: TrendingUp,
    accent: "oklch(0.35 0.08 200)",
    bg: "oklch(0.93 0.03 200)",
    border: "oklch(0.86 0.05 200)",
  },
  {
    key: "vault",
    label: "Vault Worth",
    icon: Gem,
    accent: "oklch(0.38 0.09 310)",
    bg: "oklch(0.94 0.03 310)",
    border: "oklch(0.87 0.05 310)",
  },
];

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
const Plants = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get("q") || "";
  const urlCategory = searchParams.get("cat") || "all";
  const urlPage = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const urlMinPrice = searchParams.get("minPrice") || "";
  const urlMaxPrice = searchParams.get("maxPrice") || "";

  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [view, setView] = useState("grid");
  const [minPrice, setMinPrice] = useState(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);
  const [priceOpen, setPriceOpen] = useState(false);
  const committedSearch = useRef(urlSearch);
  const heroRef = useRef(null);

  const {
    data: response = {},
    isLoading,
    isFetching,
    refetch,
  } = usePlants({
    search: urlSearch,
    category: urlCategory === "all" ? "" : urlCategory,
    page: urlPage,
    limit: LIMIT,
    minPrice: urlMinPrice,
    maxPrice: urlMaxPrice,
  });

  const plants = useMemo(() => response.data || [], [response.data]);
  const totalPages = useMemo(
    () => response.totalPages || 1,
    [response.totalPages],
  );

  const metrics = useMemo(() => {
    if (!plants.length) return { avg: 0, highest: 0, totalValue: 0 };
    const prices = plants.map((p) => p.price);
    return {
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      highest: Math.max(...prices),
      totalValue: plants.reduce((a, b) => a + b.price * b.quantity, 0),
    };
  }, [plants]);

  const statValues = {
    specimens: response.totalCount || 0,
    avg: `৳${metrics.avg.toLocaleString()}`,
    highest: `৳${metrics.highest.toLocaleString()}`,
    vault: `৳${metrics.totalValue.toLocaleString()}`,
  };

  /* Debounced search */
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch === committedSearch.current) return;
      committedSearch.current = localSearch;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          localSearch ? next.set("q", localSearch) : next.delete("q");
          next.set("page", "1");
          return next;
        },
        { replace: true },
      );
    }, 380);
    return () => clearTimeout(t);
  }, [localSearch, setSearchParams]);

  useEffect(() => {
    setLocalSearch(urlSearch);
    committedSearch.current = urlSearch;
  }, [urlSearch]);
  useEffect(() => {
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
  }, [urlMinPrice, urlMaxPrice]);

  const applyPriceFilter = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      minPrice ? next.set("minPrice", minPrice) : next.delete("minPrice");
      maxPrice ? next.set("maxPrice", maxPrice) : next.delete("maxPrice");
      next.set("page", "1");
      return next;
    });
    setPriceOpen(false);
  }, [minPrice, maxPrice, setSearchParams]);

  const clearPriceFilter = useCallback(() => {
    setMinPrice("");
    setMaxPrice("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("minPrice");
      next.delete("maxPrice");
      next.set("page", "1");
      return next;
    });
    setPriceOpen(false);
  }, [setSearchParams]);

  const goToPage = useCallback(
    (target) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const current = Math.max(1, parseInt(next.get("page")) || 1);
        const clamped = Math.max(1, target);
        if (clamped === current) return prev;
        next.set("page", String(clamped));
        return next;
      });
      // window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams],
  );

  const clearAll = useCallback(() => {
    setLocalSearch("");
    setMinPrice("");
    setMaxPrice("");
    committedSearch.current = "";
    setSearchParams({ cat: "all", page: "1" });
  }, [setSearchParams]);

  const activeFilters = [
    urlCategory !== "all" && {
      label: CATEGORIES.find((c) => c.value === urlCategory)?.label,
      clear: () =>
        setSearchParams((p) => {
          const n = new URLSearchParams(p);
          n.set("cat", "all");
          n.set("page", "1");
          return n;
        }),
    },
    localSearch && {
      label: `"${localSearch}"`,
      clear: () => setLocalSearch(""),
    },
    (urlMinPrice || urlMaxPrice) && {
      label: `৳${urlMinPrice || "0"}–৳${urlMaxPrice || "∞"}`,
      clear: clearPriceFilter,
    },
  ].filter(Boolean);

  /* GSAP hero entrance */
  useGSAP(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".vlt-eyebrow", { y: 16, opacity: 0, duration: 0.8 }, 0)
        .from(".vlt-line-1", { yPercent: 112, opacity: 0, duration: 1.0 }, 0.08)
        .from(".vlt-line-2", { yPercent: 112, opacity: 0, duration: 1.0 }, 0.2)
        .from(
          ".vlt-rule",
          { scaleX: 0, duration: 0.9, transformOrigin: "left" },
          0.45,
        )
        .from(".vlt-sub", { y: 14, opacity: 0, duration: 0.8 }, 0.5)
        .from(
          ".vlt-chip",
          { y: 14, opacity: 0, scale: 0.96, stagger: 0.07, duration: 0.7 },
          0.62,
        );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* GSAP cards */
  useGSAP(() => {
    if (!isLoading && plants.length > 0)
      gsap.fromTo(
        ".specimen-card",
        { y: 36, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          stagger: 0.05,
          ease: "expo.out",
        },
      );
  }, [plants, isLoading]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          paddingTop: 72,
          paddingBottom: 80,
          overflow: "hidden",
          isolation: "isolate",
          /* Same mesh language as Hero.jsx — seamless sibling feel */
          background: [
            "radial-gradient(ellipse 68% 58% at 76% 28%, oklch(0.87 0.07 160 / 0.45) 0%, transparent 62%)",
            "radial-gradient(ellipse 48% 65% at 8%  82%, oklch(0.90 0.05 155 / 0.32) 0%, transparent 58%)",
            "radial-gradient(ellipse 38% 38% at 50%  8%, oklch(0.84 0.08 140 / 0.18) 0%, transparent 52%)",
          ].join(","),
        }}
      >
        {/* Ambient layer */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {/* Dot grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, oklch(0.45 0.12 160 / 0.10) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage:
                "radial-gradient(ellipse 80% 65% at 30% 50%, black 25%, transparent 100%)",
            }}
          />
          {/* Decorative rings — same as Hero */}
          <div
            style={{
              position: "absolute",
              top: "4%",
              right: "6%",
              width: 340,
              height: 340,
              borderRadius: "50%",
              border: "1px solid oklch(0.45 0.12 160 / 0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "12%",
              right: "12%",
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "1px solid oklch(0.45 0.12 160 / 0.07)",
            }}
          />
          {/* Grain */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.018,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
          />
        </div>

        <div
          className="container-page"
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* Eyebrow — exact pill from Hero.jsx */}
          <div className="vlt-eyebrow" style={{ marginBottom: 28 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: 8,
                paddingRight: 16,
                paddingTop: 6,
                paddingBottom: 6,
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "var(--card)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "currentColor",
                    animation: "vlt-blink 2s ease-in-out infinite",
                  }}
                />
                Live
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                }}
              >
                Specimen Vault · Bangladesh
              </span>
            </span>
          </div>

          {/* 2-col: headline left — stat chips right */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 48,
              alignItems: "end",
            }}
          >
            {/* Headline */}
            <div>
              <div
                style={{
                  overflow: "hidden",
                  lineHeight: 0.88,
                  marginBottom: 4,
                }}
              >
                <h1
                  className="vlt-line-1"
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: "clamp(3.4rem, 8vw, 7.5rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.045em",
                    color: "var(--foreground)",
                    margin: 0,
                    display: "block",
                  }}
                >
                  Specimen
                </h1>
              </div>
              <div style={{ overflow: "hidden", lineHeight: 0.88 }}>
                <h1
                  className="vlt-line-2"
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: "clamp(3.4rem, 8vw, 7.5rem)",
                    fontWeight: 300,
                    fontStyle: "italic",
                    letterSpacing: "-0.04em",
                    margin: 0,
                    display: "block",
                    background:
                      "linear-gradient(135deg, var(--primary) 0%, oklch(0.52 0.18 148) 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Vault.
                </h1>
              </div>

              {/* Accent rule */}
              <div
                className="vlt-rule"
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                  height: 1,
                  maxWidth: 180,
                  background:
                    "linear-gradient(90deg, var(--primary), oklch(0.55 0.14 160 / 0.15), transparent)",
                }}
              />

              {/* Sub copy */}
              <p
                className="vlt-sub"
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 15,
                  lineHeight: 1.78,
                  maxWidth: 420,
                  margin: 0,
                  borderLeft: "2px solid var(--border)",
                  paddingLeft: 14,
                }}
              >
                Curated living specimens from elite local growers.
                <br />
                Every plant, a story worth collecting.
              </p>
            </div>

            {/* Stat chips 2×2 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
              className="vlt-chip-grid"
            >
              {STAT_META.map(
                ({ key, label, icon: Icon, accent, bg, border }) => (
                  <div
                    key={key}
                    className="vlt-chip"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: "14px 16px",
                      borderRadius: 16,
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                      minWidth: 118,
                      position: "relative",
                      overflow: "hidden",
                      transition:
                        "border-color 0.22s, box-shadow 0.22s, transform 0.22s",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = border;
                      e.currentTarget.style.boxShadow = `0 6px 20px rgba(0,0,0,0.08)`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.boxShadow =
                        "0 1px 6px rgba(0,0,0,0.04)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 12,
                        right: 12,
                        height: 1.5,
                        background: `linear-gradient(90deg, transparent, ${accent}50, transparent)`,
                      }}
                    />
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: bg,
                        border: `1px solid ${border}`,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Icon size={12} style={{ color: accent }} />
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 900,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: accent,
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "clamp(1.25rem, 2.5vw, 1.6rem)",
                        fontWeight: 900,
                        letterSpacing: "-0.03em",
                        color: "var(--foreground)",
                        lineHeight: 1,
                      }}
                    >
                      {statValues[key]}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STICKY TOOLBAR ════════════════════════════════════════════ */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 80,
          background: "oklch(0.99 0.005 160 / 0.94)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="container-page"
          style={{ paddingTop: 10, paddingBottom: 10 }}
        >
          {/* Category pills */}
          <div
            style={{
              display: "flex",
              gap: 5,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            {CATEGORIES.map(({ value, label, icon: Icon }) => {
              const active = urlCategory === value;
              return (
                <button
                  key={value}
                  onClick={() =>
                    setSearchParams((p) => {
                      const n = new URLSearchParams(p);
                      n.set("cat", value);
                      n.set("page", "1");
                      return n;
                    })
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "6px 13px",
                    borderRadius: 999,
                    cursor: "pointer",
                    border: active
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                    background: active ? "var(--primary)" : "var(--card)",
                    color: active
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    transition: "all 0.18s",
                    boxShadow: active
                      ? "0 2px 8px oklch(0.45 0.12 160 / 0.20)"
                      : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <Icon size={11} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search + tools row */}
          <div
            style={{
              display: "flex",
              gap: 7,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div
              style={{ flex: "1 1 200px", position: "relative", minWidth: 160 }}
            >
              <TbSearch
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted-foreground)",
                  pointerEvents: "none",
                  animation: isFetching
                    ? "vlt-spin 0.9s linear infinite"
                    : "none",
                }}
              />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search specimens…"
                style={{
                  width: "100%",
                  height: 40,
                  boxSizing: "border-box",
                  paddingLeft: 36,
                  paddingRight: localSearch ? 34 : 12,
                  borderRadius: 11,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontSize: 13,
                  fontWeight: 500,
                  outline: "none",
                  transition: "border-color 0.18s, box-shadow 0.18s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow =
                    "0 0 0 3px oklch(0.45 0.12 160 / 0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                }}
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted-foreground)",
                    display: "flex",
                    padding: 2,
                  }}
                >
                  <TbX size={13} />
                </button>
              )}
            </div>

            {/* Price range */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setPriceOpen((v) => !v)}
                style={{
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 11,
                  cursor: "pointer",
                  border:
                    urlMinPrice || urlMaxPrice
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                  background:
                    urlMinPrice || urlMaxPrice
                      ? "var(--secondary)"
                      : "var(--card)",
                  color:
                    urlMinPrice || urlMaxPrice
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  transition: "all 0.18s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <TbCurrencyTaka size={14} />
                {urlMinPrice || urlMaxPrice
                  ? `৳${urlMinPrice || "0"} – ৳${urlMaxPrice || "∞"}`
                  : "Budget"}
              </button>

              {priceOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    zIndex: 300,
                    width: 246,
                    padding: 16,
                    borderRadius: 16,
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.10)",
                  }}
                >
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: -1 }}
                    onClick={() => setPriceOpen(false)}
                  />
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--muted-foreground)",
                      marginBottom: 10,
                    }}
                  >
                    Budget Range
                  </p>
                  <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
                    {[
                      {
                        label: "MIN ৳",
                        val: minPrice,
                        set: setMinPrice,
                        ph: "0",
                      },
                      {
                        label: "MAX ৳",
                        val: maxPrice,
                        set: setMaxPrice,
                        ph: "∞",
                      },
                    ].map(({ label, val, set, ph }) => (
                      <div key={label} style={{ flex: 1 }}>
                        <label
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            color: "var(--muted-foreground)",
                            display: "block",
                            marginBottom: 4,
                            letterSpacing: "0.10em",
                          }}
                        >
                          {label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => set(e.target.value)}
                          placeholder={ph}
                          style={{
                            width: "100%",
                            height: 34,
                            boxSizing: "border-box",
                            padding: "0 10px",
                            borderRadius: 9,
                            border: "1px solid var(--border)",
                            background: "var(--accent)",
                            color: "var(--foreground)",
                            fontSize: 13,
                            fontWeight: 700,
                            outline: "none",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "var(--primary)")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "var(--border)")
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <button
                      onClick={applyPriceFilter}
                      style={{
                        flex: 1,
                        height: 34,
                        borderRadius: 9,
                        border: "none",
                        cursor: "pointer",
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      Apply
                    </button>
                    <button
                      onClick={clearPriceFilter}
                      style={{
                        flex: 1,
                        height: 34,
                        borderRadius: 9,
                        cursor: "pointer",
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--muted-foreground)",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View toggle */}
            <div
              style={{
                display: "flex",
                gap: 2,
                padding: 3,
                borderRadius: 11,
                border: "1px solid var(--border)",
                background: "var(--card)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {[
                { v: "grid", icon: TbLayoutGrid },
                { v: "list", icon: TbList },
              ].map(({ v, icon: Icon }) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background: view === v ? "var(--primary)" : "transparent",
                    color:
                      view === v
                        ? "var(--primary-foreground)"
                        : "var(--muted-foreground)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.18s",
                  }}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>

            {/* Sync */}
            <button
              onClick={() => refetch()}
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 11,
                border: "none",
                cursor: "pointer",
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.07em",
                boxShadow: "0 2px 10px oklch(0.45 0.12 160 / 0.22)",
                transition: "opacity 0.18s, transform 0.18s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-1px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <TbRefresh
                size={15}
                style={{
                  animation: isFetching
                    ? "vlt-spin 0.9s linear infinite"
                    : "none",
                }}
              />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 5,
                marginTop: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                }}
              >
                Filtering:
              </span>
              {activeFilters.map((f, i) => (
                <button
                  key={i}
                  onClick={f.clear}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 9px",
                    borderRadius: 999,
                    border: "1px solid var(--primary)",
                    background: "var(--secondary)",
                    color: "var(--primary)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {f.label} <TbX size={10} />
                </button>
              ))}
              <button
                onClick={clearAll}
                style={{
                  fontSize: 11,
                  color: "var(--primary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══ CONTENT ════════════════════════════════════════════════ */}
      <div
        className="container-page"
        style={{ paddingTop: 28, paddingBottom: 88 }}
      >
        {/* Result meta */}
        {!isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--muted-foreground)",
              }}
            >
              {response.totalCount
                ? `${response.totalCount} specimen${response.totalCount !== 1 ? "s" : ""}`
                : "No specimens found"}
              {isFetching && (
                <span
                  style={{
                    marginLeft: 8,
                    color: "var(--primary)",
                    fontWeight: 800,
                    fontSize: 10,
                  }}
                >
                  ● syncing
                </span>
              )}
            </p>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              {urlPage} / {totalPages}
            </p>
          </div>
        )}

        {/* Cards */}
        <div style={{ minHeight: 480 }}>
          {isLoading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  view === "grid"
                    ? "repeat(auto-fill, minmax(260px, 1fr))"
                    : "1fr",
                gap: view === "grid" ? 20 : 10,
              }}
            >
              {[...Array(LIMIT)].map((_, i) => (
                <PlantSkeleton key={i} />
              ))}
            </div>
          ) : plants.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  view === "grid"
                    ? "repeat(auto-fill, minmax(260px, 1fr))"
                    : "1fr",
                gap: view === "grid" ? 20 : 10,
              }}
            >
              {plants.map((plant) => (
                <div key={plant._id} className="specimen-card">
                  <PlantCard plant={plant} refetch={refetch} view={view} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState onReset={clearAll} />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
              marginTop: 60,
            }}
          >
            <PaginationBtn
              icon={TbChevronLeft}
              disabled={urlPage <= 1}
              onClick={() => goToPage(urlPage - 1)}
            />
            <div
              style={{
                display: "flex",
                gap: 3,
                padding: 4,
                borderRadius: 13,
                border: "1px solid var(--border)",
                background: "var(--card)",
                boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
              }}
            >
              {buildPageWindow(urlPage, totalPages).map((item, idx) =>
                item === "…" ? (
                  <span
                    key={`e${idx}`}
                    style={{
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: "var(--muted-foreground)",
                    }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      border: "none",
                      cursor: "pointer",
                      background:
                        urlPage === item ? "var(--primary)" : "transparent",
                      color:
                        urlPage === item
                          ? "var(--primary-foreground)"
                          : "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 800,
                      transition: "all 0.15s",
                      boxShadow:
                        urlPage === item
                          ? "0 2px 8px oklch(0.45 0.12 160 / 0.22)"
                          : "none",
                    }}
                  >
                    {String(item).padStart(2, "0")}
                  </button>
                ),
              )}
            </div>
            <PaginationBtn
              icon={TbChevronRight}
              disabled={urlPage >= totalPages}
              onClick={() => goToPage(urlPage + 1)}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes vlt-spin  { to { transform: translateY(-50%) rotate(360deg); } }
        @keyframes vlt-blink { 0%,100%{opacity:1} 50%{opacity:.35} }
        @media (max-width: 900px) { .vlt-chip-grid { display: none !important; } }
      `}</style>
    </div>
  );
};

/* ── helpers ── */
function buildPageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set(
    [1, total, current, current - 1, current + 1].filter(
      (n) => n >= 1 && n <= total,
    ),
  );
  const sorted = [...set].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
    result.push(sorted[i]);
  }
  return result;
}

const PaginationBtn = ({ icon: Icon, disabled, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    style={{
      width: 46,
      height: 46,
      borderRadius: 11,
      border: "1px solid var(--border)",
      background: "var(--card)",
      cursor: disabled ? "not-allowed" : "pointer",
      color: disabled ? "var(--border)" : "var(--foreground)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.18s",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = "var(--primary)";
        e.currentTarget.style.color = "var(--primary-foreground)";
        e.currentTarget.style.borderColor = "var(--primary)";
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = "var(--card)";
        e.currentTarget.style.color = "var(--foreground)";
        e.currentTarget.style.borderColor = "var(--border)";
      }
    }}
  >
    <Icon size={18} />
  </button>
);

const EmptyState = ({ onReset }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "72px 24px",
      textAlign: "center",
      borderRadius: 24,
      border: "1px dashed var(--border)",
      background: "var(--card)",
      boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "var(--secondary)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
      }}
    >
      <TbLeaf size={26} style={{ color: "var(--primary)", opacity: 0.5 }} />
    </div>
    <h2
      style={{
        fontFamily: "'Georgia', serif",
        fontSize: 22,
        fontWeight: 900,
        color: "var(--foreground)",
        letterSpacing: "-0.02em",
        fontStyle: "italic",
        marginBottom: 8,
      }}
    >
      No specimens found
    </h2>
    <p
      style={{
        color: "var(--muted-foreground)",
        fontSize: 14,
        marginBottom: 24,
        maxWidth: 270,
        lineHeight: 1.65,
      }}
    >
      Try adjusting your search, category, or price range.
    </p>
    <button
      onClick={onReset}
      style={{
        padding: "10px 22px",
        borderRadius: 999,
        cursor: "pointer",
        border: "1px solid var(--primary)",
        background: "var(--secondary)",
        color: "var(--primary)",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        transition: "all 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--primary)";
        e.currentTarget.style.color = "var(--primary-foreground)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--secondary)";
        e.currentTarget.style.color = "var(--primary)";
      }}
    >
      Reset Filters
    </button>
  </div>
);

export default Plants;
