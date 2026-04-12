/* eslint-disable react-hooks/refs */
/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbPlus,
  TbMinus,
  TbShoppingCart,
  TbEdit,
  TbTrash,
  TbCheck,
  TbTruckDelivery,
  TbLeaf,
  TbShield,
  TbArrowLeft,
  TbStar,
  TbMapPin,
  TbPackage,
  TbClock,
} from "react-icons/tb";
import useAuth from "@/hooks/useAuth";
import useUserRole from "@/hooks/useUserRole";
import LuminousButton from "@/components/Shared/LuminousButton/LuminousButton";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import useSinglePlant from "@/hooks/useSinglePlant";
import OrderModal from "@/components/Shared/OrderModal/OrderModal";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const TRUST_ITEMS = [
  { icon: TbLeaf, label: "100% Organic", sub: "Certified growth" },
  { icon: TbShield, label: "Secure Payment", sub: "SSL + bKash + Stripe" },
  { icon: TbTruckDelivery, label: "Home Delivery", sub: "Dhaka & suburbs" },
  { icon: TbCheck, label: "Verified Seller", sub: "ID confirmed" },
];

const CATEGORY_HUE = {
  Indoor: {
    color: "oklch(0.40 0.10 220)",
    light: "oklch(0.95 0.02 220)",
    border: "oklch(0.40 0.10 220 / 0.2)",
  },
  Outdoor: {
    color: "oklch(0.38 0.11 148)",
    light: "oklch(0.95 0.02 148)",
    border: "oklch(0.38 0.11 148 / 0.2)",
  },
  Flowering: {
    color: "oklch(0.45 0.13 15)",
    light: "oklch(0.97 0.02 15)",
    border: "oklch(0.45 0.13 15 / 0.2)",
  },
  Succulent: {
    color: "oklch(0.48 0.11 60)",
    light: "oklch(0.96 0.02 60)",
    border: "oklch(0.48 0.11 60 / 0.2)",
  },
  default: {
    color: "var(--primary)",
    light: "var(--secondary)",
    border: "var(--border)",
  },
};

/* ─────────────────────────────────────────────
   DESKTOP-ONLY LENS ZOOM
   (completely skipped on < 1024px)
───────────────────────────────────────────── */
function useLensZoom(imageSrc) {
  const wrapRef = useRef(null);
  const lensRef = useRef(null);
  const resultRef = useRef(null);
  const activeRef = useRef(false);

  const onMove = useCallback((e) => {
    if (!activeRef.current || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    const lw = lensRef.current.offsetWidth;
    const lh = lensRef.current.offsetHeight;
    gsap.set(lensRef.current, {
      x: Math.max(0, Math.min(r.width - lw, x * r.width - lw / 2)),
      y: Math.max(0, Math.min(r.height - lh, y * r.height - lh / 2)),
    });
    gsap.set(resultRef.current, {
      backgroundPosition: `${x * 100}% ${y * 100}%`,
    });
  }, []);

  const onEnter = useCallback(() => {
    if (window.innerWidth < 1024) return;
    activeRef.current = true;
    gsap.to(lensRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      ease: "back.out(1.5)",
    });
    gsap.to(resultRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.25,
      ease: "expo.out",
    });
  }, []);

  const onLeave = useCallback(() => {
    activeRef.current = false;
    gsap.to(lensRef.current, { opacity: 0, scale: 0.88, duration: 0.18 });
    gsap.to(resultRef.current, { opacity: 0, scale: 0.97, duration: 0.18 });
  }, []);

  return { wrapRef, lensRef, resultRef, onMove, onEnter, onLeave };
}

/* ─────────────────────────────────────────────
   FORMAT HELPERS
───────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const PlantDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { role } = useUserRole();
  const { data: plant = {}, isLoading } = useSinglePlant(id);

  const [qty, setQty] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const pageRef = useRef(null);

  const isOwner = user?.email === plant?.seller?.email;
  const isOutOfStock = plant?.quantity === 0;
  const isAdmin = role === "admin";
  const isFlagged = plant?.status === "flagged";
  const ac = CATEGORY_HUE[plant?.category] || CATEGORY_HUE.default;
  const zoom = useLensZoom(plant?.image);

  /* clamp qty to available stock */
  useEffect(() => {
    if (plant?.quantity && qty > plant.quantity) setQty(plant.quantity);
  }, [plant?.quantity, qty]);

  /* ── Entrance animation ── */
  useGSAP(
    () => {
      if (isLoading) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".pd-img-wrap", { opacity: 0, scale: 0.97, duration: 0.8 }, 0)
        .from(".pd-eyebrow", { y: 12, opacity: 0, duration: 0.65 }, 0.2)
        .from(".pd-title", { yPercent: 100, opacity: 0, duration: 0.9 }, 0.28)
        .from(".pd-meta", { y: 12, opacity: 0, duration: 0.6 }, 0.45)
        .from(".pd-desc", { y: 12, opacity: 0, duration: 0.6 }, 0.52)
        .from(".pd-buy-box", { y: 18, opacity: 0, duration: 0.7 }, 0.58)
        .from(".pd-seller-box", { y: 14, opacity: 0, duration: 0.6 }, 0.65)
        .from(
          ".pd-trust-item",
          { y: 12, opacity: 0, stagger: 0.06, duration: 0.55 },
          0.7,
        );
    },
    { scope: pageRef, dependencies: [isLoading] },
  );

  /* ── Guards ── */
  if (isLoading) return <LoadingSpinner />;
  if (!plant?.name)
    return (
      <div
        className="container-page"
        style={{ paddingTop: 80, paddingBottom: 80, textAlign: "center" }}
      >
        <p
          style={{
            color: "var(--muted-foreground)",
            fontStyle: "italic",
            fontSize: 16,
          }}
        >
          Specimen not found.
        </p>
        <Link
          to="/plants"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
            color: "var(--primary)",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          <TbArrowLeft size={16} /> Browse all plants
        </Link>
      </div>
    );

  const subtotal = (plant.price * qty).toLocaleString();
  const canBuy = !isOwner && !isAdmin && !isOutOfStock && !isFlagged;

  return (
    <main
      ref={pageRef}
      className="container-page"
      style={{ paddingTop: 32, paddingBottom: 80 }}
    >
      {/* ── Back ── */}
      <button
        onClick={() => window.history.back()}
        className="pd-eyebrow"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 28,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--muted-foreground)",
          fontSize: 13,
          fontWeight: 600,
          transition: "color 0.18s",
          padding: 0,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--foreground)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--muted-foreground)")
        }
      >
        <TbArrowLeft size={16} /> Back to Vault
      </button>

      {/*
        LAYOUT STRATEGY:
        ─ Mobile  (< 768):   single column, image on top, content below. NO sticky.
        ─ Tablet  (768–1023): single column still, wider image.
        ─ Desktop (≥ 1024):  2-col grid. Left col is sticky ONLY on desktop.
        Sticky on left col is applied via a className that has no effect on mobile.
      */}
      <div className="pd-outer-grid">
        {/* ════════════════════════
            LEFT — Image + Seller
        ════════════════════════ */}
        <div className="pd-left-col">
          {/* Image */}
          <div
            ref={zoom.wrapRef}
            className="pd-img-wrap"
            onMouseMove={zoom.onMove}
            onMouseEnter={zoom.onEnter}
            onMouseLeave={zoom.onLeave}
            style={{
              position: "relative",
              borderRadius: 22,
              overflow: "hidden",
              border: "1px solid var(--border)",
              background: "var(--secondary)",
              aspectRatio: "4 / 3" /* wide on mobile — nothing collapses */,
              cursor: "default",
              boxShadow: "0 4px 28px rgba(0,0,0,0.07)",
            }}
          >
            <img
              src={plant.image}
              alt={plant.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
                filter: isFlagged ? "grayscale(1) blur(2px)" : "none",
                opacity: isFlagged ? 0.4 : 1,
              }}
            />

            {/* Lens — desktop only, injected via CSS display */}
            <div
              ref={zoom.lensRef}
              className="pd-lens"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 88,
                height: 88,
                borderRadius: "50%",
                border: `2px solid ${ac.color}`,
                background: `${ac.color}0a`,
                opacity: 0,
                pointerEvents: "none",
                zIndex: 10,
              }}
            />

            {/* Category badge */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                display: "flex",
                gap: 7,
              }}
            >
              <span
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${ac.color}44`,
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: ac.color,
                }}
              >
                {plant.category}
              </span>
              {isFlagged && (
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "oklch(0.48 0.22 25)",
                    color: "white",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Restricted
                </span>
              )}
              {isOutOfStock && !isFlagged && (
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "oklch(0.48 0.15 25)",
                    color: "white",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Sold Out
                </span>
              )}
            </div>

            {/* Hover-to-zoom hint — desktop only */}
            <div
              className="pd-zoom-hint"
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                padding: "5px 10px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--border)",
                fontSize: 10,
                fontWeight: 700,
                color: "var(--muted-foreground)",
                letterSpacing: "0.06em",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              🔍 Hover to zoom
            </div>
          </div>

          {/* Zoom result — appears right of image on xl */}
          <div
            ref={zoom.resultRef}
            className="pd-zoom-result"
            style={{
              position: "absolute",
              top: 0,
              left: "calc(100% + 16px)",
              width: 280,
              height: 280,
              borderRadius: 18,
              border: "1px solid var(--border)",
              backgroundImage: `url(${plant.image})`,
              backgroundSize: "350%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "50% 50%",
              opacity: 0,
              pointerEvents: "none",
              zIndex: 50,
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            }}
          />

          {/* ── Seller card ── */}
          <div
            className="pd-seller-box"
            style={{
              marginTop: 14,
              borderRadius: 18,
              border: "1px solid var(--border)",
              background: "var(--card)",
              overflow: "hidden",
            }}
          >
            {/* Seller header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <img
                src={plant.seller?.image}
                alt={plant.seller?.name}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--border)",
                  flexShrink: 0,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--muted-foreground)",
                    marginBottom: 2,
                  }}
                >
                  Listed by
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "var(--foreground)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isOwner ? "You (Your listing)" : plant.seller?.name}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "var(--secondary)",
                  border: "1px solid var(--border)",
                  flexShrink: 0,
                }}
              >
                <TbStar size={11} style={{ color: "oklch(0.62 0.16 80)" }} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "var(--foreground)",
                  }}
                >
                  Verified
                </span>
              </div>
            </div>

            {/* Seller meta */}
            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TbMapPin
                  size={14}
                  style={{ color: "var(--muted-foreground)", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    fontWeight: 500,
                  }}
                >
                  Dhaka, Bangladesh
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TbClock
                  size={14}
                  style={{ color: "var(--muted-foreground)", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    fontWeight: 500,
                  }}
                >
                  Listed {fmtDate(plant.createdAt)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TbPackage
                  size={14}
                  style={{ color: "var(--muted-foreground)", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    fontWeight: 500,
                  }}
                >
                  {plant.quantity > 0
                    ? `${plant.quantity} units in stock`
                    : "Out of stock"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════
            RIGHT — Content
        ════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Category eyebrow */}
          <div
            className="pd-eyebrow"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 999,
                background: ac.light,
                border: `1px solid ${ac.border}`,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: ac.color,
              }}
            >
              <TbLeaf size={11} />
              {plant.category}
            </span>
            {/* Live stock indicator */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 999,
                background: isOutOfStock
                  ? "oklch(0.97 0.03 25)"
                  : "var(--secondary)",
                border: `1px solid ${isOutOfStock ? "oklch(0.88 0.06 25)" : "var(--border)"}`,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: isOutOfStock ? "var(--destructive)" : "var(--primary)",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: isOutOfStock
                    ? "var(--destructive)"
                    : "var(--primary)",
                  animation: isOutOfStock
                    ? "none"
                    : "pd-blink 2s ease-in-out infinite",
                }}
              />
              {isOutOfStock ? "Out of Stock" : `${plant.quantity} available`}
            </span>
          </div>

          {/* Title */}
          <div style={{ overflow: "hidden" }}>
            <h1
              className="pd-title"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(2rem, 5vw, 3.6rem)",
                fontWeight: 900,
                fontStyle: "italic",
                letterSpacing: "-0.035em",
                lineHeight: 0.95,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              {plant.name}
            </h1>
          </div>

          {/* Price */}
          <div
            className="pd-meta"
            style={{ display: "flex", alignItems: "baseline", gap: 6 }}
          >
            <span
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "var(--foreground)",
                lineHeight: 1,
              }}
            >
              ৳{plant.price?.toLocaleString()}
            </span>
            <span
              style={{
                fontSize: 13,
                color: "var(--muted-foreground)",
                fontWeight: 600,
              }}
            >
              / specimen
            </span>
          </div>

          {/* Description */}
          <p
            className="pd-desc"
            style={{
              fontSize: 15,
              lineHeight: 1.78,
              color: "var(--muted-foreground)",
              fontWeight: 500,
              borderLeft: "2px solid var(--border)",
              paddingLeft: 14,
              margin: 0,
            }}
          >
            {plant.description}
          </p>

          {/* ── BUY BOX ── */}
          <div
            className="pd-buy-box"
            style={{
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: "var(--card)",
              overflow: "hidden",
            }}
          >
            {/* Quantity selector — buyers only */}
            {canBuy && (
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--muted-foreground)",
                      marginBottom: 6,
                    }}
                  >
                    Quantity
                  </p>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: 11,
                      border: "1px solid var(--border)",
                      background: "var(--accent)",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      disabled={qty <= 1}
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      style={{
                        width: 38,
                        height: 38,
                        border: "none",
                        cursor: qty <= 1 ? "not-allowed" : "pointer",
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: qty <= 1 ? "var(--border)" : "var(--foreground)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (qty > 1)
                          e.currentTarget.style.background = "var(--secondary)";
                      }}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <TbMinus size={14} />
                    </button>
                    <span
                      style={{
                        width: 42,
                        textAlign: "center",
                        fontFamily: "'Georgia', serif",
                        fontSize: 16,
                        fontWeight: 900,
                        color: "var(--foreground)",
                        lineHeight: "38px",
                        borderLeft: "1px solid var(--border)",
                        borderRight: "1px solid var(--border)",
                      }}
                    >
                      {qty}
                    </span>
                    <button
                      disabled={qty >= plant.quantity}
                      onClick={() =>
                        setQty((q) => Math.min(plant.quantity, q + 1))
                      }
                      style={{
                        width: 38,
                        height: 38,
                        border: "none",
                        cursor:
                          qty >= plant.quantity ? "not-allowed" : "pointer",
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color:
                          qty >= plant.quantity
                            ? "var(--border)"
                            : "var(--foreground)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (qty < plant.quantity)
                          e.currentTarget.style.background = "var(--secondary)";
                      }}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <TbPlus size={14} />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                {qty > 1 && (
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--muted-foreground)",
                        marginBottom: 4,
                      }}
                    >
                      Subtotal
                    </p>
                    <p
                      style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: 20,
                        fontWeight: 900,
                        color: "var(--foreground)",
                        lineHeight: 1,
                      }}
                    >
                      ৳{subtotal}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CTA area */}
            <div
              style={{
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* Admin */}
              {isAdmin && (
                <button
                  style={{
                    width: "100%",
                    height: 50,
                    borderRadius: 13,
                    cursor: "pointer",
                    border: "1px solid oklch(0.88 0.06 25)",
                    background: "oklch(0.97 0.03 25)",
                    color: "var(--destructive)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--destructive)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "oklch(0.97 0.03 25)";
                    e.currentTarget.style.color = "var(--destructive)";
                  }}
                >
                  <TbTrash size={16} /> Permanently Remove
                </button>
              )}

              {/* Owner */}
              {isOwner && !isAdmin && (
                <LuminousButton
                  to={`/dashboard/update-plant/${plant._id}`}
                  className="w-full"
                >
                  <TbEdit size={16} /> Edit This Listing
                </LuminousButton>
              )}

              {/* Buyer */}
              {!isOwner && !isAdmin && (
                <>
                  <button
                    disabled={isOutOfStock || isFlagged}
                    onClick={() => {
                      if (!user) {
                        setShowAuthPrompt(true);
                        return;
                      }
                      if (canBuy) setOrderOpen(true);
                    }}
                    style={{
                      width: "100%",
                      height: 54,
                      borderRadius: 13,
                      border: "none",
                      cursor:
                        isOutOfStock || isFlagged ? "not-allowed" : "pointer",
                      background:
                        isOutOfStock || isFlagged
                          ? "var(--secondary)"
                          : "var(--primary)",
                      color:
                        isOutOfStock || isFlagged
                          ? "var(--muted-foreground)"
                          : "var(--primary-foreground)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 900,
                      letterSpacing: "0.02em",
                      boxShadow:
                        isOutOfStock || isFlagged
                          ? "none"
                          : "0 4px 18px oklch(0.45 0.12 160 / 0.28)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (canBuy) {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 26px oklch(0.45 0.12 160 / 0.35)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = canBuy
                        ? "0 4px 18px oklch(0.45 0.12 160 / 0.28)"
                        : "none";
                    }}
                  >
                    <TbShoppingCart size={18} />
                    {isFlagged
                      ? "Currently Restricted"
                      : isOutOfStock
                        ? "Currently Unavailable"
                        : qty > 1
                          ? `Order ${qty} Specimens`
                          : "Order Now"}
                  </button>
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    🔒 Secure payment · bKash · Nagad · Cash on Delivery
                  </p>
                </>
              )}


            </div>
          </div>

          {/* ── Trust badges ── */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="pd-trust-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 13px",
                  borderRadius: 13,
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  transition: "border-color 0.18s",
                }}
                onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = ac.border.replace(
                  "0.2)",
                  "0.5)",
                ))
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    flexShrink: 0,
                    background: "var(--secondary)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={15} style={{ color: "var(--primary)" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "var(--foreground)",
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "var(--muted-foreground)",
                      fontWeight: 500,
                      marginTop: 1,
                    }}
                  >
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* end right col */}
      </div>
      {/* end grid */}

      {/* Order modal */}
      {orderOpen && (
        <OrderModal
          plant={plant}
          quantity={qty}
          onClose={() => setOrderOpen(false)}
          user={user}
        />
      )}

      {showAuthPrompt && (
        <div className="pd-auth-overlay">
          <div className="pd-auth-modal">
            <h3>🌿 Continue your order</h3>

            <p>
              Sign in to place your order, track delivery, and save your favorites.
            </p>

            <div className="pd-auth-actions">
              <Link
                to="/login"
                className="pd-auth-btn primary"
                onClick={() => setShowAuthPrompt(false)}
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="pd-auth-btn"
                onClick={() => setShowAuthPrompt(false)}
              >
                Create Account
              </Link>
            </div>

            <button
              className="pd-auth-close"
              onClick={() => setShowAuthPrompt(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Responsive layout + keyframes ── */}
      <style>{`
        @keyframes pd-blink {
          0%,100% { opacity:1; box-shadow:0 0 6px oklch(0.45 0.12 160 / 0.5); }
          50%      { opacity:.4; box-shadow:none; }
        }

        /* ── Outer grid ── */
        .pd-outer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          align-items: start;
        }

        /* Tablet+ : side by side */
        @media (min-width: 768px) {
          .pd-outer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (min-width: 1024px) {
          .pd-outer-grid {
            grid-template-columns: 460px 1fr;
            gap: 52px;
          }
          /* Sticky ONLY on desktop where content is tall enough */
          .pd-left-col {
            position: sticky;
            top: 84px;  /* clears the navbar */
          }
          /* Zoom result needs relative parent */
          .pd-outer-grid {
            position: relative;
          }
        }

        @media (min-width: 1280px) {
          .pd-outer-grid {
            grid-template-columns: 500px 1fr;
          }
          .pd-left-col {
            position: relative;  /* so zoom result positions correctly */
          }
        }

        /* Mobile: wider image ratio, no lens */
        @media (max-width: 767px) {
          .pd-img-wrap { aspect-ratio: 4 / 3 !important; border-radius: 16px !important; }
          .pd-lens     { display: none !important; }
          .pd-zoom-hint { display: none !important; }
          .pd-zoom-result { display: none !important; }
        }

        /* Hide zoom ui on non-desktop */
        @media (max-width: 1023px) {
          .pd-lens        { display: none !important; }
          .pd-zoom-hint   { display: none !important; }
          .pd-zoom-result { display: none !important; }
        }

        .pd-auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.pd-auth-modal {
  width: 92%;
  max-width: 380px;
  padding: 28px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  text-align: center;
  position: relative;
}

.pd-auth-modal h3 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 10px;
}

.pd-auth-modal p {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.pd-auth-actions {
  display: flex;
  gap: 10px;
}

.pd-auth-btn {
  flex: 1;
  padding: 11px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-weight: 700;
  text-decoration: none;
  text-align: center;
}

.pd-auth-btn.primary {
  background: var(--primary);
  color: white;
  border: none;
}

.pd-auth-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
      `}</style>
    </main>
  );
};

export default PlantDetails;
