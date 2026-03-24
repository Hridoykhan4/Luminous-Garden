import { useState, useEffect, useMemo, useTransition, useRef } from "react";
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
  TbSlideshow,
  TbDroplet,
  TbSun,
  TbSparkles,
  TbSortAscending,
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
];

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const Plants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  // Local state
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [view, setView] = useState("grid");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [priceOpen, setPriceOpen] = useState(false);

  const heroRef = useRef(null);

  // URL params
  const page = parseInt(searchParams.get("page")) || 1;
  const category = searchParams.get("cat") || "all";
  const limit = 8;

  const {
    data: response = {},
    isLoading,
    isFetching,
    refetch,
  } = usePlants({
    search: searchParams.get("q") || "",
    category: category === "all" ? "" : category,
    page,
    limit,
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  const plants = useMemo(() => response.data || [], [response.data]);
  const totalPages = response.totalPages || 1;

  const metrics = useMemo(() => {
    if (!plants.length) return { avg: 0, highest: 0, totalValue: 0 };
    const prices = plants.map((p) => p.price);
    return {
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      highest: Math.max(...prices),
      totalValue: plants.reduce((a, b) => a + b.price * b.quantity, 0),
    };
  }, [plants]);

  /* Debounced search sync */
  useEffect(() => {
    const t = setTimeout(() => {
      startTransition(() => {
        setSearchParams(
          (prev) => {
            search ? prev.set("q", search) : prev.delete("q");
            prev.set("page", "1");
            return prev;
          },
          { replace: true },
        );
      });
    }, 400);
    return () => clearTimeout(t);
  }, [search, setSearchParams]);

  /* Apply price filter */
  const applyPriceFilter = () => {
    setSearchParams((prev) => {
      minPrice ? prev.set("minPrice", minPrice) : prev.delete("minPrice");
      maxPrice ? prev.set("maxPrice", maxPrice) : prev.delete("maxPrice");
      prev.set("page", "1");
      return prev;
    });
    setPriceOpen(false);
  };

  const clearPriceFilter = () => {
    setMinPrice("");
    setMaxPrice("");
    setSearchParams((prev) => {
      prev.delete("minPrice");
      prev.delete("maxPrice");
      prev.set("page", "1");
      return prev;
    });
    setPriceOpen(false);
  };

  /* GSAP hero entrance */
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

  /* Card entrance */
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

  const hasPriceFilter =
    searchParams.get("minPrice") || searchParams.get("maxPrice");
  const activeFilters = [
    category !== "all" && {
      label: CATEGORIES.find((c) => c.value === category)?.label,
      clear: () =>
        setSearchParams((p) => {
          p.set("cat", "all");
          p.set("page", "1");
          return p;
        }),
    },
    search && { label: `"${search}"`, clear: () => setSearch("") },
    hasPriceFilter && {
      label: `৳${searchParams.get("minPrice") || "0"} – ৳${searchParams.get("maxPrice") || "∞"}`,
      clear: clearPriceFilter,
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* ══ HERO ══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          background:
            "linear-gradient(170deg, oklch(0.12 0.025 160) 0%, oklch(0.16 0.02 160) 60%, var(--background) 100%)",
          paddingTop: 72,
          paddingBottom: 64,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ambient glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "15%",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.55 0.18 160 / 0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div className="container-page" style={{ position: "relative" }}>
          {/* Eyebrow pill */}
          <div
            className="hero-sub"
            style={{
              marginBottom: 22,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 16px",
                borderRadius: 999,
                border: "1px solid oklch(0.55 0.18 160 / 0.35)",
                background: "oklch(0.55 0.18 160 / 0.1)",
                color: "oklch(0.75 0.16 160)",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "oklch(0.72 0.2 160)",
                  boxShadow: "0 0 10px oklch(0.72 0.2 160)",
                  animation: "lg-pulse 2s ease-in-out infinite",
                }}
              />
              Live Botanical Index
            </span>
          </div>

          {/* Title */}
          <div style={{ overflow: "hidden", marginBottom: 4 }}>
            <h1
              className="hero-word"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(3.2rem, 8vw, 7.5rem)",
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: "-0.04em",
                background:
                  "linear-gradient(135deg, oklch(0.96 0.02 160) 0%, oklch(0.75 0.16 160) 55%, oklch(0.5 0.18 160) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
              }}
            >
              Specimen
            </h1>
          </div>
          <div style={{ overflow: "hidden", marginBottom: 28 }}>
            <h1
              className="hero-word"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(3.2rem, 8vw, 7.5rem)",
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: "-0.04em",
                color: "oklch(0.94 0.02 160 / 0.18)",
                fontStyle: "italic",
                margin: 0,
              }}
            >
              Vault
            </h1>
          </div>

          <p
            className="hero-sub"
            style={{
              color: "oklch(0.75 0.04 160 / 0.55)",
              fontSize: 15,
              lineHeight: 1.75,
              maxWidth: 440,
              marginBottom: 48,
            }}
          >
            Curated living specimens from elite local growers. Every plant, a
            story.
          </p>

          {/* Stat chips */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              {
                label: "Specimens",
                value: response.totalCount || 0,
                icon: ShoppingBag,
                accent: "oklch(0.7 0.2 160)",
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
                accent: "oklch(0.72 0.2 340)",
              },
            ].map(({ label, value, icon: Icon, accent }) => (
              <div
                key={label}
                className="stat-chip"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  borderRadius: 14,
                  border: `1px solid ${accent}33`,
                  background: `${accent}0f`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Icon size={15} style={{ color: accent, flexShrink: 0 }} />
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "oklch(0.7 0.03 160)",
                      marginBottom: 1,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "oklch(0.95 0.02 160)",
                      letterSpacing: "-0.02em",
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
          {/* Category Pills */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            {CATEGORIES.map(({ value, label, icon: Icon }) => {
              const active = category === value;
              return (
                <button
                  key={value}
                  onClick={() =>
                    setSearchParams((p) => {
                      p.set("cat", value);
                      p.set("page", "1");
                      return p;
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
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search + controls row */}
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or description..."
                style={{
                  width: "100%",
                  height: 42,
                  paddingLeft: 40,
                  paddingRight: search ? 40 : 14,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--accent)",
                  color: "var(--foreground)",
                  fontSize: 13,
                  fontWeight: 500,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
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

            {/* Price Range Button */}
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
                  ? `৳${searchParams.get("minPrice") || "0"} – ৳${searchParams.get("maxPrice") || "∞"}`
                  : "Price Range"}
              </button>

              {/* Dropdown */}
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
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--muted-foreground)",
                          display: "block",
                          marginBottom: 5,
                        }}
                      >
                        MIN (৳)
                      </label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
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
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "var(--primary)")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "var(--border)")
                        }
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--muted-foreground)",
                          display: "block",
                          marginBottom: 5,
                        }}
                      >
                        MAX (৳)
                      </label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="∞"
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
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "var(--primary)")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "var(--border)")
                        }
                      />
                    </div>
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

            {/* Sync button */}
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
                boxShadow: "0 4px 16px var(--primary) / 0.25",
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
                onClick={() => {
                  setSearch("");
                  setMinPrice("");
                  setMaxPrice("");
                  setSearchParams({ cat: "all" });
                }}
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
              Page {page} / {totalPages}
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
              {[...Array(limit)].map((_, i) => (
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
            <EmptyState
              onReset={() => {
                setSearch("");
                setMinPrice("");
                setMaxPrice("");
                setSearchParams({ cat: "all" });
              }}
            />
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
              marginTop: 64,
            }}
          >
            <PaginationBtn
              icon={TbChevronLeft}
              disabled={page === 1}
              onClick={() =>
                setSearchParams((p) => {
                  p.set("page", page - 1);
                  return p;
                })
              }
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
              {[...Array(totalPages)].map((_, i) => {
                const a = page === i + 1;
                return (
                  <button
                    key={i}
                    onClick={() =>
                      setSearchParams((p) => {
                        p.set("page", i + 1);
                        return p;
                      })
                    }
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      background: a ? "var(--primary)" : "transparent",
                      color: a
                        ? "var(--primary-foreground)"
                        : "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 800,
                      transition: "all 0.18s",
                      boxShadow: a ? "0 4px 14px var(--primary) / 0.3" : "none",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
            <PaginationBtn
              icon={TbChevronRight}
              disabled={page === totalPages}
              onClick={() =>
                setSearchParams((p) => {
                  p.set("page", page + 1);
                  return p;
                })
              }
            />
          </div>
        )}
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes lg-spin  { to { transform: rotate(360deg); } }
        @keyframes lg-pulse { 0%,100%{opacity:1;box-shadow:0 0 10px oklch(0.72 0.2 160)} 50%{opacity:.6;box-shadow:0 0 18px oklch(0.72 0.2 160)} }
      `}</style>
    </div>
  );
};

/* ── helpers ── */
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
