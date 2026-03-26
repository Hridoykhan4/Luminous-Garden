/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbX, TbCheck, TbCreditCard, TbCash,
  TbChevronRight, TbChevronLeft,
  TbMapPin, TbPhone, TbNotes, TbUser,
  TbLoader2, TbChevronDown, TbSearch,
} from "react-icons/tb";
import useCreateOrder from "@/hooks/useCreateOrder";
import coverageData, { REGIONS } from "@/utils/Coveragedata";


const STEPS = ["Review", "Delivery", "Payment"];

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", sub: "Pay when your plant arrives", icon: TbCash, available: true },
  { id: "stripe", label: "Card Payment", sub: "Visa · Mastercard · AMEX", icon: TbCreditCard, available: true },
  {
    id: "bkash", label: "bKash", sub: "Mobile banking payment",
    icon: () => <span style={{ fontSize: 11, fontWeight: 900, color: "#E2136E" }}>bKash</span>,
    available: true,
  },
];

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
const OrderModal = ({ plant, quantity, onClose, user }) => {
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const totalPrice = (plant.price * quantity).toLocaleString();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState(null);

  /* ── Address state ── */
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [houseAddress, setHouseAddress] = useState("");
  const [areaSearch, setAreaSearch] = useState("");

  const districts = useMemo(() =>
    coverageData.filter(e => !selectedRegion || e.region === selectedRegion),
    [selectedRegion]
  );
  const selectedEntry = useMemo(() =>
    coverageData.find(e => e.district === selectedDistrict) || null,
    [selectedDistrict]
  );
  const filteredAreas = useMemo(() => {
    if (!selectedEntry) return [];
    return selectedEntry.covered_area.filter(a =>
      a.toLowerCase().includes(areaSearch.toLowerCase())
    );
  }, [selectedEntry, areaSearch]);

  const fullAddress = [houseAddress.trim(), selectedArea, selectedDistrict]
    .filter(Boolean).join(", ");

  /* ── Form state ── */
  const [form, setForm] = useState({
    name: user?.displayName || "",
    phone: user?.phoneNumber || "",
    note: "",
    payment: "cod",
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const { mutateAsync: placeOrder, isPending: loading } = useCreateOrder();

  const canProceed = [
    form.name.trim().length > 1 && form.phone.trim().replace(/\D/g, "").length >= 10,
    selectedDistrict && selectedArea && houseAddress.trim().length > 3,
    !!form.payment,
  ][step];

  useGSAP(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22 });
    gsap.fromTo(sheetRef.current,
      { y: "100%", opacity: 0 },
      { y: "0%", opacity: 1, duration: 0.42, ease: "expo.out" },
    );
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const closeSheet = () => {
    gsap.to(sheetRef.current, { y: "100%", opacity: 0, duration: 0.28, ease: "expo.in" });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.22, onComplete: onClose });
  };

  const goStep = dir => {
    gsap.to(".om-content", {
      x: dir > 0 ? -28 : 28, opacity: 0, duration: 0.15,
      onComplete: () => {
        setStep(s => s + dir);
        gsap.fromTo(".om-content",
          { x: dir > 0 ? 28 : -28, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.2, ease: "expo.out" },
        );
      },
    });
  };

  const handleConfirm = async () => {
    try {
      const result = await placeOrder({
        plantId: plant._id, quantity,
        customer: { name: form.name, phone: form.phone, photo: user?.photoURL || "" },
        delivery: {
          address: fullAddress,
          area: selectedArea,
          district: selectedDistrict,
          region: selectedRegion,
          coords: selectedEntry?.coords || null,
          note: form.note,
        },
        payment: { method: form.payment },
      });
      setOrderId(result.orderId);
      gsap.to(".om-content", {
        opacity: 0, y: -12, duration: 0.2,
        onComplete: () => setDone(true),
      });
    } catch { /* handled by hook */ }
  };

  return (
    <div ref={backdropRef} onClick={e => e.target === backdropRef.current && closeSheet()} style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,0.52)", backdropFilter: "blur(5px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div ref={sheetRef} style={{
        width: "100%", maxWidth: 560, borderRadius: "24px 24px 0 0",
        background: "var(--card)", border: "1px solid var(--border)", borderBottom: "none",
        boxShadow: "0 -20px 70px rgba(0,0,0,0.22)",
        maxHeight: "94svh", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 2 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 14px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 2 }}>Secure Order</p>
            <p style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 900, fontStyle: "italic", color: "var(--foreground)" }}>{plant.name}</p>
          </div>
          <button onClick={closeSheet} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--border)", background: "var(--accent)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--secondary)"; e.currentTarget.style.color = "var(--foreground)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
          ><TbX size={15} /></button>
        </div>

        {/* Step indicator */}
        {!done && (
          <div style={{ display: "flex", alignItems: "center", padding: "12px 20px 8px" }}>
            {STEPS.map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: i <= step ? "var(--primary)" : "var(--secondary)", border: i <= step ? "none" : "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                    {i < step
                      ? <TbCheck size={12} color="white" />
                      : <span style={{ fontSize: 9, fontWeight: 900, color: i === step ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{ fontSize: 10, fontWeight: i === step ? 800 : 500, color: i === step ? "var(--foreground)" : "var(--muted-foreground)" }}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: i < step ? "var(--primary)" : "var(--border)", margin: "0 8px", transition: "background 0.3s" }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "6px 20px 10px" }}>
          {done ? (
            <SuccessView plant={plant} quantity={quantity} form={{ ...form, address: fullAddress, area: selectedArea }} totalPrice={totalPrice} orderId={orderId} />
          ) : (
            <div className="om-content">

              {/* STEP 0 — Review + Contact */}
              {step === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
                  <div style={{ display: "flex", gap: 12, padding: 14, borderRadius: 14, background: "var(--secondary)", border: "1px solid var(--border)" }}>
                    <img src={plant.image} alt={plant.name} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Georgia', serif", fontSize: 15, fontWeight: 900, fontStyle: "italic", color: "var(--foreground)", marginBottom: 3 }}>{plant.name}</p>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, marginBottom: 5 }}>{plant.category} · {quantity} unit{quantity > 1 ? "s" : ""}</p>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>৳{plant.price?.toLocaleString()} × {quantity}</span>
                        <span style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 900, color: "var(--foreground)" }}>৳{totalPrice}</span>
                      </div>
                    </div>
                  </div>
                  <OMLabel>Your Contact</OMLabel>
                  <Field icon={TbUser} label="Full Name" value={form.name} onChange={set("name")} placeholder="Your full name" />
                  <Field icon={TbPhone} label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" type="tel" />
                </div>
              )}

              {/* STEP 1 — Enforced address */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
                  <div style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 12, background: "oklch(0.95 0.04 160)", border: "1px solid oklch(0.86 0.06 160)" }}>
                    <TbMapPin size={14} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: "oklch(0.38 0.10 160)", fontWeight: 600, lineHeight: 1.5 }}>
                      Select your exact area to ensure accurate, fresh delivery across Bangladesh.
                    </p>
                  </div>

                  <OMLabel>Division & District</OMLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={lblStyle}>Division</label>
                      <SelectBox value={selectedRegion} onChange={v => { setSelectedRegion(v); setSelectedDistrict(""); setSelectedArea(""); }} placeholder="Division" options={REGIONS.map(r => ({ value: r, label: r }))} />
                    </div>
                    <div>
                      <label style={lblStyle}>District</label>
                      <SelectBox value={selectedDistrict} onChange={v => { setSelectedDistrict(v); setSelectedArea(""); }} placeholder={selectedRegion ? "District" : "Select division first"} options={districts.map(d => ({ value: d.district, label: d.district }))} disabled={!selectedRegion} />
                    </div>
                  </div>

                  {selectedDistrict && (
                    <div>
                      <label style={lblStyle}>Area / Upazila</label>
                      <div style={{ position: "relative", marginBottom: 8 }}>
                        <TbSearch size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
                        <input value={areaSearch} onChange={e => setAreaSearch(e.target.value)} placeholder={`Search in ${selectedDistrict}…`}
                          style={{ width: "100%", boxSizing: "border-box", height: 36, paddingLeft: 30, paddingRight: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--accent)", color: "var(--foreground)", fontSize: 12, fontWeight: 500, outline: "none" }}
                          onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.10)"; }}
                          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                        />
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 130, overflowY: "auto" }}>
                        {filteredAreas.map(area => (
                          <button key={area} onClick={() => setSelectedArea(area)} style={{
                            padding: "5px 11px", borderRadius: 999, cursor: "pointer", fontSize: 11, fontWeight: 700,
                            border: selectedArea === area ? "1px solid var(--primary)" : "1px solid var(--border)",
                            background: selectedArea === area ? "var(--primary)" : "var(--card)",
                            color: selectedArea === area ? "var(--primary-foreground)" : "var(--foreground)",
                            transition: "all 0.15s",
                          }}>{area}</button>
                        ))}
                        {filteredAreas.length === 0 && <p style={{ fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>No matching areas</p>}
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={lblStyle}>House / Road / Building</label>
                    <div style={{ position: "relative" }}>
                      <TbMapPin size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
                      <input value={houseAddress} onChange={e => setHouseAddress(e.target.value)} placeholder="e.g. House 12, Road 4, Block B"
                        style={{ width: "100%", boxSizing: "border-box", height: 40, paddingLeft: 32, paddingRight: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--accent)", color: "var(--foreground)", fontSize: 13, fontWeight: 500, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s" }}
                        onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.10)"; }}
                        onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>
                  </div>

                  {fullAddress && (
                    <div style={{ padding: "10px 12px", borderRadius: 12, background: "var(--secondary)", border: "1px solid var(--border)" }}>
                      <p style={lblStyle}>Delivery address preview</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.5 }}>{fullAddress}, Bangladesh</p>
                    </div>
                  )}

                  <Field icon={TbNotes} label="Delivery Note (optional)" value={form.note} onChange={set("note")} placeholder="Gate code, call before, leave at door…" multiline />
                </div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
                  <OMLabel>Payment Method</OMLabel>
                  {PAYMENT_METHODS.map(({ id, label, sub, icon: Icon }) => {
                    const selected = form.payment === id;
                    return (
                      <button key={id} onClick={() => setForm(f => ({ ...f, payment: id }))} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 13, width: "100%",
                        border: selected ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                        background: selected ? "var(--secondary)" : "var(--card)",
                        cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: selected ? "var(--primary)" : "var(--accent)", border: selected ? "none" : "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                          <Icon size={17} style={{ color: selected ? "var(--primary-foreground)" : "var(--muted-foreground)" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 800, color: "var(--foreground)", marginBottom: 1 }}>{label}</p>
                          <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>{sub}</p>
                        </div>
                        {selected && <TbCheck size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />}
                      </button>
                    );
                  })}

                  <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--secondary)", border: "1px solid var(--border)", marginTop: 4 }}>
                    <SummaryRow label={`${quantity}× ${plant.name}`} value={`৳${totalPrice}`} />
                    <SummaryRow label="Delivery" value="Free" valueColor="oklch(0.42 0.12 160)" />
                    <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
                    <SummaryRow label="Total" value={`৳${totalPrice}`} bold />
                  </div>
                  <div style={{ display: "flex", gap: 8, padding: "10px 12px", borderRadius: 12, background: "var(--accent)", border: "1px solid var(--border)" }}>
                    <TbMapPin size={13} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, lineHeight: 1.5 }}>{fullAddress}, Bangladesh</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!done ? (
          <div style={{ padding: "12px 20px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 9, background: "var(--card)" }}>
            {step > 0 && (
              <button onClick={() => goStep(-1)} style={{ height: 50, padding: "0 16px", borderRadius: 13, border: "1px solid var(--border)", background: "var(--accent)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--muted-foreground)", flexShrink: 0, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--secondary)"; e.currentTarget.style.color = "var(--foreground)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
              ><TbChevronLeft size={15} /> Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => canProceed && goStep(1)} disabled={!canProceed} style={{ flex: 1, height: 50, borderRadius: 13, border: "none", cursor: canProceed ? "pointer" : "not-allowed", background: canProceed ? "var(--primary)" : "var(--secondary)", color: canProceed ? "var(--primary-foreground)" : "var(--muted-foreground)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 14, fontWeight: 900, boxShadow: canProceed ? "0 4px 18px oklch(0.45 0.12 160 / 0.25)" : "none", transition: "all 0.15s" }}>
                Continue <TbChevronRight size={15} />
              </button>
            ) : (
              <button onClick={handleConfirm} disabled={!canProceed || loading} style={{ flex: 1, height: 50, borderRadius: 13, border: "none", cursor: (canProceed && !loading) ? "pointer" : "not-allowed", background: (canProceed && !loading) ? "var(--primary)" : "var(--secondary)", color: (canProceed && !loading) ? "var(--primary-foreground)" : "var(--muted-foreground)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 14, fontWeight: 900, boxShadow: (canProceed && !loading) ? "0 4px 18px oklch(0.45 0.12 160 / 0.25)" : "none", transition: "all 0.15s" }}>
                {loading ? <><TbLoader2 size={16} style={{ animation: "om-spin 0.8s linear infinite" }} /> Placing…</> : <><TbCheck size={16} /> Confirm · ৳{totalPrice}</>}
              </button>
            )}
          </div>
        ) : (
          <div style={{ padding: "12px 20px 24px", borderTop: "1px solid var(--border)" }}>
            <button onClick={closeSheet} style={{ width: "100%", height: 50, borderRadius: 13, border: "none", cursor: "pointer", background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 14, fontWeight: 900, boxShadow: "0 4px 18px oklch(0.45 0.12 160 / 0.25)" }}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes om-spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
};

/* ─── SelectBox ─── */
const SelectBox = ({ value, onChange, placeholder, options, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const sel = options.find(o => o.value === value);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => !disabled && setOpen(v => !v)} style={{
        width: "100%", height: 40, boxSizing: "border-box", padding: "0 10px 0 12px", borderRadius: 10,
        border: "1px solid var(--border)", background: disabled ? "var(--accent)" : "var(--card)",
        color: sel ? "var(--foreground)" : "var(--muted-foreground)",
        fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        opacity: disabled ? 0.55 : 1, transition: "border-color 0.15s", textAlign: "left",
      }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = "var(--primary)"; }}
        onMouseLeave={e => { if (!disabled) e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sel ? sel.label : placeholder}</span>
        <TbChevronDown size={14} style={{ flexShrink: 0, color: "var(--muted-foreground)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 500, borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 8px 28px rgba(0,0,0,0.12)", maxHeight: 200, overflowY: "auto", padding: 4 }}>
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "none", background: opt.value === value ? "var(--secondary)" : "transparent", color: opt.value === value ? "var(--primary)" : "var(--foreground)", fontSize: 12, fontWeight: opt.value === value ? 800 : 600, cursor: "pointer", textAlign: "left", transition: "background 0.12s" }}
              onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = "var(--accent)"; }}
              onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = "transparent"; }}
            >{opt.label}</button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Success ─── */
const SuccessView = ({ plant, quantity, form, totalPrice, orderId }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 0 20px", textAlign: "center" }}>
    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 0 0 8px oklch(0.92 0.04 160 / 0.45)", animation: "om-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>
      <TbCheck size={26} style={{ color: "var(--primary)" }} />
    </div>
    <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 900, fontStyle: "italic", color: "var(--foreground)", marginBottom: 8 }}>Order Placed! 🌱</h2>
    <p style={{ color: "var(--muted-foreground)", fontSize: 14, lineHeight: 1.65, maxWidth: 280, marginBottom: 20 }}>
      {quantity} specimen{quantity > 1 ? "s" : ""} of <strong>{plant.name}</strong> heading to{" "}<strong>{form.area || "your address"}</strong>.
      {form.payment === "cod" ? " Pay cash on arrival." : ""}
    </p>
    <div style={{ width: "100%", padding: "14px 16px", borderRadius: 14, background: "var(--secondary)", border: "1px solid var(--border)", marginBottom: 10 }}>
      <SummaryRow label={`${quantity}× ${plant.name}`} value={`৳${totalPrice}`} />
      <SummaryRow label="Payment" value={form.payment === "cod" ? "Cash on Delivery" : form.payment === "stripe" ? "Card" : "bKash"} />
      <SummaryRow label="Delivery to" value={form.address} />
      {orderId && <><div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} /><SummaryRow label="Order ID" value={`#${String(orderId).slice(-6).toUpperCase()}`} /></>}
    </div>
    <style>{`@keyframes om-pop { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
  </div>
);

/* ─── Shared helpers ─── */
const lblStyle = { fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-foreground)", display: "block", marginBottom: 5 };
const OMLabel = ({ children }) => <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-foreground)", margin: "2px 0 2px" }}>{children}</p>;
const SummaryRow = ({ label, value, valueColor, bold }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
    <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: bold ? 800 : 600 }}>{label}</span>
    <span style={{ fontSize: bold ? 16 : 12, fontWeight: bold ? 900 : 700, color: valueColor || "var(--foreground)", fontFamily: bold ? "'Georgia', serif" : "inherit" }}>{value}</span>
  </div>
);
const Field = ({ icon: Icon, label, value, onChange, placeholder, type = "text", multiline = false }) => (
  <div>
    <label style={lblStyle}>{label}</label>
    <div style={{ position: "relative" }}>
      <Icon size={13} style={{ position: "absolute", left: 11, pointerEvents: "none", top: multiline ? 11 : "50%", transform: multiline ? "none" : "translateY(-50%)", color: "var(--muted-foreground)" }} />
      {multiline ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
          style={{ width: "100%", boxSizing: "border-box", paddingLeft: 32, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--accent)", color: "var(--foreground)", fontSize: 13, fontWeight: 500, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.55, transition: "border-color 0.15s, box-shadow 0.15s" }}
          onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: "100%", height: 40, boxSizing: "border-box", paddingLeft: 32, paddingRight: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--accent)", color: "var(--foreground)", fontSize: 13, fontWeight: 500, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s" }}
          onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
      )}
    </div>
  </div>
);

export default OrderModal;