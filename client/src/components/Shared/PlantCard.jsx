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
  TbPackage,
} from "react-icons/tb";
import useUserRole from "@/hooks/useUserRole";
import useAuth from "@/hooks/useAuth";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   ACCENT MAP  (light-mode-safe, dark-mode-safe)
───────────────────────────────────────────── */
const ACCENT = {
  Indoor: {
    color: "oklch(0.42 0.10 220)",
    light: "oklch(0.95 0.025 220)",
    border: "oklch(0.42 0.10 220 / 0.18)",
    glow: "oklch(0.42 0.10 220 / 0.10)",
  },
  Outdoor: {
    color: "oklch(0.40 0.11 148)",
    light: "oklch(0.95 0.025 148)",
    border: "oklch(0.40 0.11 148 / 0.18)",
    glow: "oklch(0.40 0.11 148 / 0.10)",
  },
  Flowering: {
    color: "oklch(0.46 0.13 15)",
    light: "oklch(0.97 0.02 15)",
    border: "oklch(0.46 0.13 15 / 0.18)",
    glow: "oklch(0.46 0.13 15 / 0.10)",
  },
  Succulent: {
    color: "oklch(0.50 0.11 60)",
    light: "oklch(0.96 0.025 60)",
    border: "oklch(0.50 0.11 60 / 0.18)",
    glow: "oklch(0.50 0.11 60 / 0.10)",
  },
  default: {
    color: "var(--primary)",
    light: "var(--secondary)",
    border: "var(--border)",
    glow: "rgba(0,0,0,0.04)",
  },
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
  const ac = ACCENT[plant?.category] || ACCENT.default;

  /* ── GSAP hover ── */
  const onEnter = () => {
    gsap.to(cardRef.current, { y: -6, duration: 0.4, ease: "power3.out" });
    gsap.to(imgRef.current, { scale: 1.07, duration: 1.1, ease: "power2.out" });
    gsap.to(shineRef.current, {
      x: "130%",
      duration: 0.55,
      ease: "power2.inOut",
    });
  };
  const onLeave = () => {
    gsap.to(cardRef.current, { y: 0, duration: 0.4, ease: "power3.out" });
    gsap.to(imgRef.current, { scale: 1, duration: 0.75, ease: "power2.out" });
    gsap.set(shineRef.current, { x: "-110%" });
  };

  /* ── Terminate ── */
  const handleTerminate = async () => {
    if (!window.confirm("Restrict this plant from public view?")) return;
    try {
      gsap.to(cardRef.current, {
        filter: "grayscale(1) blur(1px)",
        opacity: 0.5,
        duration: 0.35,
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

  /* ════════════════════════════════
     LIST VIEW — fully responsive
  ════════════════════════════════ */
  if (view === "list") {
    return (
      <div
        ref={cardRef}
        style={{
          display: "grid",
          /* image | content | price+action */
          gridTemplateColumns: "100px 1fr auto",
          gridTemplateRows: "1fr",
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid var(--border)",
          background: "var(--card)",
          transition: "border-color 0.22s, box-shadow 0.22s",
          minHeight: 96,
        }}
        onMouseEnter={(e) => {
          onEnter();
          e.currentTarget.style.borderColor = ac.border.replace(
            "0.18)",
            "0.55)",
          );
          e.currentTarget.style.boxShadow = `0 8px 28px ${ac.glow}`;
        }}
        onMouseLeave={(e) => {
          onLeave();
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Image col */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            gridColumn: "1",
            gridRow: "1",
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
              objectPosition: "center",
              display: "block",
              filter: isFlagged ? "grayscale(1) blur(2px)" : "none",
              opacity: isFlagged ? 0.4 : 1,
              willChange: "transform",
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
                background: "oklch(0.5 0.22 25 / 0.18)",
              }}
            >
              <TbAlertTriangle size={20} color="oklch(0.55 0.22 25)" />
            </div>
          )}
          {/* accent top line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: ac.color,
            }}
          />
        </div>

        {/* Content col */}
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 5,
            overflow: "hidden",
            gridColumn: "2",
            gridRow: "1",
            minWidth: 0,
          }}
        >
          {/* Badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 5,
                background: ac.light,
                color: ac.color,
                border: `1px solid ${ac.border}`,
              }}
            >
              {plant.category}
            </span>
            {isOutOfStock && !isFlagged && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: "oklch(0.97 0.01 25)",
                  color: "oklch(0.48 0.15 25)",
                  border: "1px solid oklch(0.48 0.15 25 / 0.2)",
                }}
              >
                Sold Out
              </span>
            )}
          </div>

          {/* Name */}
          <h3
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(14px, 2vw, 18px)",
              fontWeight: 900,
              fontStyle: "italic",
              color: "var(--foreground)",
              lineHeight: 1.15,
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {plant.name}
          </h3>

          {/* Seller */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted-foreground)",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {isOwner ? "Your listing" : plant.seller?.name}
            {plant.quantity > 0 && !isOutOfStock && (
              <span style={{ marginLeft: 8, opacity: 0.6 }}>
                · {plant.quantity} in stock
              </span>
            )}
          </p>
        </div>

        {/* Price + Action col */}
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 10,
            flexShrink: 0,
            gridColumn: "3",
            gridRow: "1",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
                marginBottom: 2,
                textAlign: "right",
              }}
            >
              Price
            </p>
            <p
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(16px, 2.5vw, 22px)",
                fontWeight: 900,
                color: "var(--foreground)",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              ৳{plant.price.toLocaleString()}
            </p>
          </div>
          <ListActionBtn
            plant={plant}
            isAdmin={isAdmin}
            isOwner={isOwner}
            isFlagged={isFlagged}
            handleTerminate={handleTerminate}
            ac={ac}
          />
        </div>
      </div>
    );
  }

  /* ════════════════════════════════
     GRID VIEW
  ════════════════════════════════ */
  return (
    <div
      ref={cardRef}
      style={{
        borderRadius: 22,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--card)",
        transition: "border-color 0.28s, box-shadow 0.28s",
        position: "relative",
        filter: isFlagged ? "grayscale(0.5)" : "none",
      }}
      onMouseEnter={(e) => {
        onEnter();
        e.currentTarget.style.borderColor = ac.border.replace("0.18)", "0.55)");
        e.currentTarget.style.boxShadow = `0 18px 44px ${ac.glow}, 0 4px 12px rgba(0,0,0,0.06)`;
      }}
      onMouseLeave={(e) => {
        onLeave();
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* ── IMAGE ZONE ── */}
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
            objectPosition: "center 20%",
            display: "block",
            filter: isFlagged ? "grayscale(1) blur(2px)" : "none",
            opacity: isFlagged ? 0.35 : 1,
            willChange: "transform",
          }}
        />

        {/* Shine sweep */}
        <div
          ref={shineRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "55%",
            height: "100%",
            background:
              "linear-gradient(105deg, transparent, rgba(255,255,255,0.18), transparent)",
            transform: "translateX(-110%)",
            pointerEvents: "none",
          }}
        />

        {/* Bottom gradient */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "45%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Accent top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: ac.color,
            opacity: 0.7,
          }}
        />

        {/* Top-left badges */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
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
              borderRadius: 6,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(6px)",
              color: ac.color,
              border: `1px solid ${ac.color}44`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            {plant.category}
          </span>
          {isOutOfStock && !isFlagged && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 6,
                background: "oklch(0.48 0.15 25)",
                color: "white",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
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
              background: "oklch(0.5 0.22 25 / 0.12)",
              backdropFilter: "blur(1.5px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 18px",
                borderRadius: 10,
                background: "oklch(0.48 0.22 25)",
                color: "white",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                boxShadow: "0 6px 20px oklch(0.48 0.22 25 / 0.45)",
              }}
            >
              <TbAlertTriangle size={14} />
              Restricted
            </div>
          </div>
        )}

        {/* Price tag */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            padding: "5px 12px",
            borderRadius: 9,
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.14)",
            border: "1px solid rgba(255,255,255,0.5)",
          }}
        >
          <span
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: 17,
              fontWeight: 900,
              color: "#111",
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
              fontSize: 21,
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "var(--foreground)",
              marginBottom: 7,
            }}
          >
            {plant.name}
          </h3>

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
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: ac.light,
                  border: `1px solid ${ac.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TbLeaf size={10} style={{ color: ac.color }} />
              </div>
            )}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--muted-foreground)",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {isOwner ? "Your listing" : plant.seller?.name}
            </span>
            {plant.quantity > 0 && !isOutOfStock && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--muted-foreground)",
                  opacity: 0.65,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <TbPackage size={11} />
                {plant.quantity}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <GridActionBtn
          plant={plant}
          isAdmin={isAdmin}
          isOwner={isOwner}
          isFlagged={isFlagged}
          handleTerminate={handleTerminate}
          ac={ac}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   GRID ACTION BUTTON
───────────────────────────────────────────── */
const GridActionBtn = ({
  plant,
  isAdmin,
  isOwner,
  isFlagged,
  handleTerminate,
}) => {
  const base = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    width: "100%",
    height: 46,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
  };

  if (isAdmin) {
    return (
      <button
        onClick={handleTerminate}
        disabled={isFlagged}
        style={{
          ...base,
          background: isFlagged
            ? "var(--accent)"
            : "oklch(0.48 0.15 25 / 0.08)",
          color: isFlagged ? "var(--muted-foreground)" : "oklch(0.48 0.15 25)",
          border: `1px solid ${isFlagged ? "var(--border)" : "oklch(0.48 0.15 25 / 0.22)"}`,
          cursor: isFlagged ? "not-allowed" : "pointer",
          opacity: isFlagged ? 0.55 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isFlagged) {
            e.currentTarget.style.background = "oklch(0.48 0.15 25)";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.transform = "scale(1.015)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isFlagged) {
            e.currentTarget.style.background = "oklch(0.48 0.15 25 / 0.08)";
            e.currentTarget.style.color = "oklch(0.48 0.15 25)";
            e.currentTarget.style.transform = "scale(1)";
          }
        }}
      >
        <TbTrash size={15} />
        {isFlagged ? "Restricted" : "Restrict"}
      </button>
    );
  }

  if (isOwner) {
    return (
      <Link
        to={`/dashboard/update-plant/${plant._id}`}
        style={{
          ...base,
          background: "var(--accent)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--foreground)";
          e.currentTarget.style.color = "var(--background)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--accent)";
          e.currentTarget.style.color = "var(--foreground)";
          e.currentTarget.style.transform = "translateY(0)";
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
        ...base,
        background: "var(--primary)",
        color: "var(--primary-foreground)",
        boxShadow: "0 4px 16px var(--primary) / 0.22",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 22px var(--primary) / 0.32";
        e.currentTarget.style.opacity = "0.93";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px var(--primary) / 0.22";
        e.currentTarget.style.opacity = "1";
      }}
    >
      <TbEye size={15} />
      View Specimen
      <TbArrowUpRight size={12} style={{ opacity: 0.7 }} />
    </Link>
  );
};

/* ─────────────────────────────────────────────
   LIST ACTION BUTTON  (compact)
───────────────────────────────────────────── */
const ListActionBtn = ({
  plant,
  isAdmin,
  isOwner,
  isFlagged,
  handleTerminate,
}) => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 34,
    padding: "0 14px",
    borderRadius: 9,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  };

  if (isAdmin) {
    return (
      <button
        onClick={handleTerminate}
        disabled={isFlagged}
        style={{
          ...base,
          background: isFlagged
            ? "var(--accent)"
            : "oklch(0.48 0.15 25 / 0.08)",
          color: isFlagged ? "var(--muted-foreground)" : "oklch(0.48 0.15 25)",
          border: `1px solid ${isFlagged ? "var(--border)" : "oklch(0.48 0.15 25 / 0.2)"}`,
          opacity: isFlagged ? 0.55 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isFlagged) {
            e.currentTarget.style.background = "oklch(0.48 0.15 25)";
            e.currentTarget.style.color = "white";
          }
        }}
        onMouseLeave={(e) => {
          if (!isFlagged) {
            e.currentTarget.style.background = "oklch(0.48 0.15 25 / 0.08)";
            e.currentTarget.style.color = "oklch(0.48 0.15 25)";
          }
        }}
      >
        <TbTrash size={13} />
        {isFlagged ? "Done" : "Restrict"}
      </button>
    );
  }

  if (isOwner) {
    return (
      <Link
        to={`/dashboard/update-plant/${plant._id}`}
        style={{
          ...base,
          background: "var(--accent)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--foreground)";
          e.currentTarget.style.color = "var(--background)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--accent)";
          e.currentTarget.style.color = "var(--foreground)";
        }}
      >
        <TbEdit size={13} />
        Edit
      </Link>
    );
  }

  return (
    <Link
      to={`/plants/${plant._id}`}
      style={{
        ...base,
        background: "var(--primary)",
        color: "var(--primary-foreground)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.88";
        e.currentTarget.style.transform = "scale(1.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <TbEye size={13} />
      View
    </Link>
  );
};

export default PlantCard;
