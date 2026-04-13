import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
    TbArrowLeft,
    TbLeaf,
    TbCheck,
    TbTruckDelivery,
    TbPackage,
    TbX,
    TbMapPin,
    TbRefresh,
    TbClockHour4,
    TbUser,
    TbNotes,
    TbShieldCheck,
} from "react-icons/tb";
import useTracking from "@/hooks/useTracking";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";

/* ─────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────── */
const STATUS_CFG = {
    pending: {
        label: "Order Placed",
        shortLabel: "Placed",
        color: "oklch(0.62 0.16 80)",
        bg: "oklch(0.62 0.16 80 / 0.10)",
        ring: "oklch(0.62 0.16 80 / 0.25)",
        icon: TbPackage,
        step: 0,
    },
    confirmed: {
        label: "Confirmed",
        shortLabel: "Confirmed",
        color: "oklch(0.50 0.16 250)",
        bg: "oklch(0.50 0.16 250 / 0.10)",
        ring: "oklch(0.50 0.16 250 / 0.25)",
        icon: TbShieldCheck,
        step: 1,
    },
    shipped: {
        label: "Out for Delivery",
        shortLabel: "Shipped",
        color: "oklch(0.55 0.18 220)",
        bg: "oklch(0.55 0.18 220 / 0.10)",
        ring: "oklch(0.55 0.18 220 / 0.25)",
        icon: TbTruckDelivery,
        step: 2,
    },
    delivered: {
        label: "Delivered",
        shortLabel: "Delivered",
        color: "oklch(0.42 0.14 160)",
        bg: "oklch(0.42 0.14 160 / 0.10)",
        ring: "oklch(0.42 0.14 160 / 0.25)",
        icon: TbLeaf,
        step: 3,
    },
    cancelled: {
        label: "Cancelled",
        shortLabel: "Cancelled",
        color: "oklch(0.52 0.18 27)",
        bg: "oklch(0.52 0.18 25 / 0.10)",
        ring: "oklch(0.52 0.18 25 / 0.25)",
        icon: TbX,
        step: -1,
    },
};

const ALL_STEPS = ["pending", "confirmed", "shipped", "delivered"];

/* ─────────────────────────────────────
   GEOCODE
───────────────────────────────────── */
async function geocode(address) {
    // Try progressively broader queries until one hits
    const attempts = [
        `${address}, Bangladesh`,
        // Strip the street, try just area + district
        `${address.split(",").slice(-2).join(",").trim()}, Bangladesh`,
        // Last resort: just the district
        `${address.split(",").at(-1).trim()}, Bangladesh`,
    ];

    for (const q of attempts) {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
                { headers: { "Accept-Language": "en", "User-Agent": "luminous-garden-app" } }
            );
            const data = await res.json();
            if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        } catch { 
            //
        }
    }
    return null;
}

/* ─────────────────────────────────────
   FORMAT DATE
───────────────────────────────────── */
function fmtDate(iso) {
    return new Date(iso).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}
function fmtShort(iso) {
    return new Date(iso).toLocaleString("en-GB", {
        day: "numeric", month: "short",
        hour: "2-digit", minute: "2-digit",
    });
}

/* ─────────────────────────────────────
   COMPONENT
───────────────────────────────────── */
const OrderTracking = () => {
    const { orderId } = useParams();
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const pageRef = useRef(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(false);

    const { data: tracking, isLoading, refetch, isFetching } = useTracking(orderId);

    /* ── entrance animation ── */
    useGSAP(() => {
        if (isLoading) return;
        const tl = gsap.timeline();
        tl.from(".ot-header", { y: -20, opacity: 0, duration: 0.6, ease: "expo.out" })
            .from(".ot-card", {
                y: 32, opacity: 0, stagger: 0.09, duration: 0.7, ease: "expo.out",
            }, "-=0.3")
            .from(".ot-step", {
                scale: 0.7, opacity: 0, stagger: 0.07, duration: 0.5, ease: "back.out(2)",
            }, "-=0.5");
    }, { scope: pageRef, dependencies: [isLoading] });

    /* ── Leaflet map ── */
    useEffect(() => {
        if (!tracking || !mapRef.current || mapInstanceRef.current) return;

        const initMap = async () => {
            try {
                const L = (await import("leaflet")).default;
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                });

                const map = L.map(mapRef.current, {
                    zoomControl: false,
                    scrollWheelZoom: false,
                    attributionControl: false,
                }).setView([23.8103, 90.4125], 11);

                L.control.zoom({ position: "topright" }).addTo(map);
                L.control.attribution({ position: "bottomright", prefix: false })
                    .addAttribution('© <a href="https://openstreetmap.org">OSM</a>')
                    .addTo(map);

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
                mapInstanceRef.current = map;

                const deliveryAddr = `${tracking.delivery.address} ${tracking.delivery.area}`;
                const [deliveryCoords, sellerCoords] = await Promise.all([
                    geocode(deliveryAddr),
                    geocode("Dhaka, Bangladesh"),
                ]);

                const mkIcon = (emoji, color) => L.divIcon({
                    html: `<div style="
            background:${color};width:34px;height:34px;border-radius:50%;
            border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.22);
            display:flex;align-items:center;justify-content:center;font-size:15px;
          ">${emoji}</div>`,
                    className: "", iconSize: [34, 34], iconAnchor: [17, 17],
                });

                if (deliveryCoords) {
                    L.marker([deliveryCoords.lat, deliveryCoords.lng], { icon: mkIcon("📦", "oklch(0.45 0.12 160)") })
                        .addTo(map)
                        .bindPopup(`<b style="font-size:12px">Delivery Address</b><br/><span style="font-size:11px;color:#666">${tracking.delivery.address}, ${tracking.delivery.area}</span>`);
                    map.setView([deliveryCoords.lat, deliveryCoords.lng], 13);
                }

                if (sellerCoords) {
                    L.marker([sellerCoords.lat, sellerCoords.lng], { icon: mkIcon("🌿", "oklch(0.50 0.16 250)") })
                        .addTo(map)
                        .bindPopup(`<b style="font-size:12px">Seller: ${tracking.seller.name}</b>`);

                    if (deliveryCoords) {
                        L.polyline([[sellerCoords.lat, sellerCoords.lng], [deliveryCoords.lat, deliveryCoords.lng]], {
                            color: "oklch(0.45 0.12 160)", weight: 2.5, dashArray: "8 10", opacity: 0.7,
                        }).addTo(map);
                        map.fitBounds([[sellerCoords.lat, sellerCoords.lng], [deliveryCoords.lat, deliveryCoords.lng]], { padding: [48, 48] });
                    }
                }

                setMapLoading(false);
            } catch (err) {
                console.error(err);
                setMapError(true);
                setMapLoading(false);
            }
        };

        initMap();
        return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
    }, [tracking]);

    /* ── guards ── */
    if (isLoading) return <LoadingSpinner />;
    if (!tracking) return (
        <div className="container-page" style={{ paddingTop: 80, textAlign: "center" }}>
            <p style={{ color: "var(--color-muted-foreground)", marginBottom: 16 }}>Tracking data not found.</p>
            <Link to="/dashboard" style={{ color: "var(--color-primary)", fontWeight: 700 }}>← Dashboard</Link>
        </div>
    );

    const isCancelled = tracking.currentStatus === "cancelled";
    const currentCfg = STATUS_CFG[tracking.currentStatus] || STATUS_CFG.pending;
    const currentStep = ALL_STEPS.indexOf(tracking.currentStatus);
    const progressPct = isCancelled ? 0 : Math.max(5, (currentStep / (ALL_STEPS.length - 1)) * 100);

    return (
        <main ref={pageRef} className="container-page" style={{ paddingTop: 28, paddingBottom: 80 }}>

            {/* ── LEAFLET CSS ── */}
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />

            {/* ── BACK + HEADER ── */}
            <div className="ot-header" style={{ marginBottom: 28 }}>
                <button
                    onClick={() => window.history.back()}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20,
                        background: "none", border: "none", cursor: "pointer", padding: "6px 0",
                        color: "var(--color-muted-foreground)", fontSize: 13, fontWeight: 600,
                        transition: "color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--color-foreground)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--color-muted-foreground)"}
                >
                    <TbArrowLeft size={15} /> Back to Orders
                </button>

                {/* Hero header card */}
                <div style={{
                    borderRadius: 24, overflow: "hidden",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    boxShadow: "0 2px 24px rgba(0,0,0,0.05)",
                }}>
                    {/* Top stripe with plant image */}
                    <div style={{
                        position: "relative", height: 90, overflow: "hidden",
                        background: `linear-gradient(135deg, ${currentCfg.color}22, ${currentCfg.color}08)`,
                    }}>
                        {/* Blurred plant bg */}
                        <img src={tracking.plantImage} alt=""
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.12, filter: "blur(12px) saturate(2)", transform: "scale(1.1)" }} />
                        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 0%, var(--color-card) 100%)` }} />
                    </div>

                    <div style={{ padding: "0 20px 20px", marginTop: -44, position: "relative" }}>
                        <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
                            {/* Plant image */}
                            <div style={{
                                width: 72, height: 72, borderRadius: 18, overflow: "hidden",
                                border: "3px solid var(--color-card)", flexShrink: 0,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                            }}>
                                <img src={tracking.plantImage} alt={tracking.plantName}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>

                            <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
                                <p style={{
                                    fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase",
                                    color: "var(--color-muted-foreground)", marginBottom: 3,
                                }}>Order Tracking</p>
                                <h1 style={{
                                    fontFamily: "'Georgia', 'Times New Roman', serif",
                                    fontSize: "clamp(1.3rem, 3.5vw, 1.9rem)", fontWeight: 900, fontStyle: "italic",
                                    letterSpacing: "-0.025em", color: "var(--color-foreground)", margin: 0,
                                    lineHeight: 1.1,
                                }}>
                                    {tracking.plantName}
                                </h1>
                                <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontWeight: 600, marginTop: 4 }}>
                                    #{String(orderId).slice(-8).toUpperCase()}
                                </p>
                            </div>

                            {/* Status pill + refresh */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 7,
                                    padding: "8px 14px", borderRadius: 999,
                                    background: currentCfg.bg, color: currentCfg.color,
                                    border: `1.5px solid ${currentCfg.ring}`,
                                    fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase",
                                }}>
                                    <span style={{
                                        width: 7, height: 7, borderRadius: "50%", background: currentCfg.color,
                                        animation: tracking.currentStatus === "shipped" ? "ot-pulse 1.5s ease-in-out infinite" : "none",
                                        flexShrink: 0,
                                    }} />
                                    {currentCfg.label}
                                </span>
                                <button
                                    onClick={() => refetch()}
                                    title="Refresh"
                                    style={{
                                        width: 38, height: 38, borderRadius: 12,
                                        border: "1.5px solid var(--color-border)", background: "var(--color-card)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", color: "var(--color-muted-foreground)",
                                        transition: "all 0.2s",
                                        animation: isFetching ? "ot-spin 0.8s linear infinite" : "none",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "var(--color-accent)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "var(--color-card)"; e.currentTarget.style.color = "var(--color-muted-foreground)"; }}
                                >
                                    <TbRefresh size={16} />
                                </button>
                            </div>
                        </div>

                        {/* ── PROGRESS BAR ── */}
                        {!isCancelled && (
                            <div style={{ marginTop: 20 }}>
                                {/* Step labels */}
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    {ALL_STEPS.map((step, i) => {
                                        const cfg = STATUS_CFG[step];
                                        const done = i <= currentStep;
                                        return (
                                            <div key={step} className="ot-step" style={{
                                                display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === ALL_STEPS.length - 1 ? "flex-end" : "center",
                                                flex: 1,
                                            }}>
                                                <span style={{
                                                    fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                                                    color: done ? cfg.color : "var(--color-muted-foreground)",
                                                    transition: "color 0.3s",
                                                }}>
                                                    {cfg.shortLabel}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Track */}
                                <div style={{ position: "relative", height: 6, borderRadius: 999, background: "var(--color-border)", overflow: "visible" }}>
                                    {/* Fill */}
                                    <div style={{
                                        position: "absolute", left: 0, top: 0, bottom: 0,
                                        width: `${progressPct}%`,
                                        background: `linear-gradient(90deg, var(--color-primary), ${currentCfg.color})`,
                                        borderRadius: 999, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                                    }} />
                                    {/* Dots */}
                                    {ALL_STEPS.map((step, i) => {
                                        const pct = (i / (ALL_STEPS.length - 1)) * 100;
                                        const done = i < currentStep;
                                        const active = i === currentStep;
                                        const cfg = STATUS_CFG[step];
                                        const Icon = cfg.icon;
                                        return (
                                            <div key={step} style={{
                                                position: "absolute", top: "50%",
                                                left: `${pct}%`, transform: "translate(-50%, -50%)",
                                                width: active ? 22 : 14, height: active ? 22 : 14,
                                                borderRadius: "50%",
                                                background: done || active ? cfg.color : "var(--color-card)",
                                                border: done || active ? "none" : "2px solid var(--color-border)",
                                                boxShadow: active ? `0 0 0 4px ${cfg.ring}, 0 2px 8px rgba(0,0,0,0.12)` : done ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "all 0.3s ease",
                                                zIndex: 2,
                                            }}>
                                                {(done || active) && <Icon size={active ? 11 : 8} color="white" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MAIN GRID ── */}
            <div className="ot-grid">

                {/* ── LEFT COLUMN ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* MAP CARD */}
                    <div className="ot-card" style={{
                        borderRadius: 20, overflow: "hidden",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-card)",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                    }}>
                        <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <TbMapPin size={14} style={{ color: "var(--color-primary)" }} />
                                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-foreground)" }}>
                                    Live Route
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <LegendDot emoji="🌿" label="Seller" />
                                <LegendDot emoji="📦" label="Your address" />
                            </div>
                        </div>

                        <div style={{ position: "relative" }}>
                            <div ref={mapRef} style={{ width: "100%", height: 280 }} />

                            {mapLoading && (
                                <div style={{
                                    position: "absolute", inset: 0,
                                    background: "var(--color-card)", display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center", gap: 10,
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%",
                                        border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)",
                                        animation: "ot-spin 0.9s linear infinite",
                                    }} />
                                    <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", fontWeight: 600 }}>Loading map…</p>
                                </div>
                            )}

                            {mapError && !mapLoading && (
                                <div style={{
                                    position: "absolute", inset: 0,
                                    background: "var(--color-card)", display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center", gap: 8,
                                }}>
                                    <TbMapPin size={32} style={{ color: "var(--color-muted-foreground)", opacity: 0.3 }} />
                                    <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", fontWeight: 600 }}>Map unavailable</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DELIVERY INFO CARD */}
                    <div className="ot-card" style={{
                        borderRadius: 20, border: "1px solid var(--color-border)", background: "var(--color-card)",
                        overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                    }}>
                        <SectionHeader icon={TbMapPin} title="Delivery Details" />
                        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                            <InfoRow icon={TbMapPin} label="Deliver to"
                                value={`${tracking.delivery.address}, ${tracking.delivery.area}`} />
                            <InfoRow icon={TbClockHour4} label="Ordered on" value={fmtDate(tracking.createdAt)} />
                            {tracking.delivery.note && (
                                <InfoRow icon={TbNotes} label="Delivery note" value={tracking.delivery.note} />
                            )}
                        </div>
                    </div>

                    {/* PEOPLE CARD */}
                    <div className="ot-card" style={{
                        borderRadius: 20, border: "1px solid var(--color-border)", background: "var(--color-card)",
                        overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                    }}>
                        <SectionHeader icon={TbUser} title="People" />
                        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                            {/* Customer */}
                            <PersonRow
                                photo={tracking.customer.photo}
                                name={tracking.customer.name}
                                meta={tracking.customer.email}
                                tag="Customer"
                                tagColor="oklch(0.50 0.16 250)"
                            />
                            <div style={{ height: 1, background: "var(--color-border)" }} />
                            {/* Seller */}
                            <PersonRow
                                initials={tracking.seller.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                                name={tracking.seller.name}
                                meta={tracking.seller.email}
                                tag="Seller"
                                tagColor="oklch(0.42 0.14 160)"
                            />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* PROGRESS STEPS */}
                    {!isCancelled && (
                        <div className="ot-card" style={{
                            borderRadius: 20, border: "1px solid var(--color-border)", background: "var(--color-card)",
                            overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                        }}>
                            <SectionHeader icon={TbTruckDelivery} title="Delivery Progress" />
                            <div style={{ padding: "14px 16px 16px" }}>
                                {ALL_STEPS.map((step, idx) => {
                                    const cfg = STATUS_CFG[step];
                                    const Icon = cfg.icon;
                                    const completed = idx < currentStep;
                                    const active = idx === currentStep;
                                    const upcoming = idx > currentStep;
                                    const isLast = idx === ALL_STEPS.length - 1;

                                    return (
                                        <div key={step} className="ot-step" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                            {/* Icon + connector */}
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                                <div style={{
                                                    width: 38, height: 38, borderRadius: "50%",
                                                    background: completed ? "var(--color-primary)" : active ? cfg.color : "var(--color-accent)",
                                                    border: upcoming ? "2px dashed var(--color-border)" : "none",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    boxShadow: active ? `0 0 0 5px ${cfg.ring}` : "none",
                                                    transition: "all 0.35s",
                                                    flexShrink: 0,
                                                }}>
                                                    {completed
                                                        ? <TbCheck size={16} color="white" />
                                                        : <Icon size={16} color={upcoming ? "var(--color-border)" : "white"} />
                                                    }
                                                </div>
                                                {!isLast && (
                                                    <div style={{
                                                        width: 2, height: 30,
                                                        background: completed
                                                            ? "var(--color-primary)"
                                                            : "linear-gradient(var(--color-border), transparent)",
                                                        borderRadius: 2, margin: "3px 0",
                                                        transition: "background 0.3s",
                                                    }} />
                                                )}
                                            </div>

                                            {/* Label */}
                                            <div style={{ paddingTop: 8, paddingBottom: isLast ? 0 : 18, flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <p style={{
                                                        fontSize: 13, fontWeight: active ? 900 : 700, margin: 0,
                                                        color: upcoming ? "var(--color-muted-foreground)" : active ? cfg.color : "var(--color-foreground)",
                                                    }}>
                                                        {cfg.label}
                                                    </p>
                                                    {active && (
                                                        <span style={{
                                                            fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                                                            padding: "2px 8px", borderRadius: 999,
                                                            background: cfg.bg, color: cfg.color,
                                                        }}>Now</span>
                                                    )}
                                                    {completed && (
                                                        <span style={{
                                                            fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                                                            padding: "2px 8px", borderRadius: 999,
                                                            background: "oklch(0.45 0.12 160 / 0.1)", color: "var(--color-primary)",
                                                        }}>Done</span>
                                                    )}
                                                </div>
                                                {upcoming && (
                                                    <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontWeight: 500, margin: "2px 0 0" }}>
                                                        Upcoming
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TIMELINE */}
                    <div className="ot-card" style={{
                        borderRadius: 20, border: "1px solid var(--color-border)", background: "var(--color-card)",
                        overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                    }}>
                        <SectionHeader icon={TbClockHour4} title="Activity Timeline" />
                        <div style={{ padding: "14px 16px 16px" }}>
                            {[...tracking.events].reverse().map((event, idx, arr) => {
                                const cfg = STATUS_CFG[event.status] || STATUS_CFG.pending;
                                const Icon = cfg.icon;
                                const isLast = idx === arr.length - 1;

                                return (
                                    <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                        {/* Dot + line */}
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: "50%",
                                                background: cfg.bg, border: `1.5px solid ${cfg.ring}`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <Icon size={14} style={{ color: cfg.color }} />
                                            </div>
                                            {!isLast && (
                                                <div style={{ width: 1.5, height: 28, background: "var(--color-border)", borderRadius: 2, margin: "3px 0" }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{ paddingTop: 5, paddingBottom: isLast ? 0 : 20, flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 800, color: "var(--color-foreground)", margin: "0 0 2px" }}>
                                                {event.title}
                                            </p>
                                            <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontWeight: 500, margin: "0 0 4px", lineHeight: 1.55 }}>
                                                {event.description}
                                            </p>
                                            <p style={{
                                                fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 700,
                                                letterSpacing: "0.04em", margin: 0,
                                            }}>
                                                {fmtShort(event.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── STYLES ── */}
            <style>{`
        @keyframes ot-spin  { to { transform: rotate(360deg); } }
        @keyframes ot-pulse {
          0%,100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; }
          50%      { opacity: .7; box-shadow: 0 0 0 5px transparent; }
        }

        .ot-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }

        @media (min-width: 768px) {
          .ot-grid {
            grid-template-columns: 1fr 360px;
            gap: 20px;
          }
        }

        @media (min-width: 1024px) {
          .ot-grid {
            grid-template-columns: 1fr 400px;
            gap: 24px;
          }
        }
      `}</style>
        </main>
    );
};

/* ─────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
const SectionHeader = ({ icon: Icon, title }) => (
    <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--color-border)",
        display: "flex", alignItems: "center", gap: 7,
    }}>
        <Icon size={13} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
        <span style={{
            fontSize: 10, fontWeight: 900, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "var(--color-foreground)",
        }}>{title}</span>
    </div>
);

// eslint-disable-next-line no-unused-vars
const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{
            width: 28, height: 28, borderRadius: 8, background: "var(--color-accent)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
            <Icon size={13} style={{ color: "var(--color-primary)" }} />
        </div>
        <div style={{ minWidth: 0 }}>
            <span style={{
                display: "block", fontSize: 9, fontWeight: 900, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "var(--color-muted-foreground)", marginBottom: 2,
            }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-foreground)", lineHeight: 1.5 }}>
                {value}
            </span>
        </div>
    </div>
);

const PersonRow = ({ photo, initials, name, meta, tag, tagColor }) => (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {photo ? (
            <img src={photo} alt={name} style={{
                width: 38, height: 38, borderRadius: 12, objectFit: "cover",
                border: "1.5px solid var(--color-border)", flexShrink: 0,
            }} />
        ) : (
            <div style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: `${tagColor}18`, border: `1.5px solid ${tagColor}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 900, color: tagColor, letterSpacing: "-0.02em",
            }}>
                {initials}
            </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "var(--color-foreground)", margin: "0 0 2px" }}>{name}</p>
            <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta}</p>
        </div>
        <span style={{
            fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "4px 10px", borderRadius: 999,
            background: `${tagColor}14`, color: tagColor, border: `1px solid ${tagColor}25`,
            flexShrink: 0,
        }}>{tag}</span>
    </div>
);

const LegendDot = ({ emoji, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 11 }}>{emoji}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-muted-foreground)" }}>{label}</span>
    </div>
);

export default OrderTracking;