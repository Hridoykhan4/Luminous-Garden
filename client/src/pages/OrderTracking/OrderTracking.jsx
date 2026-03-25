import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
    TbArrowLeft, TbLeaf, TbCheck, TbTruckDelivery,
    TbPackage, TbX, TbMapPin, TbRefresh, TbClockHour4,
} from "react-icons/tb";
import useTracking from "@/hooks/useTracking";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";

/* ─────────────────────────────────────────────
   STATUS CONFIG  (same as MyOrders — could extract to shared)
───────────────────────────────────────────── */
const STATUS_CFG = {
    pending: { label: "Order Placed", color: "oklch(0.62 0.16 80)", icon: TbPackage },
    confirmed: { label: "Confirmed", color: "oklch(0.50 0.16 250)", icon: TbCheck },
    shipped: { label: "Out for Delivery", color: "oklch(0.48 0.14 220)", icon: TbTruckDelivery },
    delivered: { label: "Delivered", color: "oklch(0.42 0.14 160)", icon: TbLeaf },
    cancelled: { label: "Cancelled", color: "oklch(0.48 0.15 25)", icon: TbX },
};

const ALL_STEPS = ["pending", "confirmed", "shipped", "delivered"];

/* ─────────────────────────────────────────────
   GEOCODE (Nominatim — OSM, free, no key)
───────────────────────────────────────────── */
async function geocode(address) {
    try {
        const q = encodeURIComponent(`${address}, Bangladesh`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
            headers: { "Accept-Language": "en", "User-Agent": "luminous-garden-app" },
        });
        const data = await res.json();
        if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch { }
    return null;
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const OrderTracking = () => {
    const { orderId } = useParams();
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const pageRef = useRef(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(false);

    const { data: tracking, isLoading, refetch, isFetching } = useTracking(orderId);

    /* ── Page entrance ── */
    useGSAP(() => {
        if (isLoading) return;
        gsap.from(".trk-animate", {
            y: 24, opacity: 0, stagger: 0.08, duration: 0.75, ease: "expo.out",
        });
    }, { scope: pageRef, dependencies: [isLoading] });

    /* ── Build Leaflet map ── */
    useEffect(() => {
        if (!tracking || !mapRef.current) return;
        if (mapInstanceRef.current) return; // already initialized

        let map;

        const initMap = async () => {
            try {
                /* Dynamic import — Leaflet is in your package.json? If not: npm i leaflet */
                const L = (await import("leaflet")).default;

                /* Fix default marker icon (Vite asset path issue) */
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                });

                /* Default: center of Dhaka */
                const defaultCenter = [23.8103, 90.4125];
                map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(defaultCenter, 11);

                /* OSM tile layer — completely free */
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(map);

                mapInstanceRef.current = map;

                /* Geocode delivery address */
                const deliveryAddress = `${tracking.delivery.address} ${tracking.delivery.area}`;
                const deliveryCoords = await geocode(deliveryAddress);

                /* Custom icons */
                const destIcon = L.divIcon({
                    html: `<div style="background:var(--primary);width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">📦</div>`,
                    className: "", iconSize: [28, 28], iconAnchor: [14, 14],
                });
                const sellerIcon = L.divIcon({
                    html: `<div style="background:oklch(0.50 0.16 250);width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">🌿</div>`,
                    className: "", iconSize: [24, 24], iconAnchor: [12, 12],
                });

                /* Delivery marker */
                if (deliveryCoords) {
                    const marker = L.marker([deliveryCoords.lat, deliveryCoords.lng], { icon: destIcon })
                        .addTo(map)
                        .bindPopup(`
              <div style="font-family:sans-serif;padding:4px 0;">
                <strong style="font-size:13px;">Delivery Address</strong><br/>
                <span style="font-size:11px;color:#666;">${tracking.delivery.address}, ${tracking.delivery.area}</span>
              </div>
            `);
                    map.setView([deliveryCoords.lat, deliveryCoords.lng], 13);
                    marker.openPopup();
                }

                /* Seller marker (approximate — geocode seller area "Dhaka") */
                const sellerCoords = await geocode("Dhaka, Bangladesh");
                if (sellerCoords) {
                    L.marker([sellerCoords.lat, sellerCoords.lng], { icon: sellerIcon })
                        .addTo(map)
                        .bindPopup(`<div style="font-family:sans-serif;padding:4px 0;"><strong>Seller: ${tracking.seller.name}</strong></div>`);

                    /* Draw a dashed route line if we have both points */
                    if (deliveryCoords) {
                        L.polyline(
                            [[sellerCoords.lat, sellerCoords.lng], [deliveryCoords.lat, deliveryCoords.lng]],
                            { color: "oklch(0.45 0.12 160)", weight: 2.5, dashArray: "8, 8", opacity: 0.65 }
                        ).addTo(map);

                        /* Fit bounds to show both markers */
                        map.fitBounds([
                            [sellerCoords.lat, sellerCoords.lng],
                            [deliveryCoords.lat, deliveryCoords.lng],
                        ], { padding: [40, 40] });
                    }
                }

                setMapLoading(false);
            } catch (err) {
                console.error("Map error:", err);
                setMapError(true);
                setMapLoading(false);
            }
        };

        initMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [tracking]);

    if (isLoading) return <LoadingSpinner />;
    if (!tracking) return (
        <div className="container-page" style={{ paddingTop: 64, textAlign: "center" }}>
            <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>Tracking data not found.</p>
            <Link to="/dashboard" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none", display: "block", marginTop: 16 }}>← Dashboard</Link>
        </div>
    );

    const isCancelled = tracking.currentStatus === "cancelled";
    const currentStepIdx = ALL_STEPS.indexOf(tracking.currentStatus);

    return (
        <main ref={pageRef} className="container-page" style={{ paddingTop: 32, paddingBottom: 80 }}>

            {/* Back */}
            <button
                onClick={() => window.history.back()}
                className="trk-animate"
                style={{
                    display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28,
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--muted-foreground)", fontSize: 13, fontWeight: 600, padding: 0,
                    transition: "color 0.18s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--foreground)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--muted-foreground)"}
            >
                <TbArrowLeft size={16} /> Back to Orders
            </button>

            {/* Page header */}
            <div className="trk-animate" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
                <div>
                    <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 4 }}>
                        Order Tracking
                    </p>
                    <h1 style={{
                        fontFamily: "'Georgia', serif", fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                        fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.03em",
                        color: "var(--foreground)", margin: 0,
                    }}>
                        {tracking.plantName}
                    </h1>
                    <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4, fontWeight: 500 }}>
                        Order ID: #{String(orderId).slice(-8).toUpperCase()}
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Current status badge */}
                    {(() => {
                        const cfg = STATUS_CFG[tracking.currentStatus] || STATUS_CFG.pending;
                        return (
                            <span style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "7px 16px", borderRadius: 999, fontSize: 11, fontWeight: 900,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                                background: `${cfg.color}18`, color: cfg.color,
                                border: `1px solid ${cfg.color}33`,
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, animation: tracking.currentStatus === "shipped" ? "trk-pulse 1.5s ease-in-out infinite" : "none" }} />
                                {cfg.label}
                            </span>
                        );
                    })()}
                    <button onClick={() => refetch()} style={{
                        width: 36, height: 36, borderRadius: 10,
                        border: "1px solid var(--border)", background: "var(--card)",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--muted-foreground)",
                        animation: isFetching ? "trk-spin 1s linear infinite" : "none",
                    }}>
                        <TbRefresh size={15} />
                    </button>
                </div>
            </div>

            {/* ─── 2-col layout ─── */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 24,
            }} className="trk-grid">

                {/* LEFT: map + plant info */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* MAP */}
                    <div className="trk-animate" style={{ position: "relative" }}>
                        {/* Inject leaflet CSS */}
                        <link
                            rel="stylesheet"
                            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                            crossOrigin=""
                        />

                        <div
                            ref={mapRef}
                            style={{
                                width: "100%", height: 320, borderRadius: 20,
                                border: "1px solid var(--border)",
                                background: "var(--secondary)",
                                overflow: "hidden",
                                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                            }}
                        />

                        {mapLoading && (
                            <div style={{
                                position: "absolute", inset: 0, borderRadius: 20,
                                background: "var(--card)", display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", gap: 10,
                                border: "1px solid var(--border)",
                            }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--primary)", borderTopColor: "transparent", animation: "trk-spin 0.9s linear infinite" }} />
                                <p style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>Loading map…</p>
                            </div>
                        )}

                        {mapError && (
                            <div style={{
                                position: "absolute", inset: 0, borderRadius: 20,
                                background: "var(--card)", display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", gap: 8,
                                border: "1px solid var(--border)",
                            }}>
                                <TbMapPin size={32} style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
                                <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 }}>Map unavailable</p>
                            </div>
                        )}

                        {/* Map legend */}
                        {!mapLoading && !mapError && (
                            <div style={{
                                position: "absolute", bottom: 12, left: 12,
                                display: "flex", gap: 10, padding: "7px 12px", borderRadius: 10,
                                background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
                                border: "1px solid var(--border)", zIndex: 1000,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <span>🌿</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)" }}>Seller</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <span>📦</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)" }}>Your address</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Plant + delivery info card */}
                    <div className="trk-animate" style={{
                        borderRadius: 18, border: "1px solid var(--border)", background: "var(--card)", overflow: "hidden",
                    }}>
                        <div style={{ display: "flex", gap: 14, padding: 16, borderBottom: "1px solid var(--border)" }}>
                            <img src={tracking.plantImage} alt={tracking.plantName}
                                style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 900, fontStyle: "italic", color: "var(--foreground)", marginBottom: 3 }}>
                                    {tracking.plantName}
                                </p>
                                <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
                                    Seller: {tracking.seller.name}
                                </p>
                            </div>
                        </div>

                        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                            <InfoRow icon={TbMapPin} label="Delivery to" value={`${tracking.delivery.address}, ${tracking.delivery.area}`} />
                            <InfoRow icon={TbClockHour4} label="Ordered on" value={new Date(tracking.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
                            {tracking.delivery.note && (
                                <InfoRow icon={TbPackage} label="Note" value={tracking.delivery.note} />
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: progress steps + timeline */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Progress stepper — horizontal on mobile, vertical on desktop */}
                    {!isCancelled && (
                        <div className="trk-animate" style={{
                            borderRadius: 18, border: "1px solid var(--border)", background: "var(--card)",
                            padding: 20,
                        }}>
                            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 18 }}>
                                Delivery Progress
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                {ALL_STEPS.map((step, idx) => {
                                    const cfg = STATUS_CFG[step];
                                    const Icon = cfg.icon;
                                    const completed = idx < currentStepIdx;
                                    const active = idx === currentStepIdx;
                                    const upcoming = idx > currentStepIdx;

                                    return (
                                        <div key={step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                            {/* Icon + connector */}
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: "50%",
                                                    background: completed ? "var(--primary)" : active ? cfg.color : "var(--accent)",
                                                    border: upcoming ? "2px solid var(--border)" : "none",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    transition: "all 0.3s",
                                                    boxShadow: active ? `0 0 0 4px ${cfg.color}22` : "none",
                                                }}>
                                                    {completed
                                                        ? <TbCheck size={16} color="white" />
                                                        : <Icon size={16} color={upcoming ? "var(--border)" : "white"} />
                                                    }
                                                </div>
                                                {idx < ALL_STEPS.length - 1 && (
                                                    <div style={{
                                                        width: 2, height: 28,
                                                        background: completed ? "var(--primary)" : "var(--border)",
                                                        transition: "background 0.3s",
                                                        borderRadius: 1,
                                                    }} />
                                                )}
                                            </div>

                                            {/* Label */}
                                            <div style={{ paddingTop: 7, paddingBottom: idx < ALL_STEPS.length - 1 ? 14 : 0 }}>
                                                <p style={{
                                                    fontSize: 13, fontWeight: active ? 900 : 700,
                                                    color: upcoming ? "var(--muted-foreground)" : active ? cfg.color : "var(--foreground)",
                                                    marginBottom: 2,
                                                }}>
                                                    {cfg.label}
                                                </p>
                                                {active && (
                                                    <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>
                                                        In progress
                                                    </p>
                                                )}
                                                {completed && (
                                                    <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>
                                                        Completed
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Timeline ── */}
                    <div className="trk-animate" style={{
                        borderRadius: 18, border: "1px solid var(--border)", background: "var(--card)",
                        padding: 20,
                    }}>
                        <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 18 }}>
                            Activity Timeline
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            {[...tracking.events].reverse().map((event, idx) => {
                                const cfg = STATUS_CFG[event.status] || STATUS_CFG.pending;
                                const Icon = cfg.icon;
                                const isLast = idx === tracking.events.length - 1;

                                return (
                                    <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                        {/* Dot + line */}
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                            <div style={{
                                                width: 30, height: 30, borderRadius: "50%",
                                                background: `${cfg.color}18`, border: `1px solid ${cfg.color}44`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <Icon size={14} style={{ color: cfg.color }} />
                                            </div>
                                            {!isLast && (
                                                <div style={{ width: 1, height: 24, background: "var(--border)", borderRadius: 1 }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{ paddingTop: 4, paddingBottom: isLast ? 0 : 16, flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 800, color: "var(--foreground)", marginBottom: 2 }}>
                                                {event.title}
                                            </p>
                                            <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500, marginBottom: 3, lineHeight: 1.5 }}>
                                                {event.description}
                                            </p>
                                            <p style={{ fontSize: 10, color: "var(--muted-foreground)", fontWeight: 700, letterSpacing: "0.04em" }}>
                                                {new Date(event.timestamp).toLocaleString("en-GB", {
                                                    day: "numeric", month: "short",
                                                    hour: "2-digit", minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive grid */}
            <style>{`
        @keyframes trk-spin  { to { transform: rotate(360deg); } }
        @keyframes trk-pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 currentColor} 50%{opacity:.7;box-shadow:0 0 0 4px transparent} }

        @media (min-width: 900px) {
          .trk-grid { grid-template-columns: 1fr 400px !important; align-items: start; }
        }
        @media (min-width: 768px) {
          .trk-grid { grid-template-columns: 1fr 380px !important; }
          [ref=mapRef] { height: 420px !important; }
        }
      `}</style>
        </main>
    );
};

/* ─────────────────────────────────────────────
   HELPER
───────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Icon size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: 1 }} />
        <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)", display: "block", marginBottom: 1 }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.5 }}>{value}</span>
        </div>
    </div>
);

export default OrderTracking;