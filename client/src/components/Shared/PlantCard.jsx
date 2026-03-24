import { useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import {
  TbEdit,
  TbTrash,
  TbEye,
  TbAlertTriangle,
  TbLeaf,
  TbShoppingCart,
  TbArrowUpRight,
} from "react-icons/tb";
import useUserRole from "@/hooks/useUserRole";
import useAuth from "@/hooks/useAuth";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   CATEGORY ACCENT MAP
───────────────────────────────────────────── */
const CATEGORY_ACCENT = {
  Indoor: { color: "oklch(0.62 0.16 220)", bg: "oklch(0.62 0.16 220 / 0.12)" },
  Outdoor: { color: "oklch(0.65 0.18 145)", bg: "oklch(0.65 0.18 145 / 0.12)" },
  Flowering: { color: "oklch(0.68 0.2 340)", bg: "oklch(0.68 0.2 340 / 0.12)" },
  default: { color: "var(--primary)", bg: "var(--secondary)" },
};

/* ─────────────────────────────────────────────
   PLANT CARD
───────────────────────────────────────────── */
const PlantCard = ({ plant, refetch, view = "grid" }) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const axiosSecure = useAxiosSecure();

  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const shineRef = useRef(null);

  const isOwner = user?.email === plant?.seller?.email;
  const isOutOfStock = plant?.quantity === 0;
  const isAdmin = role === "admin";
  const isFlagged = plant?.status === "flagged";
  const accent = CATEGORY_ACCENT[plant?.category] || CATEGORY_ACCENT.default;

  /* ── hover animations ── */
  const onEnter = () => {
    gsap.to(cardRef.current, { y: -8, duration: 0.45, ease: "power3.out" });
    gsap.to(imgRef.current, { scale: 1.08, duration: 1.2, ease: "power2.out" });
    gsap.to(shineRef.current, {
      x: "120%",
      duration: 0.6,
      ease: "power2.inOut",
    });
  };
  const onLeave = () => {
    gsap.to(cardRef.current, { y: 0, duration: 0.45, ease: "power3.out" });
    gsap.to(imgRef.current, { scale: 1, duration: 0.8, ease: "power2.out" });
    gsap.set(shineRef.current, { x: "-100%" });
  };

  /* ── flag / terminate ── */
  const handleTerminate = async () => {
    if (!window.confirm("Restrict this plant from public view?")) return;
    try {
      gsap.to(cardRef.current, {
        filter: "grayscale(1) blur(1px)",
        opacity: 0.55,
        duration: 0.4,
      });
      const { data } = await axiosSecure.patch(`/plants/status/${plant._id}`, {
        status: "flagged",
      });
      if (data.success) {
        toast.success("Asset restricted", { icon: "🚫" });
        refetch?.();
      }
    } catch {
      gsap.to(cardRef.current, { filter: "none", opacity: 1 });
      toast.error("Override failed");
    }
  };

  /* ── LIST VIEW ── */
  if (view === "list") {
    return (
      <div
        ref={cardRef}
        style={{
          display: "flex",
          gap: 0,
          alignItems: "stretch",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid var(--border)",
          background: "var(--card)",
          transition: "border-color 0.25s, box-shadow 0.25s",
          cursor: "default",
        }}
        onMouseEnter={(e) => {
          onEnter();
          e.currentTarget.style.borderColor = accent.color;
          e.currentTarget.style.boxShadow = `0 8px 32px ${accent.color}22`;
        }}
        onMouseLeave={(e) => {
          onLeave();
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Image */}
        <div
          style={{
            width: 120,
            flexShrink: 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            ref={imgRef}
            src={plant.image}
            alt={plant.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: isFlagged ? "grayscale(1) blur(2px)" : "none",
              opacity: isFlagged ? 0.4 : 1,
            }}
          />
          {isFlagged && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "oklch(0.5 0.22 25 / 0.15)",
              }}
            >
              <TbAlertTriangle size={24} color="oklch(0.6 0.22 25)" />
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 140 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: accent.bg,
                  color: accent.color,
                  border: `1px solid ${accent.color}44`,
                }}
              >
                {plant.category}
              </span>
              {isOutOfStock && !isFlagged && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "oklch(0.55 0.22 25)",
                    padding: "3px 9px",
                    borderRadius: 999,
                    background: "oklch(0.55 0.22 25 / 0.1)",
                    border: "1px solid oklch(0.55 0.22 25 / 0.3)",
                  }}
                >
                  Sold Out
                </span>
              )}
            </div>
            <h3
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "var(--foreground)",
                fontStyle: "italic",
                lineHeight: 1.2,
                marginBottom: 3,
              }}
            >
              {plant.name}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "var(--muted-foreground)",
                fontWeight: 600,
              }}
            >
              {plant.seller?.name}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                  marginBottom: 2,
                }}
              >
                Price
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "var(--foreground)",
                  letterSpacing: "-0.03em",
                  fontFamily: "'Georgia', serif",
                }}
              >
                ৳{plant.price.toLocaleString()}
              </div>
            </div>
            <ActionButton
              plant={plant}
              isAdmin={isAdmin}
              isOwner={isOwner}
              isFlagged={isFlagged}
              handleTerminate={handleTerminate}
              compact
            />
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID VIEW (default) ── */
  return (
    <div
      ref={cardRef}
      style={{
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--card)",
        transition: "border-color 0.3s, box-shadow 0.3s",
        cursor: "default",
        position: "relative",
        filter: isFlagged ? "grayscale(0.6)" : "none",
      }}
      onMouseEnter={(e) => {
        onEnter();
        e.currentTarget.style.borderColor = `${accent.color}88`;
        e.currentTarget.style.boxShadow = `0 16px 48px ${accent.color}1a, 0 4px 16px rgba(0,0,0,0.08)`;
      }}
      onMouseLeave={(e) => {
        onLeave();
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* ── IMAGE ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 220,
          overflow: "hidden",
        }}
      >
        <img
          ref={imgRef}
          src={plant.image}
          alt={plant.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: isFlagged ? "grayscale(1) blur(2px)" : "none",
            opacity: isFlagged ? 0.4 : 1,
            willChange: "transform",
          }}
        />

        {/* shine sweep */}
        <div
          ref={shineRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "60%",
            height: "100%",
            background:
              "linear-gradient(105deg, transparent, rgba(255,255,255,0.12), transparent)",
            transform: "translateX(-100%)",
            pointerEvents: "none",
          }}
        />

        {/* gradient overlay for readability */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Top badges */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              color: accent.color,
              border: `1px solid ${accent.color}55`,
            }}
          >
            {plant.category}
          </span>
          {isOutOfStock && !isFlagged && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 999,
                background: "oklch(0.55 0.22 25)",
                color: "white",
              }}
            >
              Sold Out
            </span>
          )}
        </div>

        {/* Flagged overlay */}
        {isFlagged && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "oklch(0.5 0.22 25 / 0.15)",
              backdropFilter: "blur(1px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 16px",
                borderRadius: 10,
                background: "oklch(0.5 0.22 25)",
                color: "white",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                boxShadow: "0 4px 20px oklch(0.5 0.22 25 / 0.4)",
              }}
            >
              <TbAlertTriangle
                size={14}
                style={{ animation: "lg-pulse-icon 1.5s ease-in-out infinite" }}
              />
              Restricted
            </div>
          </div>
        )}

        {/* Price tag — bottom right of image */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            padding: "6px 12px",
            borderRadius: 10,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <span
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: 18,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            ৳{plant.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: "18px 18px 18px" }}>
        {/* Name + seller */}
        <div style={{ marginBottom: 16 }}>
          <h3
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--foreground)",
              fontStyle: "italic",
              marginBottom: 5,
            }}
          >
            {plant.name}
          </h3>

          {/* Seller row */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {plant.seller?.image ? (
              <img
                src={plant.seller.image}
                alt={plant.seller.name}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid var(--border)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: accent.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TbLeaf size={10} style={{ color: accent.color }} />
              </div>
            )}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted-foreground)",
                letterSpacing: "0.02em",
              }}
            >
              {isOwner ? "Your listing" : plant.seller?.name}
            </span>
            {plant.quantity > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "var(--muted-foreground)",
                  letterSpacing: "0.06em",
                }}
              >
                {plant.quantity} left
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <ActionButton
          plant={plant}
          isAdmin={isAdmin}
          isOwner={isOwner}
          isFlagged={isFlagged}
          handleTerminate={handleTerminate}
          accent={accent}
        />
      </div>

      <style>{`
        @keyframes lg-pulse-icon { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ACTION BUTTON (contextual)
───────────────────────────────────────────── */
const ActionButton = ({
  plant,
  isAdmin,
  isOwner,
  isFlagged,
  handleTerminate,
  accent,
  compact,
}) => {
  const btnBase = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    width: "100%",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    transition: "all 0.22s",
    height: compact ? 38 : 46,
    padding: compact ? "0 16px" : "0",
    whiteSpace: "nowrap",
    textDecoration: "none",
  };

  if (isAdmin) {
    return (
      <button
        onClick={handleTerminate}
        disabled={isFlagged}
        style={{
          ...btnBase,
          background: isFlagged
            ? "var(--accent)"
            : "oklch(0.55 0.22 25 / 0.08)",
          color: isFlagged ? "var(--muted-foreground)" : "oklch(0.55 0.22 25)",
          border: `1px solid ${isFlagged ? "var(--border)" : "oklch(0.55 0.22 25 / 0.3)"}`,
          opacity: isFlagged ? 0.5 : 1,
          cursor: isFlagged ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!isFlagged) {
            e.currentTarget.style.background = "oklch(0.55 0.22 25)";
            e.currentTarget.style.color = "white";
          }
        }}
        onMouseLeave={(e) => {
          if (!isFlagged) {
            e.currentTarget.style.background = "oklch(0.55 0.22 25 / 0.08)";
            e.currentTarget.style.color = "oklch(0.55 0.22 25)";
          }
        }}
      >
        <TbTrash size={15} />
        {isFlagged ? "Terminated" : "Terminate"}
      </button>
    );
  }

  if (isOwner) {
    return (
      <Link
        to={`/dashboard/update-plant/${plant._id}`}
        style={{
          ...btnBase,
          background: "var(--secondary)",
          color: "var(--secondary-foreground)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--primary)";
          e.currentTarget.style.color = "var(--primary-foreground)";
          e.currentTarget.style.borderColor = "var(--primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--secondary)";
          e.currentTarget.style.color = "var(--secondary-foreground)";
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      >
        <TbEdit size={15} />
        Edit Listing
      </Link>
    );
  }

  return (
    <Link
      to={`/plants/${plant._id}`}
      style={{
        ...btnBase,
        background: "var(--primary)",
        color: "var(--primary-foreground)",
        boxShadow: `0 4px 18px var(--primary) / 0.25`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.9";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = `0 8px 24px var(--primary) / 0.35`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 18px var(--primary) / 0.25`;
      }}
    >
      <TbEye size={15} />
      View Specimen
      <TbArrowUpRight size={13} style={{ marginLeft: -2 }} />
    </Link>
  );
};

export default PlantCard;
