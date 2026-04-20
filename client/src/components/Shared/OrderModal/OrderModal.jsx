/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useMemo, forwardRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import * as Select from "@radix-ui/react-select";
import {
  TbX, TbCheck, TbCreditCard, TbCash,
  TbChevronRight, TbChevronLeft, TbChevronDown, TbChevronUp,
  TbMapPin, TbPhone, TbNotes, TbUser,
  TbLoader2, TbAlertCircle, TbShieldCheck, TbTruckDelivery, TbSearch,
} from "react-icons/tb";
import useCreateOrder from "@/hooks/useCreateOrder";
import useStartStripeCheckout from "@/hooks/useStartStripeCheckout";
import coverageData, { REGIONS } from "@/utils/Coveragedata";
import useStartSSLCheckout from "@/hooks/useStartSSLCheckout";

/* ─── Schemas ─── */
const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;
const SCHEMAS = [
  z.object({
    name: z.string().min(2, "At least 2 characters"),
    phone: z.string().regex(BD_PHONE, "Valid Bangladeshi number required (01XXXXXXXXX)"),
  }),
  z.object({
    region: z.string().min(1, "Select your division"),
    district: z.string().min(1, "Select your district"),
    area: z.string().min(1, "Select your area / upazila"),
    house: z.string().min(4, "Enter your house / road address"),
    note: z.string().optional(),
  }),
  z.object({
    payment: z.enum(["cod", "stripe", "bkash"]),
  }),
];

const STEPS = ["Contact", "Delivery", "Payment"];

const PAYMENTS = [
  { id: "cod", label: "Cash on Delivery", sub: "Pay when your plant arrives", icon: TbCash, badge: "Recommended" },
  { id: "stripe", label: "Card Payment", sub: "Visa · Mastercard · AMEX", icon: TbCreditCard, badge: null },
  {
    id: "bkash", label: "bKash", sub: "Mobile banking — fast & secure",
    icon: () => <span style={{ fontWeight: 900, color: "#E2136E", fontSize: 13, letterSpacing: "0.02em" }}>bKash</span>,
    badge: null,
  },
];

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function OrderModal({ plant, quantity, onClose, user }) {
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const totalPrice = (plant.price * quantity).toLocaleString();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showDiscard, setShowDiscard] = useState(false);
  const [stripeReview, setStripeReview] = useState(false);
  const [finalPayload, setFinalPayload] = useState(null);

  const [saved, setSaved] = useState({
    name: user?.displayName || "",
    phone: user?.phoneNumber || "",
    region: "", district: "", area: "", house: "", note: "",
    payment: "cod",
  });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(SCHEMAS[step]),
    defaultValues: saved,
    mode: "onChange",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const wRegion = watch("region");
  const wDistrict = watch("district");
  const wHouse = watch("house");
  const wArea = watch("area");

  const districtOpts = useMemo(() =>
    coverageData.filter(e => !wRegion || e.region === wRegion),
    [wRegion]
  );
  const areaOpts = useMemo(() => {
    const e = coverageData.find(x => x.district === wDistrict);
    return e ? e.covered_area : [];
  }, [wDistrict]);

  const addrPreview = [wHouse, wArea, wDistrict].filter(Boolean).join(", ");

  const { mutateAsync: placeOrder, isPending: placing } = useCreateOrder();
  const { mutateAsync: startStripe, isPending: stripeLoad } = useStartStripeCheckout();
  const {mutateAsync: startSSL} = useStartSSLCheckout()

  useGSAP(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(sheetRef.current, { y: "100%" }, { y: "0%", duration: 0.44, ease: "expo.out" });
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const close = () => {
    gsap.to(sheetRef.current, { y: "100%", duration: 0.3, ease: "expo.in" });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.25, onComplete: onClose });
  };

  /* Backdrop click — only discards if user has started filling */
  const onBackdropClick = (e) => {
    if (e.target !== backdropRef.current) return;
    if (done) { close(); return; }
    const hasProgress = step > 0 || saved.name || saved.phone;
    if (hasProgress) setShowDiscard(true);
    else close();
  };

  const slide = (dir, cb) => {
    gsap.to(".om-slide", {
      x: dir > 0 ? -16 : 16, opacity: 0, duration: 0.12,
      onComplete: () => {
        cb();
        gsap.fromTo(".om-slide", { x: dir > 0 ? 16 : -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2, ease: "expo.out" });
      },
    });
  };

  const onSubmit = (data) => {
    const merged = { ...saved, ...data };
    setSaved(merged);
    if (step < STEPS.length - 1) {
      slide(1, () => setStep(s => s + 1));
    } else {
      placeNow(merged);
    }
  };

  const buildPayload = (data) => {
    const entry = coverageData.find(e => e.district === data.district);
    return {
      plantId: plant._id, quantity,
      customer: { name: data.name, phone: data.phone, email: user?.email || "", photo: user?.photoURL || "" },
      delivery: {
        address: [data.house, data.area, data.district].filter(Boolean).join(", "),
        area: data.area, district: data.district, region: data.region,
        coords: entry?.coords || null, note: data.note || "",
      },
      payment: { method: data.payment },
    };
  };

  const placeNow = async (data) => {
    const payload = buildPayload(data);
    if (data.payment === "stripe") {
      setFinalPayload(payload);
      setStripeReview(true);
      return;
    }
    if(data.payment === 'bkash') {
      const res = await startSSL(payload);
      console.log(res);
      return
    }
    try {
      const res = await placeOrder(payload);
      setOrderId(res.orderId);
      gsap.to(".om-slide", { opacity: 0, y: -8, duration: 0.18, onComplete: () => setDone(true) });
    } catch { 

      //
    }
  };

  const confirmStripe = async () => {
    try {
      const res = await startStripe(finalPayload);
      if (res?.url) window.location.href = res.url;
    } catch { 

      //
    }
  };

  return (
    <>
      {/* Backdrop — pointer events only on the actual bg element */}
      <div ref={backdropRef} className="fixed inset-0 flex items-end justify-center"
        style={{ zIndex: 9000, background: "rgba(0,0,0,0.54)", backdropFilter: "blur(6px)" }}
        onClick={onBackdropClick}
      >
        {/* Sheet — stopPropagation so clicks inside never reach backdrop */}
        <div ref={sheetRef} className="w-full flex flex-col"
          style={{ maxWidth: 560, maxHeight: "96svh", borderRadius: "22px 22px 0 0", background: "var(--card)", border: "1px solid var(--border)", borderBottom: "none", boxShadow: "0 -24px 80px rgba(0,0,0,0.24)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 cursor-pointer"
            onClick={() => { if (done) close(); else { const hp = step > 0 || saved.name || saved.phone; if (hp) setShowDiscard(true); else close(); } }}>
            <div className="w-10 h-1 rounded-full bg-border hover:bg-muted-foreground/40 transition-colors" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-border shrink-0">
            <div>
              <p className="text-detail mb-0.5">Secure Order</p>
              <p className="font-black italic text-foreground text-base" style={{ fontFamily: "'Georgia',serif" }}>{plant.name}</p>
            </div>
            <button type="button"
              onClick={() => { if (done) close(); else setShowDiscard(true); }}
              className="w-9 h-9 rounded-xl border border-border bg-accent flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
              <TbX size={15} />
            </button>
          </div>

          {/* Steps */}
          {!done && (
            <div className="flex items-center px-5 pt-3 pb-2 shrink-0">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 0 }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{ background: i <= step ? "var(--primary)" : "var(--secondary)", border: i <= step ? "none" : "1px solid var(--border)" }}>
                      {i < step
                        ? <TbCheck size={11} color="white" />
                        : <span className="text-[8px] font-black" style={{ color: i === step ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>{i + 1}</span>
                      }
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: i === step ? "var(--foreground)" : "var(--muted-foreground)" }}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 rounded-full transition-colors duration-300"
                      style={{ height: 1, background: i < step ? "var(--primary)" : "var(--border)" }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar px-5 pb-3 pt-1" style={{ minHeight: 0 }}>
            {done ? (
              <SuccessView plant={plant} quantity={quantity} saved={saved} totalPrice={totalPrice} orderId={orderId} />
            ) : (
              <form id="om-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="om-slide">

                  {/* ── Step 0: Contact ── */}
                  {step === 0 && (
                    <div className="flex flex-col gap-4 pt-2">
                      <div className="flex gap-3 p-3.5 rounded-2xl bg-secondary border border-border">
                        <img src={plant.image} alt={plant.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border" />
                        <div className="flex-1 min-w-0">
                          <p className="font-black italic text-foreground text-sm mb-1 truncate" style={{ fontFamily: "'Georgia',serif" }}>{plant.name}</p>
                          <p className="text-xs text-muted-foreground font-semibold mb-2">{plant.category} · {quantity} unit{quantity > 1 ? "s" : ""}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground font-semibold">৳{plant.price?.toLocaleString()} × {quantity}</span>
                            <span className="font-black text-foreground" style={{ fontFamily: "'Georgia',serif", fontSize: 15 }}>৳{totalPrice}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ icon: TbTruckDelivery, t: "Free Delivery" }, { icon: TbShieldCheck, t: "Secure Checkout" }].map(({ icon: I, t }) => (
                          <div key={t} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent border border-border">
                            <I size={13} className="text-primary shrink-0" />
                            <span className="text-[11px] font-semibold text-muted-foreground">{t}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-3">
                        <p className="text-detail">Your Contact</p>
                        <ZField icon={TbUser} label="Full Name" error={errors.name?.message} placeholder="Your full name"    {...register("name")} />
                        <ZField icon={TbPhone} label="Phone Number" error={errors.phone?.message} placeholder="01XXXXXXXXX" type="tel"
                          hint="Bangladeshi number only: 01XXXXXXXXX" {...register("phone")} />
                      </div>
                    </div>
                  )}

                  {/* ── Step 1: Delivery ── */}
                  {step === 1 && (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex gap-2 px-3 py-2.5 rounded-xl"
                        style={{ background: "oklch(0.95 0.04 160)", border: "1px solid oklch(0.86 0.06 160)" }}>
                        <TbMapPin size={13} className="shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
                        <p className="text-xs font-semibold leading-relaxed" style={{ color: "oklch(0.38 0.10 160)" }}>
                          We deliver nationwide. Select your exact location for accurate, fresh delivery.
                        </p>
                      </div>

                      <div>
                        <p className="text-detail mb-2">Division & District</p>
                        <div className="grid grid-cols-2 gap-2.5">
                          <Controller name="region" control={control} render={({ field }) => (
                            <div>
                              <label className="form-label-fancy">Division</label>
                              <RSelect value={field.value} placeholder="Select division"
                                onValueChange={v => { field.onChange(v); setValue("district", ""); setValue("area", ""); }}
                                options={REGIONS.map(r => ({ value: r, label: r }))}
                                error={errors.region?.message} />
                            </div>
                          )} />
                          <Controller name="district" control={control} render={({ field }) => (
                            <div>
                              <label className="form-label-fancy">District</label>
                              <RSelect value={field.value} placeholder="District"
                                onValueChange={v => { field.onChange(v); setValue("area", ""); }}
                                options={districtOpts.map(d => ({ value: d.district, label: d.district }))}
                                disabled={!wRegion}
                                error={errors.district?.message} />
                            </div>
                          )} />
                        </div>
                      </div>

                      {wDistrict && (
                        <Controller name="area" control={control} render={({ field }) => (
                          <div>
                            <label className="form-label-fancy">Area / Upazila</label>
                            <RSelect value={field.value}
                              placeholder={`Search area in ${wDistrict}…`}
                              onValueChange={field.onChange}
                              options={areaOpts.map(a => ({ value: a, label: a }))}
                              searchable
                              error={errors.area?.message} />
                          </div>
                        )} />
                      )}

                      <ZField icon={TbMapPin} label="House / Road / Building"
                        error={errors.house?.message} placeholder="House 12, Road 4, Block B" {...register("house")} />

                      {addrPreview && (
                        <div className="flex gap-2 px-3 py-2.5 rounded-xl bg-secondary border border-border">
                          <TbMapPin size={12} className="text-primary shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-foreground leading-snug">{addrPreview}, Bangladesh</p>
                        </div>
                      )}

                      <div>
                        <label className="form-label-fancy">Delivery Note (optional)</label>
                        <div className="relative">
                          <TbNotes size={12} className="absolute left-3 top-3 text-muted-foreground pointer-events-none" />
                          <textarea {...register("note")} rows={2} placeholder="Gate code, call before, leave at door…"
                            className="w-full resize-none text-xs font-medium rounded-xl border border-border bg-accent text-foreground outline-none leading-relaxed"
                            style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 10, paddingBottom: 10 }}
                            onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.10)"; }}
                            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 2: Payment ── */}
                  {step === 2 && (
                    <div className="flex flex-col gap-3 pt-2">
                      <p className="text-detail">Payment Method</p>
                      <Controller name="payment" control={control} render={({ field }) => (
                        <div className="flex flex-col gap-2">
                          {PAYMENTS.map(({ id, label, sub, icon: Icon, badge }) => {
                            const sel = field.value === id;
                            return (
                              <button key={id} type="button" onClick={() => field.onChange(id)}
                                className="flex items-center gap-3 p-3.5 rounded-2xl w-full text-left transition-all duration-150"
                                style={{ border: sel ? "1.5px solid var(--primary)" : "1px solid var(--border)", background: sel ? "var(--secondary)" : "var(--card)" }}>
                                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-all"
                                  style={{ background: sel ? "var(--primary)" : "var(--accent)", border: sel ? "none" : "1px solid var(--border)" }}>
                                  <Icon size={18} style={{ color: sel ? "var(--primary-foreground)" : "var(--muted-foreground)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-sm font-black text-foreground">{label}</p>
                                    {badge && <span className="text-[8px] font-black uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground">{badge}</span>}
                                  </div>
                                  <p className="text-xs text-muted-foreground font-medium">{sub}</p>
                                </div>
                                {sel && <TbCheck size={15} className="text-primary shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )} />

                      <div className="rounded-2xl bg-secondary border border-border overflow-hidden">
                        <div className="px-4 py-3 flex flex-col gap-1.5">
                          <SR l={`${quantity}× ${plant.name}`} v={`৳${totalPrice}`} />
                          <SR l="Delivery fee" v="Free" green />
                          <div className="h-px bg-border my-1" />
                          <SR l="Total" v={`৳${totalPrice}`} bold />
                        </div>
                        {addrPreview && (
                          <div className="px-4 py-2.5 flex gap-2 border-t border-border bg-card">
                            <TbMapPin size={12} className="text-primary shrink-0 mt-0.5" />
                            <p className="text-[11px] text-muted-foreground font-medium leading-snug">{addrPreview}, Bangladesh</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          {!done ? (
            <div className="px-5 pt-3 pb-6 border-t border-border bg-card flex gap-2.5 shrink-0">
              {step > 0 && (
                <button type="button" onClick={() => slide(-1, () => setStep(s => s - 1))}
                  className="h-12 px-4 rounded-2xl border border-border bg-accent text-muted-foreground font-bold text-sm shrink-0 flex items-center gap-1.5 hover:bg-secondary hover:text-foreground transition-all">
                  <TbChevronLeft size={15} /> Back
                </button>
              )}
              <button type="submit" form="om-form" disabled={placing}
                className="flex-1 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-none"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 4px 20px oklch(0.45 0.12 160 / 0.28)", opacity: placing ? 0.75 : 1, cursor: placing ? "not-allowed" : "pointer" }}>
                {placing
                  ? <><TbLoader2 size={16} className="animate-spin" /> Placing…</>
                  : step < STEPS.length - 1
                    ? <>Continue <TbChevronRight size={15} /></>
                    : <><TbCheck size={16} /> Confirm · ৳{totalPrice}</>
                }
              </button>
            </div>
          ) : (
            <div className="px-5 pt-3 pb-6 border-t border-border shrink-0">
              <button onClick={close}
                className="w-full h-12 rounded-2xl font-black text-sm border-none transition-all"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 4px 20px oklch(0.45 0.12 160 / 0.28)" }}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Discard dialog */}
      {showDiscard && (
        <div className="fixed inset-0 flex items-center justify-center px-5"
          style={{ zIndex: 9500, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", animation: "om-pop 0.28s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            <div>
              <h3 className="font-black text-foreground text-base mb-1">Discard this order?</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">Your progress will be lost.</p>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setShowDiscard(false)}
                className="flex-1 h-11 rounded-xl border border-border bg-accent text-foreground font-bold text-sm hover:bg-secondary transition-all">Keep Going</button>
              <button onClick={() => { setShowDiscard(false); close(); }}
                className="flex-1 h-11 rounded-xl font-black text-sm border-none transition-all"
                style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}>Discard</button>
            </div>
          </div>
        </div>
      )}

      {/* Stripe review */}
      {stripeReview && finalPayload && (
        <StripeReview plant={plant} quantity={quantity} payload={finalPayload}
          loading={stripeLoad} onConfirm={confirmStripe} onBack={() => setStripeReview(false)} />
      )}

      <style>{`
        @keyframes om-pop     { from{transform:scale(0.88);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes om-success { from{transform:scale(0.5);opacity:0}  to{transform:scale(1);opacity:1} }
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────────────
   RADIX SELECT
   Renders in a portal → completely outside the
   sheet scroll container → zero scroll conflict.
───────────────────────────────────────────── */
function RSelect({ value, onValueChange, options, placeholder, disabled, error, searchable }) {
  const [q, setQ] = useState("");
  const shown = (searchable && q) ? options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())) : options;

  return (
    <div>
      <Select.Root value={value} onValueChange={v => { onValueChange(v); setQ(""); }} disabled={disabled}>
        <Select.Trigger
          className="w-full h-10 px-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-1.5 border transition-all outline-none"
          style={{ borderColor: error ? "var(--destructive)" : "var(--border)", background: disabled ? "var(--accent)" : "var(--card)", color: value ? "var(--foreground)" : "var(--muted-foreground)", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
          onFocus={e => { if (!error) e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.10)"; }}
          onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon><TbChevronDown size={13} className="text-muted-foreground shrink-0" /></Select.Icon>
        </Select.Trigger>

        {/* Portal — escapes scroll context entirely */}
        <Select.Portal>
          <Select.Content position="popper" sideOffset={5}
            className="rounded-2xl border border-border overflow-hidden"
            style={{ background: "var(--card)", boxShadow: "0 12px 40px rgba(0,0,0,0.16)", zIndex: 99999, width: "var(--radix-select-trigger-width)", maxHeight: 260 }}
            /* CRITICAL: stop pointer events from bubbling to sheet backdrop */
            onClick={e => e.stopPropagation()}
            onPointerDownOutside={e => e.preventDefault()}
          >
            {searchable && (
              <div className="relative border-b border-border p-1.5">
                <TbSearch size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input value={q} onChange={e => setQ(e.target.value)}
                  placeholder="Search…"
                  className="w-full h-8 bg-accent rounded-lg text-xs font-medium text-foreground outline-none border-0"
                  style={{ paddingLeft: 26, paddingRight: 8 }}
                  onKeyDown={e => e.stopPropagation()} /* prevent Radix keyboard nav on input */
                />
              </div>
            )}
            <Select.ScrollUpButton className="flex items-center justify-center py-1 bg-card text-muted-foreground">
              <TbChevronUp size={13} />
            </Select.ScrollUpButton>
            <Select.Viewport className="custom-scrollbar" style={{ maxHeight: 200 }}>
              {shown.length === 0
                ? <div className="px-3 py-4 text-xs text-muted-foreground text-center italic">No results</div>
                : shown.map(opt => (
                  <Select.Item key={opt.value} value={opt.value}
                    className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold outline-none cursor-pointer transition-colors"
                    style={{ color: "var(--foreground)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Select.ItemText>{opt.label}</Select.ItemText>
                    <Select.ItemIndicator><TbCheck size={12} className="text-primary" /></Select.ItemIndicator>
                  </Select.Item>
                ))
              }
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center py-1 bg-card text-muted-foreground">
              <TbChevronDown size={13} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {error && <Err msg={error} />}
    </div>
  );
}

/* ─── ZField ─── */
const ZField = forwardRef(function ZField({ icon: Icon, label, error, hint, type = "text", placeholder, ...rest }, ref) {
  return (
    <div>
      <label className="form-label-fancy">{label}</label>
      <div className="relative">
        <Icon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input ref={ref} type={type} placeholder={placeholder} {...rest}
          className="w-full h-10 rounded-xl border text-sm font-medium text-foreground bg-accent outline-none transition-all duration-150"
          style={{ paddingLeft: 30, paddingRight: 12, borderColor: error ? "var(--destructive)" : "var(--border)", boxShadow: error ? "0 0 0 2px oklch(0.6 0.18 25 / 0.18)" : "none" }}
          onFocus={e => { if (!error) { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.10)"; } }}
          onBlur={e => { if (!error) { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; } }}
        />
      </div>
      {error ? <Err msg={error} /> : hint ? <p className="mt-1 text-[10px] text-muted-foreground font-medium">{hint}</p> : null}
    </div>
  );
});

const Err = ({ msg }) => (
  <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-destructive">
    <TbAlertCircle size={10} /> {msg}
  </p>
);

const SR = ({ l, v, bold, green }) => (
  <div className="flex items-center justify-between">
    <span className={`text-xs text-muted-foreground font-${bold ? "black" : "semibold"}`}>{l}</span>
    <span className={`text-${bold ? "sm" : "xs"} font-${bold ? "black" : "bold"} ${green ? "text-primary" : "text-foreground"}`}
      style={bold ? { fontFamily: "'Georgia',serif" } : {}}>{v}</span>
  </div>
);

/* ─── Success ─── */
function SuccessView({ plant, quantity, saved, totalPrice, orderId }) {
  return (
    <div className="flex flex-col items-center py-10 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center"
        style={{ boxShadow: "0 0 0 8px oklch(0.92 0.04 160 / 0.4)", animation: "om-success 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <TbCheck size={28} className="text-primary" />
      </div>
      <div>
        <h2 className="font-black italic text-foreground text-xl mb-1.5" style={{ fontFamily: "'Georgia',serif" }}>Order Placed! 🌱</h2>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs">
          {quantity} specimen{quantity > 1 ? "s" : ""} of <strong className="text-foreground">{plant.name}</strong> heading to{" "}
          <strong className="text-foreground">{saved.area || saved.district}</strong>.
          {saved.payment === "cod" ? " Pay cash on arrival." : ""}
        </p>
      </div>
      <div className="w-full rounded-2xl bg-secondary border border-border overflow-hidden">
        <div className="px-4 py-3 flex flex-col gap-1.5">
          <SR l={`${quantity}× ${plant.name}`} v={`৳${totalPrice}`} />
          <SR l="Payment" v={saved.payment === "cod" ? "Cash on Delivery" : saved.payment === "stripe" ? "Card" : "bKash"} />
          <SR l="Delivery fee" v="Free" green />
          <div className="h-px bg-border my-1" />
          <SR l="Total" v={`৳${totalPrice}`} bold />
        </div>
        {orderId && (
          <div className="px-4 py-2.5 border-t border-border bg-card text-center">
            <p className="text-[11px] text-muted-foreground font-semibold">
              Order ID: <span className="font-black text-foreground">#{String(orderId).slice(-8).toUpperCase()}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Stripe Review ─── */
function StripeReview({ plant, quantity, payload, loading, onConfirm, onBack }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center px-5"
      style={{ zIndex: 9600, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4"
        style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", animation: "om-pop 0.28s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <div>
          <p className="text-detail mb-1">Secure Card Checkout</p>
          <h3 className="font-black text-foreground text-base" style={{ fontFamily: "'Georgia',serif" }}>Continue to Stripe</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed mt-1">You'll be redirected to Stripe's secure payment page.</p>
        </div>
        <div className="rounded-2xl bg-secondary border border-border p-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-1">
            <img src={plant.image} alt={plant.name} className="w-12 h-12 rounded-xl object-cover border border-border" />
            <div>
              <p className="text-sm font-black text-foreground">{plant.name}</p>
              <p className="text-xs text-muted-foreground font-medium">{quantity} unit{quantity > 1 ? "s" : ""}</p>
            </div>
          </div>
          {[["Customer", payload.customer?.name], ["Phone", payload.customer?.phone], ["Address", payload.delivery?.address]].map(([l, v]) => (
            <div key={l} className="flex items-start justify-between gap-3">
              <span className="text-xs text-muted-foreground font-medium shrink-0">{l}</span>
              <span className="text-xs font-bold text-foreground text-right">{v}</span>
            </div>
          ))}
          <div className="h-px bg-border my-1" />
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total</span>
            <span className="font-black text-foreground" style={{ fontFamily: "'Georgia',serif", fontSize: 15 }}>৳{(plant.price * quantity).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button onClick={onBack} disabled={loading}
            className="flex-1 h-11 rounded-xl border border-border bg-accent text-sm font-bold text-foreground hover:bg-secondary transition-all">Back</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-11 rounded-xl text-sm font-black border-none transition-all flex items-center justify-center gap-2"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)", opacity: loading ? 0.75 : 1 }}>
            {loading ? <><TbLoader2 size={15} className="animate-spin" /> Redirecting…</> : <>Pay with Card <TbChevronRight size={14} /></>}
          </button>
        </div>
      </div>
    </div>
  );
} 