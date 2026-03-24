/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const CATEGORIES = [
  { value: "all", label: "All", icon: TbLeaf },
  { value: "Indoor", label: "Indoor", icon: TbDroplet },
  { value: "Outdoor", label: "Outdoor", icon: TbSun },
  { value: "Flowering", label: "Flowering", icon: TbSparkles },
  { value: "Succulent", label: "Succulent", icon: TbLeaf },
];

const LIMIT = 8;

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const Plants = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Derive all filter state directly from URL (single source of truth) ──
  const urlSearch = searchParams.get("q") || "";
  const urlCategory = searchParams.get("cat") || "all";
  const urlPage = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const urlMinPrice = searchParams.get("minPrice") || "";
  const urlMaxPrice = searchParams.get("maxPrice") || "";

  // ── Local UI state (not URL-derived) ──
  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [view, setView] = useState("grid");
  const [minPrice, setMinPrice] = useState(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);
  const [priceOpen, setPriceOpen] = useState(false);

  const heroRef = useRef(null);

  // ── Data fetching — always driven by URL params ──
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

  // ── FIX: Debounced search — only resets page when the *committed* search value changes ──
  const committedSearch = useRef(urlSearch);
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch === committedSearch.current) return; // nothing changed
      committedSearch.current = localSearch;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          localSearch ? next.set("q", localSearch) : next.delete("q");
          next.set("page", "1"); // reset page only on genuine search change
          return next;
        },
        { replace: true },
      );
    }, 380);
    return () => clearTimeout(t);
  }, [localSearch, setSearchParams]);

  // ── Sync local search if URL changes externally (e.g. back button) ──
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSearch(urlSearch);
    committedSearch.current = urlSearch;
  }, [urlSearch]);

  // ── Sync price inputs when URL changes ──
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
  }, [urlMinPrice, urlMaxPrice]);

  // ── Price filter helpers ──
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

  // ── FIX: Stable pagination handler — reads page from URL at call time ──
  const goToPage = useCallback(
    (targetPage) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const current = Math.max(1, parseInt(next.get("page")) || 1);
        const maxPages = parseInt(next.get("_tp")) || 9999; // we store totalPages below
        const clamped = Math.max(1, Math.min(targetPage, maxPages));
        if (clamped === current) return prev; // no-op
        next.set("page", String(clamped));
        return next;
      });
    },
    [setSearchParams],
  );

  // Store totalPages in URL so goToPage can clamp safely without stale closure
  useEffect(() => {
    if (!isLoading && totalPages > 0) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("_tp", String(totalPages));
          return next;
        },
        { replace: true },
      );
    }
  }, [totalPages, isLoading, setSearchParams]);

  /* GSAP — hero entrance */
  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-word", {
        y: 100,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: "expo.out",
        delay: 0.05,
      });
      gsap.from(".hero-sub", {
        y: 20,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        delay: 0.55,
      });
      gsap.from(".stat-chip", {
        y: 24,
        opacity: 0,
        scale: 0.92,
        duration: 0.8,
        stagger: 0.07,
        ease: "expo.out",
        delay: 0.7,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* GSAP — card entrance on data change */
  useGSAP(() => {
    if (!isLoading && plants.length > 0) {
      gsap.fromTo(
        ".specimen-card",
        { y: 48, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.055,
          ease: "expo.out",
        },
      );
    }
  }, [plants, isLoading]);

  const hasPriceFilter = urlMinPrice || urlMaxPrice;

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
    hasPriceFilter && {
      label: `৳${urlMinPrice || "0"} – ৳${urlMaxPrice || "∞"}`,
      clear: clearPriceFilter,
    },
  ].filter(Boolean);

  const clearAll = useCallback(() => {
    setLocalSearch("");
    setMinPrice("");
    setMaxPrice("");
    committedSearch.current = "";
    setSearchParams({ cat: "all", page: "1" });
  }, [setSearchParams]);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* ══ HERO — NEXT WORLD LEVEL ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          background:
            "linear-gradient(170deg, oklch(0.10 0.03 160) 0%, oklch(0.14 0.025 160) 55%, var(--background) 100%)",
          paddingTop: 80,
          paddingBottom: 80,
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
        }}
      >
        {/* Layered ambient orbs */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "5%",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, oklch(0.55 0.2 160 / 0.10) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "0%",
              right: "-5%",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, oklch(0.50 0.14 200 / 0.08) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          {/* Fine grid overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(oklch(0.55 0.18 160 / 0.04) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.18 160 / 0.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
            }}
          />
        </div>

        <div
          className="container-page"
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* Eyebrow pill */}
          <div
            className="hero-sub"
            style={{
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 18px",
                borderRadius: 999,
                border: "1px solid oklch(0.55 0.18 160 / 0.30)",
                background: "oklch(0.55 0.18 160 / 0.08)",
                backdropFilter: "blur(12px)",
                color: "oklch(0.78 0.16 160)",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "oklch(0.72 0.2 160)",
                  boxShadow: "0 0 12px oklch(0.72 0.2 160)",
                  animation: "lg-pulse 2s ease-in-out infinite",
                }}
              />
              Live Botanical Index · Bangladesh
            </span>
          </div>

          {/* Headline — editorial split */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ overflow: "hidden" }}>
              <h1
                className="hero-word"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "clamp(4rem, 10vw, 9rem)",
                  fontWeight: 900,
                  lineHeight: 0.85,
                  letterSpacing: "-0.045em",
                  margin: 0,
                  background:
                    "linear-gradient(135deg, oklch(0.97 0.015 160) 0%, oklch(0.78 0.16 160) 60%, oklch(0.52 0.2 160) 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Specimen
              </h1>
            </div>
            <div
              style={{
                overflow: "hidden",
                display: "flex",
                alignItems: "baseline",
                gap: 24,
              }}
            >
              <h1
                className="hero-word"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "clamp(4rem, 10vw, 9rem)",
                  fontWeight: 100,
                  lineHeight: 0.85,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  fontStyle: "italic",
                  color: "oklch(0.94 0.02 160 / 0.15)",
                }}
              >
                Vault
              </h1>
              {/* Accent line */}
              <div
                style={{
                  flex: 1,
                  height: 2,
                  maxWidth: 180,
                  background:
                    "linear-gradient(90deg, oklch(0.72 0.2 160 / 0.6), transparent)",
                  borderRadius: 2,
                  marginBottom: 8,
                }}
              />
            </div>
          </div>

          {/* 2-col layout: description left, marquee-style right */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 40,
              alignItems: "end",
              marginBottom: 48,
            }}
          >
            <p
              className="hero-sub"
              style={{
                color: "oklch(0.72 0.04 160 / 0.55)",
                fontSize: 15,
                lineHeight: 1.8,
                maxWidth: 420,
                borderLeft: "2px solid oklch(0.55 0.18 160 / 0.3)",
                paddingLeft: 16,
                margin: 0,
              }}
            >
              Curated living specimens from elite local growers.
              <br />
              Every plant, a story worth collecting.
            </p>

            {/* Rotating tag cloud */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                opacity: 0.55,
                alignSelf: "center",
              }}
            >
              {["INDOOR", "OUTDOOR", "FLOWERING", "SUCCULENT"].map((tag, i) => (
                <span
                  key={tag}
                  className="hero-sub"
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.22em",
                    color: "oklch(0.7 0.12 160)",
                    opacity: 1 - i * 0.2,
                    textAlign: "right",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stat chips — redesigned */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              {
                label: "Specimens",
                value: response.totalCount || 0,
                icon: ShoppingBag,
                accent: "oklch(0.70 0.20 160)",
              },
              {
                label: "Avg Price",
                value: `৳${metrics.avg.toLocaleString()}`,
                icon: Coins,
                accent: "oklch(0.78 0.15 80)",
              },
              {
                label: "Peak Price",
                value: `৳${metrics.highest.toLocaleString()}`,
                icon: TrendingUp,
                accent: "oklch(0.68 0.18 270)",
              },
              {
                label: "Vault Worth",
                value: `৳${metrics.totalValue.toLocaleString()}`,
                icon: Gem,
                accent: "oklch(0.72 0.20 340)",
              },
            ].map(({ label, value, icon: Icon, accent }) => (
              <div
                key={label}
                className="stat-chip"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 18px",
                  borderRadius: 16,
                  border: `1px solid ${accent}2e`,
                  background: `${accent}0c`,
                  backdropFilter: "blur(16px)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* subtle shimmer line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
                  }}
                />
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: `${accent}14`,
                    border: `1px solid ${accent}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} style={{ color: accent }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "oklch(0.65 0.03 160)",
                      marginBottom: 2,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: "oklch(0.96 0.02 160)",
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TOOLBAR ═══════════════════════════════════════ */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 80,
          borderBottom: "1px solid var(--border)",
          background: "var(--background)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          className="container-page"
          style={{ paddingTop: 12, paddingBottom: 12 }}
        >
          {/* Category pills */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 10,
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
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 999,
                    cursor: "pointer",
                    border: active
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                    background: active ? "var(--primary)" : "transparent",
                    color: active
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    transition: "all 0.18s",
                  }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search + controls */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div
              style={{ flex: "1 1 220px", position: "relative", minWidth: 180 }}
            >
              <TbSearch
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted-foreground)",
                  pointerEvents: "none",
                  animation: isFetching ? "lg-spin 1s linear infinite" : "none",
                }}
              />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by name or description..."
                style={{
                  width: "100%",
                  height: 42,
                  paddingLeft: 40,
                  paddingRight: localSearch ? 40 : 14,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--accent)",
                  color: "var(--foreground)",
                  fontSize: 13,
                  fontWeight: 500,
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  style={{
                    position: "absolute",
                    right: 12,
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
                  <TbX size={14} />
                </button>
              )}
            </div>

            {/* Price range */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setPriceOpen((v) => !v)}
                style={{
                  height: 42,
                  padding: "0 16px",
                  borderRadius: 12,
                  cursor: "pointer",
                  border: hasPriceFilter
                    ? "1px solid var(--primary)"
                    : "1px solid var(--border)",
                  background: hasPriceFilter
                    ? "var(--secondary)"
                    : "var(--accent)",
                  color: hasPriceFilter
                    ? "var(--primary)"
                    : "var(--muted-foreground)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                <TbCurrencyTaka size={15} />
                {hasPriceFilter
                  ? `৳${urlMinPrice || "0"} – ৳${urlMaxPrice || "∞"}`
                  : "Price Range"}
              </button>

              {priceOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    width: 260,
                    padding: 20,
                    borderRadius: 18,
                    zIndex: 200,
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--muted-foreground)",
                      marginBottom: 14,
                    }}
                  >
                    Budget Range
                  </p>
                  <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                    {[
                      {
                        label: "MIN (৳)",
                        val: minPrice,
                        set: setMinPrice,
                        ph: "0",
                      },
                      {
                        label: "MAX (৳)",
                        val: maxPrice,
                        set: setMaxPrice,
                        ph: "∞",
                      },
                    ].map(({ label, val, set, ph }) => (
                      <div key={label} style={{ flex: 1 }}>
                        <label
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--muted-foreground)",
                            display: "block",
                            marginBottom: 5,
                          }}
                        >
                          {label}
                        </label>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => set(e.target.value)}
                          placeholder={ph}
                          style={{
                            width: "100%",
                            height: 38,
                            padding: "0 12px",
                            borderRadius: 10,
                            border: "1px solid var(--border)",
                            background: "var(--accent)",
                            color: "var(--foreground)",
                            fontSize: 14,
                            fontWeight: 700,
                            outline: "none",
                            boxSizing: "border-box",
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
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={applyPriceFilter}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                      }}
                    >
                      Apply
                    </button>
                    <button
                      onClick={clearPriceFilter}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 10,
                        cursor: "pointer",
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--muted-foreground)",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
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
                padding: 4,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--accent)",
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
                  <Icon size={15} />
                </button>
              ))}
            </div>

            {/* Sync */}
            <button
              onClick={() => refetch()}
              style={{
                height: 42,
                padding: "0 18px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                transition: "opacity 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-1px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <TbRefresh
                size={16}
                style={{
                  animation: isFetching ? "lg-spin 1s linear infinite" : "none",
                }}
              />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                }}
              >
                Active:
              </span>
              {activeFilters.map((f, i) => (
                <button
                  key={i}
                  onClick={f.clear}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
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

      {/* ══ CONTENT ═══════════════════════════════════════ */}
      <div
        className="container-page"
        style={{ paddingTop: 32, paddingBottom: 80 }}
      >
        {/* Result count */}
        {!isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
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
                    fontSize: 11,
                    letterSpacing: "0.1em",
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
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              Page {urlPage} / {totalPages}
            </p>
          </div>
        )}

        {/* Grid */}
        <div style={{ minHeight: 480 }}>
          {isLoading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  view === "grid"
                    ? "repeat(auto-fill, minmax(260px, 1fr))"
                    : "1fr",
                gap: view === "grid" ? 24 : 12,
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
                gap: view === "grid" ? 24 : 12,
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

        {/* ── PAGINATION — fixed ── */}
        {!isLoading && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
              marginTop: 64,
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
                gap: 4,
                padding: 5,
                borderRadius: 14,
                border: "1px solid var(--border)",
                background: "var(--card)",
              }}
            >
              {/* Smart window: always show first, last, current ±1, with ellipsis */}
              {buildPageWindow(urlPage, totalPages).map((item, idx) =>
                item === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    style={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
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
                      width: 40,
                      height: 40,
                      borderRadius: 10,
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
                      transition: "all 0.18s",
                      boxShadow:
                        urlPage === item
                          ? "0 4px 14px oklch(0.55 0.18 160 / 0.3)"
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

      {/* Global keyframes */}
      <style>{`
        @keyframes lg-spin  { to { transform: translateY(-50%) rotate(360deg); } }
        @keyframes lg-pulse {
          0%,100% { opacity:1; box-shadow:0 0 10px oklch(0.72 0.2 160) }
          50%      { opacity:.6; box-shadow:0 0 20px oklch(0.72 0.2 160) }
        }
      `}</style>
    </div>
  );
};

/* ── Build a smart page window to avoid rendering 50+ buttons ── */
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

/* ── Sub-components ── */
const PaginationBtn = ({ icon: Icon, disabled, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    style={{
      width: 50,
      height: 50,
      borderRadius: 12,
      border: "1px solid var(--border)",
      background: "var(--card)",
      cursor: disabled ? "not-allowed" : "pointer",
      color: disabled ? "var(--border)" : "var(--foreground)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.18s",
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
    <Icon size={20} />
  </button>
);

const EmptyState = ({ onReset }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 24px",
      textAlign: "center",
      borderRadius: 24,
      border: "1px dashed var(--border)",
      background: "var(--card)",
    }}
  >
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: "var(--secondary)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}
    >
      <TbLeaf size={32} style={{ color: "var(--primary)", opacity: 0.5 }} />
    </div>
    <h2
      style={{
        fontFamily: "'Georgia', serif",
        fontSize: 26,
        fontWeight: 900,
        color: "var(--foreground)",
        letterSpacing: "-0.02em",
        fontStyle: "italic",
        marginBottom: 10,
      }}
    >
      No specimens found
    </h2>
    <p
      style={{
        color: "var(--muted-foreground)",
        fontSize: 14,
        marginBottom: 28,
        maxWidth: 300,
        lineHeight: 1.65,
      }}
    >
      Try adjusting your search, category, or price range.
    </p>
    <button
      onClick={onReset}
      style={{
        padding: "11px 26px",
        borderRadius: 999,
        cursor: "pointer",
        border: "1px solid var(--primary)",
        background: "var(--secondary)",
        color: "var(--primary)",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        transition: "all 0.2s",
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
      Reset All Filters
    </button>
  </div>
);

export default Plants;
