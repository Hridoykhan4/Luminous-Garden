import { useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import {
  TbEdit,
  TbTrash,
  TbEye,
  TbAlertTriangle,
  TbLeaf,
  TbArrowUpRight,
} from "react-icons/tb";
import useUserRole from "@/hooks/useUserRole";
import useAuth from "@/hooks/useAuth";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import toast from "react-hot-toast";

/* ── NEXT-LEVEL BOTANICAL ACCENTS ── */
const CATEGORY_ACCENT = {
  Indoor: {
    color: "oklch(0.45 0.08 220)", // Deep, legible Blue
    bg: "oklch(0.96 0.02 220)", // Soft, tinted White
    border: "oklch(0.45 0.08 220 / 0.15)",
    glow: "oklch(0.45 0.08 220 / 0.08)",
  },
  Outdoor: {
    color: "oklch(0.42 0.09 150)", // Deep Forest Green
    bg: "oklch(0.96 0.02 150)", // Soft, tinted White
    border: "oklch(0.42 0.09 150 / 0.15)",
    glow: "oklch(0.42 0.09 150 / 0.08)",
  },
  Flowering: {
    color: "oklch(0.48 0.12 15)", // Sophisticated Rose/Muted Red
    bg: "oklch(0.97 0.02 15)", // Soft, tinted White
    border: "oklch(0.48 0.12 15 / 0.15)",
    glow: "oklch(0.48 0.12 15 / 0.08)",
  },
  default: {
    color: "var(--primary)",
    bg: "var(--secondary)",
    border: "var(--border)",
    glow: "rgba(0,0,0,0.05)",
  },
};

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
          e.currentTarget.style.boxShadow = `0 8px 32px ${accent.glow}`;
        }}
        onMouseLeave={(e) => {
          onLeave();
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          style={{
            width: 140,
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

        <div
          style={{
            flex: 1,
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 140 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  padding: "4px 12px",
                  borderRadius: 6,
                  background: accent.bg,
                  color: accent.color,
                  border: `1px solid ${accent.border}`,
                }}
              >
                {plant.category}
              </span>
              {isOutOfStock && !isFlagged && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "oklch(0.5 0.15 25)",
                    padding: "4px 12px",
                    borderRadius: 6,
                    background: "oklch(0.98 0.01 25)",
                    border: "1px solid oklch(0.5 0.15 25 / 0.15)",
                  }}
                >
                  Sold Out
                </span>
              )}
            </div>
            <h3
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: 20,
                fontWeight: 900,
                color: "var(--foreground)",
                fontStyle: "italic",
                lineHeight: 1.2,
                marginBottom: 4,
              }}
            >
              {plant.name}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--muted-foreground)",
                fontWeight: 500,
              }}
            >
              Listed by {plant.seller?.name}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                  opacity: 0.7,
                }}
              >
                Price
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: "var(--foreground)",
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
      }}
      onMouseEnter={(e) => {
        onEnter();
        e.currentTarget.style.borderColor = accent.color;
        e.currentTarget.style.boxShadow = `0 20px 40px ${accent.glow}, 0 4px 12px rgba(0,0,0,0.05)`;
      }}
      onMouseLeave={(e) => {
        onLeave();
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 240,
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

        <div
          ref={shineRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "60%",
            height: "100%",
            background:
              "linear-gradient(105deg, transparent, rgba(255,255,255,0.2), transparent)",
            transform: "translateX(-100%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "5px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
              color: accent.color,
              border: `1px solid ${accent.color}44`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {plant.category}
          </span>
          {isOutOfStock && !isFlagged && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "5px 12px",
                borderRadius: 8,
                background: "oklch(0.5 0.15 25)",
                color: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              Sold Out
            </span>
          )}
        </div>

        {isFlagged && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "oklch(0.5 0.22 25 / 0.1)",
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                background: "oklch(0.5 0.22 25)",
                color: "white",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                boxShadow: "0 8px 24px oklch(0.5 0.22 25 / 0.4)",
              }}
            >
              <TbAlertTriangle size={16} />
              Restricted
            </div>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 14,
            padding: "6px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <span
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: 18,
              fontWeight: 900,
              color: "#1a1a1a",
            }}
          >
            ৳{plant.price.toLocaleString()}
          </span>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: 24,
              fontWeight: 900,
              lineHeight: 1.1,
              color: "var(--foreground)",
              fontStyle: "italic",
              marginBottom: 6,
            }}
          >
            {plant.name}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: accent.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${accent.border}`,
              }}
            >
              <TbLeaf size={12} style={{ color: accent.color }} />
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--muted-foreground)",
              }}
            >
              {isOwner ? "Your listing" : plant.seller?.name}
            </span>
            {plant.quantity > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--muted-foreground)",
                  opacity: 0.8,
                }}
              >
                {plant.quantity} in stock
              </span>
            )}
          </div>
        </div>

        <ActionButton
          plant={plant}
          isAdmin={isAdmin}
          isOwner={isOwner}
          isFlagged={isFlagged}
          handleTerminate={handleTerminate}
        />
      </div>

      <style>{`
        @keyframes lg-pulse-icon { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
};

const ActionButton = ({
  plant,
  isAdmin,
  isOwner,
  isFlagged,
  handleTerminate,
  compact,
}) => {
  const btnBase = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    height: compact ? 40 : 50,
    padding: compact ? "0 20px" : "0",
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
          background: isFlagged ? "var(--muted)" : "oklch(0.55 0.22 25 / 0.1)",
          color: isFlagged ? "var(--muted-foreground)" : "oklch(0.55 0.22 25)",
          border: `1px solid ${isFlagged ? "var(--border)" : "oklch(0.55 0.22 25 / 0.2)"}`,
          opacity: isFlagged ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isFlagged) {
            e.currentTarget.style.background = "oklch(0.55 0.22 25)";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.transform = "scale(1.02)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isFlagged) {
            e.currentTarget.style.background = "oklch(0.55 0.22 25 / 0.1)";
            e.currentTarget.style.color = "oklch(0.55 0.22 25)";
            e.currentTarget.style.transform = "scale(1)";
          }
        }}
      >
        <TbTrash size={16} />
        {isFlagged ? "Restricted" : "Restrict Specimen"}
      </button>
    );
  }

  if (isOwner) {
    return (
      <Link
        to={`/dashboard/update-plant/${plant._id}`}
        style={{
          ...btnBase,
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--foreground)";
          e.currentTarget.style.color = "var(--background)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--card)";
          e.currentTarget.style.color = "var(--foreground)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <TbEdit size={16} />
        Edit Asset
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
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
      }}
    >
      <TbEye size={16} />
      Examine Specimen
      <TbArrowUpRight size={14} style={{ opacity: 0.7 }} />
    </Link>
  );
};

export default PlantCard;
