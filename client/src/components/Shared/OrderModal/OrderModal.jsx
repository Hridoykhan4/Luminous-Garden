/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useMemo, forwardRef } from "react";
import { useForm, Controller } from "react-hook-form";
import useStartStripeCheckout from "@/hooks/useStartStripeCheckout";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbX, TbCheck, TbCreditCard, TbCash,
  TbChevronRight, TbChevronLeft, TbChevronDown,
  TbMapPin, TbPhone, TbNotes, TbUser,
  TbLoader2, TbSearch, TbAlertCircle,
  TbShieldCheck, TbTruckDelivery,
} from "react-icons/tb";
import useCreateOrder from "@/hooks/useCreateOrder";
import coverageData, { REGIONS } from "@/utils/Coveragedata";

/* ─────────────────────────────────────────────
   ZOD SCHEMAS — per step, no over-engineering
───────────────────────────────────────────── */
const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;

const stepSchemas = [
  /* Step 0 — Contact */
  z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(BD_PHONE, "Enter a valid Bangladeshi number (e.g. 01XXXXXXXXX)"),
  }),
  /* Step 1 — Delivery */
  z.object({
    region: z.string().min(1, "Select a division"),
    district: z.string().min(1, "Select a district"),
    area: z.string().min(1, "Select an area / upazila"),
    house: z.string().min(4, "Enter your full house / road address"),
    note: z.string().optional(),
  }),
  /* Step 2 — Payment */
  z.object({
    payment: z.enum(["cod", "stripe", "bkash"]),
  }),
];

const STEPS = ["Review", "Delivery", "Payment"];

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    sub: "Pay when your plant arrives at your door",
    icon: TbCash,
    badge: "Recommended",
  },
  {
    id: "stripe",
    label: "Card Payment",
    sub: "Visa · Mastercard · AMEX",
    icon: TbCreditCard,
    badge: null,
  },
  {
    id: "bkash",
    label: "bKash",
    sub: "Mobile banking — fast & secure",
    icon: () => (
      <span style={{ fontSize: 11, fontWeight: 900, color: "#E2136E", letterSpacing: "0.04em" }}>
        bKash
      </span>
    ),
    badge: null,
  },
];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const OrderModal = ({ plant, quantity, onClose, user }) => {
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripePayload, setStripePayload] = useState(null);
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const totalPrice = (plant.price * quantity).toLocaleString();

  const handleStripeCheckout = async () => {
    try {
      if (!stripePayload) return;

      const res = await startStripeCheckout(stripePayload);
      console.log(res);

      if (res?.url) {
        window.location.href = res.url;
      }
    } catch {
      //
    }
  };

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const { mutateAsync: startStripeCheckout, isPending: stripePending } =
    useStartStripeCheckout();

  const buildOrderPayload = (data) => {
    const coverEntry = coverageData.find((e) => e.district === data.district);

    return {
      plantId: plant._id,
      quantity,
      customer: {
        name: data.name,
        phone: data.phone,
        email: user?.email || "",
        photo: user?.photoURL || "",
      },
      delivery: {
        address: [data.house, data.area, data.district]
          .filter(Boolean)
          .join(", "),
        area: data.area,
        district: data.district,
        region: data.region,
        coords: coverEntry?.coords || null,
        note: data.note || "",
      },
      payment: {
        method: data.payment,
      },
    };
  };

  /* Persist data across steps so going Back doesn't lose state */
  const [saved, setSaved] = useState({
    name: user?.displayName || "",
    phone: user?.phoneNumber || "",
    region: "", district: "", area: "", house: "", note: "",
    payment: "cod",
  });

  const [areaSearch, setAreaSearch] = useState("");

  const {
    register, handleSubmit, control, watch, setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stepSchemas[step]),
    defaultValues: saved,
    mode: "onChange",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchRegion = watch("region");
  const watchDistrict = watch("district");
  const watchArea = watch("area");
  const watchHouse = watch("house");

  const districts = useMemo(() =>
    coverageData.filter(e => !watchRegion || e.region === watchRegion),
    [watchRegion]
  );
  const entry = useMemo(() =>
    coverageData.find(e => e.district === watchDistrict) || null,
    [watchDistrict]
  );
  const areaOptions = useMemo(() => {
    if (!entry) return [];
    const all = entry.covered_area;
    return areaSearch
      ? all.filter(a => a.toLowerCase().includes(areaSearch.toLowerCase()))
      : all;
  }, [entry, areaSearch]);

  const fullAddress = [watchHouse, watchArea, watchDistrict].filter(Boolean).join(", ");

  const { mutateAsync: placeOrder, isPending: submitting } = useCreateOrder();

  /* Mount anim */
  useGSAP(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(sheetRef.current, { y: "100%" }, { y: "0%", duration: 0.44, ease: "expo.out" });
  }, []);

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const animateClose = () => {
    gsap.to(sheetRef.current, { y: "100%", duration: 0.3, ease: "expo.in" });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.25, onComplete: onClose });
  };

  const attemptClose = () => {
    if (done) { animateClose(); return; }
    setConfirmClose(true);
  };

  const transition = (dir, cb) => {
    gsap.to(".om-step", {
      x: dir > 0 ? -20 : 20, opacity: 0, duration: 0.14,
      onComplete: () => {
        cb();
        gsap.fromTo(".om-step",
          { x: dir > 0 ? 20 : -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.2, ease: "expo.out" }
        );
      },
    });
  };

  const onStepSubmit = (data) => {
    const merged = { ...saved, ...data };
    setSaved(merged);
    if (step < STEPS.length - 1) {
      transition(1, () => setStep(s => s + 1));
    } else {
      placeOrderNow(merged);
    }
  };

  const goBack = () => {
    transition(-1, () => setStep(s => s - 1));
  };

  const placeOrderNow = async (data) => {
    try {
      const payload = buildOrderPayload(data);

      if (data.payment === "stripe") {
        setStripePayload(payload);
        setShowStripeModal(true);
        return;
      }

      const result = await placeOrder(payload);

      setOrderId(result.orderId);

      gsap.to(".om-step", {
        opacity: 0,
        y: -8,
        duration: 0.18,
        onComplete: () => setDone(true),
      });
    } catch {
      // handled by hook toast
    }
  };

  return (
    <>
      {showStripeModal && (
        <StripeCheckoutModal
          open={showStripeModal}
          onClose={() => setShowStripeModal(false)}
          onConfirm={handleStripeCheckout}
          loading={stripePending}
          payload={stripePayload}
          plant={plant}
          quantity={quantity}
        />
      )}
      {/* ── Backdrop ── */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-9000 flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        onClick={e => e.target === e.currentTarget && attemptClose()}
      >
        {/* ── Sheet ── */}
        <div
          ref={sheetRef}
          className="w-full flex flex-col"
          style={{
            maxWidth: 560,
            borderRadius: "22px 22px 0 0",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderBottom: "none",
            boxShadow: "0 -24px 80px rgba(0,0,0,0.25)",
            maxHeight: "96svh",
            overflow: "hidden",
          }}
        >
          {/* Drag handle — also closes */}
          <button
            type="button"
            onClick={attemptClose}
            className="flex justify-center pt-3 pb-1 w-full cursor-pointer"
            style={{ background: "transparent", border: "none" }}
            aria-label="Close modal"
          >
            <div className="w-10 h-1 rounded-full bg-border hover:bg-muted-foreground transition-colors" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3.5 border-b border-border">
            <div>
              <p className="text-detail mb-0.5">Secure Order</p>
              <p className="text-base font-black italic text-foreground"
                style={{ fontFamily: "'Georgia',serif" }}>{plant.name}</p>
            </div>
            <button
              type="button"
              onClick={attemptClose}
              className="w-9 h-9 rounded-xl border border-border bg-accent flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <TbX size={15} />
            </button>
          </div>

          {/* Step indicator */}
          {!done && (
            <div className="flex items-center px-5 pt-3 pb-2 gap-0">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 0 }}>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 shrink-0"
                      style={{
                        background: i <= step ? "var(--primary)" : "var(--secondary)",
                        border: i <= step ? "none" : "1px solid var(--border)",
                      }}
                    >
                      {i < step
                        ? <TbCheck size={11} color="white" />
                        : <span className="text-[8px] font-black"
                          style={{ color: i === step ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
                          {i + 1}
                        </span>
                      }
                    </div>
                    <span className="text-[10px] font-bold"
                      style={{ color: i === step ? "var(--foreground)" : "var(--muted-foreground)" }}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 rounded-full transition-colors duration-300"
                      style={{ height: 1, background: i < step ? "var(--primary)" : "var(--border)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-2 custom-scrollbar">
            {done ? (
              <SuccessView
                plant={plant} quantity={quantity}
                saved={saved} totalPrice={totalPrice} orderId={orderId}
              />
            ) : (
              <form id="om-form" onSubmit={handleSubmit(onStepSubmit)} noValidate>
                <div className="om-step">

                  {/* ── STEP 0 — Review + Contact ── */}
                  {step === 0 && (
                    <div className="flex flex-col gap-4 pt-2">
                      {/* Plant card */}
                      <div className="flex gap-3 p-3.5 rounded-2xl bg-secondary border border-border">
                        <img src={plant.image} alt={plant.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border" />
                        <div className="flex-1 min-w-0">
                          <p className="font-black italic text-foreground text-sm mb-1 truncate"
                            style={{ fontFamily: "'Georgia',serif" }}>{plant.name}</p>
                          <p className="text-xs text-muted-foreground font-semibold mb-2">
                            {plant.category} · {quantity} unit{quantity > 1 ? "s" : ""}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground font-semibold">
                              ৳{plant.price?.toLocaleString()} × {quantity}
                            </span>
                            <span className="font-black text-foreground text-sm"
                              style={{ fontFamily: "'Georgia',serif" }}>৳{totalPrice}</span>
                          </div>
                        </div>
                      </div>

                      {/* Trust badges */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: TbTruckDelivery, text: "Free Delivery" },
                          { icon: TbShieldCheck, text: "Secure Checkout" },
                        ].map(({ icon: Icon, text }) => (
                          <div key={text}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent border border-border">
                            <Icon size={13} className="text-primary shrink-0" />
                            <span className="text-[11px] font-semibold text-muted-foreground">{text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Contact */}
                      <div className="flex flex-col gap-3">
                        <p className="text-detail">Your Contact</p>
                        <RHFField
                          icon={TbUser}
                          label="Full Name"
                          error={errors.name?.message}
                          {...register("name")}
                          placeholder="Your full name"
                        />
                        <RHFField
                          icon={TbPhone}
                          label="Phone Number"
                          type="tel"
                          error={errors.phone?.message}
                          hint="Bangladeshi number only (01XXXXXXXXX)"
                          {...register("phone")}
                          placeholder="01XXXXXXXXX"
                        />
                      </div>
                    </div>
                  )}

                  {/* ── STEP 1 — Delivery ── */}
                  {step === 1 && (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex gap-2.5 px-3 py-2.5 rounded-xl"
                        style={{ background: "oklch(0.95 0.04 160)", border: "1px solid oklch(0.86 0.06 160)" }}>
                        <TbMapPin size={14} className="shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
                        <p className="text-xs font-semibold leading-relaxed"
                          style={{ color: "oklch(0.38 0.10 160)" }}>
                          We deliver nationwide. Select your area for accurate delivery routing.
                        </p>
                      </div>

                      {/* Division + District */}
                      <div>
                        <p className="text-detail mb-2">Division & District</p>
                        <div className="grid grid-cols-2 gap-2.5">
                          <Controller name="region" control={control} render={({ field }) => (
                            <div>
                              <label className="form-label-fancy">Division</label>
                              <DropSelect
                                value={field.value}
                                onChange={v => {
                                  field.onChange(v);
                                  setValue("district", ""); setValue("area", ""); setAreaSearch("");
                                }}
                                options={REGIONS.map(r => ({ value: r, label: r }))}
                                placeholder="Division"
                                error={errors.region?.message}
                              />
                            </div>
                          )} />
                          <Controller name="district" control={control} render={({ field }) => (
                            <div>
                              <label className="form-label-fancy">District</label>
                              <DropSelect
                                value={field.value}
                                onChange={v => { field.onChange(v); setValue("area", ""); setAreaSearch(""); }}
                                options={districts.map(d => ({ value: d.district, label: d.district }))}
                                placeholder={watchRegion ? "District" : "Pick division first"}
                                disabled={!watchRegion}
                                error={errors.district?.message}
                              />
                            </div>
                          )} />
                        </div>
                      </div>

                      {/* Area — searchable dropdown, NOT chip wall */}
                      {watchDistrict && (
                        <Controller name="area" control={control} render={({ field }) => (
                          <div>
                            <label className="form-label-fancy">Area / Upazila</label>
                            <DropSelect
                              value={field.value}
                              onChange={v => { field.onChange(v); setAreaSearch(""); }}
                              options={areaOptions.map(a => ({ value: a, label: a }))}
                              placeholder={`Search area in ${watchDistrict}…`}
                              searchable
                              searchValue={areaSearch}
                              onSearchChange={setAreaSearch}
                              error={errors.area?.message}
                            />
                          </div>
                        )} />
                      )}

                      {/* House */}
                      <RHFField
                        icon={TbMapPin}
                        label="House / Road / Building"
                        error={errors.house?.message}
                        {...register("house")}
                        placeholder="House 12, Road 4, Block B"
                      />

                      {/* Address preview */}
                      {fullAddress && (
                        <div className="flex gap-2 px-3 py-2.5 rounded-xl bg-secondary border border-border">
                          <TbMapPin size={12} className="text-primary shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-foreground leading-snug">
                            {fullAddress}, Bangladesh
                          </p>
                        </div>
                      )}

                      {/* Note */}
                      <div>
                        <label className="form-label-fancy">Delivery Note (optional)</label>
                        <div className="relative">
                          <TbNotes size={12} className="absolute left-3 top-3 text-muted-foreground pointer-events-none" />
                          <textarea
                            {...register("note")}
                            rows={2}
                            placeholder="Gate code, call before, leave at door…"
                            className="w-full resize-none text-xs font-medium rounded-xl border border-border bg-accent text-foreground outline-none leading-relaxed custom-scrollbar"
                            style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 10, paddingBottom: 10 }}
                            onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.10)"; }}
                            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2 — Payment ── */}
                  {step === 2 && (
                    <div className="flex flex-col gap-3 pt-2">
                      <p className="text-detail">Payment Method</p>

                      <Controller name="payment" control={control} render={({ field }) => (
                        <div className="flex flex-col gap-2">
                          {PAYMENT_METHODS.map(({ id, label, sub, icon: Icon, badge }) => {
                            const sel = field.value === id;
                            return (
                              <button
                                key={id} type="button"
                                onClick={() => field.onChange(id)}
                                className="flex items-center gap-3 p-3.5 rounded-2xl w-full text-left transition-all duration-150 hover-lift"
                                style={{
                                  border: sel ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                                  background: sel ? "var(--secondary)" : "var(--card)",
                                }}
                              >
                                <div
                                  className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-all"
                                  style={{
                                    background: sel ? "var(--primary)" : "var(--accent)",
                                    border: sel ? "none" : "1px solid var(--border)",
                                  }}
                                >
                                  <Icon size={18} style={{ color: sel ? "var(--primary-foreground)" : "var(--muted-foreground)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-sm font-black text-foreground">{label}</p>
                                    {badge && (
                                      <span className="text-[8px] font-black uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
                                        {badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground font-medium">{sub}</p>
                                </div>
                                {sel && <TbCheck size={15} className="text-primary shrink-0" />}
                              </button>
                            );
                          })}
                          {errors.payment && (
                            <FieldError msg={errors.payment.message} />
                          )}
                        </div>
                      )} />

                      {/* Order summary */}
                      <div className="rounded-2xl bg-secondary border border-border overflow-hidden">
                        <div className="px-4 py-3 flex flex-col gap-1.5">
                          <SummaryRow label={`${quantity}× ${plant.name}`} value={`৳${totalPrice}`} />
                          <SummaryRow label="Delivery fee" value="Free" highlight />
                          <div className="h-px bg-border my-1" />
                          <SummaryRow label="Total" value={`৳${totalPrice}`} bold />
                        </div>
                        {fullAddress && (
                          <div className="px-4 py-2.5 flex gap-2 border-t border-border bg-card">
                            <TbMapPin size={12} className="text-primary shrink-0 mt-0.5" />
                            <p className="text-[11px] text-muted-foreground font-medium leading-snug">
                              {fullAddress}, Bangladesh
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* ── Footer ── */}
          {!done ? (
            <div className="px-5 pt-3 pb-6 border-t border-border bg-card flex gap-2.5">
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="h-12 px-4 rounded-2xl border border-border bg-accent text-muted-foreground font-bold text-sm shrink-0 flex items-center gap-1.5 hover:bg-secondary hover:text-foreground transition-all"
                >
                  <TbChevronLeft size={15} /> Back
                </button>
              )}
              <button
                type="submit"
                form="om-form"
                disabled={submitting || stripePending}
                className="flex-1 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-150"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                  boxShadow: "0 4px 20px oklch(0.45 0.12 160 / 0.28)",
                  opacity: submitting || stripePending ? 0.75 : 1,
                  cursor: submitting || stripePending ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? (
                  <><TbLoader2 size={16} className="animate-spin" /> Placing Order…</>
                ) : step < STEPS.length - 1 ? (
                  <>Continue <TbChevronRight size={15} /></>
                ) : (
                  <><TbCheck size={16} /> Confirm · ৳{totalPrice}</>
                )}
              </button>
            </div>
          ) : (
            <div className="px-5 pt-3 pb-6 border-t border-border">
              <button
                onClick={animateClose}
                className="w-full h-12 rounded-2xl font-black text-sm transition-all"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)", border: "none", boxShadow: "0 4px 20px oklch(0.45 0.12 160 / 0.28)" }}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm close guard ── */}
      {confirmClose && (
        <div
          className="fixed inset-0 flex items-center justify-center z-9500 px-5"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
              animation: "om-pop 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <div>
              <h3 className="font-black text-foreground text-base mb-1">Discard this order?</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Your selections will be lost. Are you sure you want to close?
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmClose(false)}
                className="flex-1 h-11 rounded-xl border border-border bg-accent text-foreground font-bold text-sm hover:bg-secondary transition-all"
              >
                Keep Going
              </button>
              <button
                onClick={() => { setConfirmClose(false); animateClose(); }}
                className="flex-1 h-11 rounded-xl font-black text-sm transition-all"
                style={{ background: "var(--destructive)", color: "var(--destructive-foreground)", border: "none" }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes om-pop {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes om-success {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  );
};

/* ─────────────────────────────────────────────
   DROPDOWN SELECT — searchable, no scroll hell
───────────────────────────────────────────── */
const DropSelect = ({
  value, onChange, options, placeholder,
  disabled, error,
  searchable, searchValue, onSearchChange,
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inpRef = useRef(null);

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (open && searchable && inpRef.current) inpRef.current.focus();
  }, [open, searchable]);

  const sel = options.find(o => o.value === value);
  const displayOpts = (searchable && searchValue)
    ? options.filter(o => o.label.toLowerCase().includes(searchValue.toLowerCase()))
    : options;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(v => !v)}
        className="w-full h-10 px-3 rounded-xl text-left text-xs font-semibold flex items-center justify-between gap-1.5 border transition-all duration-150"
        style={{
          borderColor: error ? "var(--destructive)" : open ? "var(--primary)" : "var(--border)",
          background: disabled ? "var(--accent)" : "var(--card)",
          color: sel ? "var(--foreground)" : "var(--muted-foreground)",
          opacity: disabled ? 0.5 : 1,
          boxShadow: open && !error ? "0 0 0 3px oklch(0.45 0.12 160 / 0.10)" : "none",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span className="truncate">{sel ? sel.label : placeholder}</span>
        <TbChevronDown
          size={13}
          className="shrink-0 text-muted-foreground transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {error && <FieldError msg={error} />}

      {open && !disabled && (
        <div
          className="absolute left-0 right-0 rounded-2xl overflow-hidden"
          style={{
            top: "calc(100% + 5px)",
            zIndex: 700,
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          }}
        >
          {searchable && (
            <div className="relative border-b border-border">
              <TbSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                ref={inpRef}
                value={searchValue}
                onChange={e => onSearchChange?.(e.target.value)}
                placeholder="Type to filter…"
                className="w-full h-9 bg-transparent text-xs font-medium text-foreground outline-none"
                style={{ paddingLeft: 28, paddingRight: 10 }}
              />
            </div>
          )}
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 210 }}>
            {displayOpts.length === 0 ? (
              <p className="px-3 py-4 text-xs text-muted-foreground text-center italic">No results</p>
            ) : (
              displayOpts.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full px-3 py-2.5 text-left text-xs transition-colors"
                  style={{
                    background: opt.value === value ? "var(--secondary)" : "transparent",
                    color: opt.value === value ? "var(--primary)" : "var(--foreground)",
                    fontWeight: opt.value === value ? 800 : 600,
                    border: "none",
                  }}
                  onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = "var(--accent)"; }}
                  onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = "transparent"; }}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   RHF FIELD — forwardRef for register()
───────────────────────────────────────────── */
const RHFField = forwardRef(function RHFField(
  { icon: Icon, label, error, hint, type = "text", placeholder, ...rest },
  ref
) {
  return (
    <div>
      <label className="form-label-fancy">{label}</label>
      <div className="relative">
        <Icon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          {...rest}
          className="w-full h-10 rounded-xl border text-sm font-medium text-foreground bg-accent outline-none transition-all duration-150"
          style={{
            paddingLeft: 30,
            paddingRight: 12,
            borderColor: error ? "var(--destructive)" : "var(--border)",
            boxShadow: error ? "0 0 0 2px oklch(0.6 0.18 25 / 0.18)" : "none",
          }}
          onFocus={e => {
            if (!error) {
              e.target.style.borderColor = "var(--primary)";
              e.target.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.10)";
            }
          }}
          onBlur={e => {
            if (!error) {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }
          }}
        />
      </div>
      {error ? <FieldError msg={error} /> : hint ? (
        <p className="mt-1 text-[10px] text-muted-foreground font-medium">{hint}</p>
      ) : null}
    </div>
  );
});

/* ─── Small helpers ─── */
const FieldError = ({ msg }) => (
  <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-destructive">
    <TbAlertCircle size={10} /> {msg}
  </p>
);

const SummaryRow = ({ label, value, bold, highlight }) => (
  <div className="flex items-center justify-between">
    <span className={`text-xs font-${bold ? "black" : "semibold"} text-muted-foreground`}>{label}</span>
    <span
      className={`text-${bold ? "sm" : "xs"} font-${bold ? "black" : "bold"} ${highlight ? "text-primary" : "text-foreground"}`}
      style={bold ? { fontFamily: "'Georgia',serif" } : {}}
    >{value}</span>
  </div>
);

/* ─────────────────────────────────────────────
   SUCCESS VIEW
───────────────────────────────────────────── */
const SuccessView = ({ plant, quantity, saved, totalPrice, orderId }) => (
  <div className="flex flex-col items-center py-10 text-center gap-4">
    <div
      className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center"
      style={{
        boxShadow: "0 0 0 8px oklch(0.92 0.04 160 / 0.4)",
        animation: "om-success 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <TbCheck size={28} className="text-primary" />
    </div>

    <div>
      <h2 className="font-black italic text-foreground text-xl mb-1.5" style={{ fontFamily: "'Georgia',serif" }}>
        Order Placed! 🌱
      </h2>
      <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-70">
        {quantity} specimen{quantity > 1 ? "s" : ""} of{" "}
        <strong className="text-foreground">{plant.name}</strong> heading to{" "}
        <strong className="text-foreground">{saved.area || saved.district}</strong>.
        {saved.payment === "cod" ? " Pay cash on arrival." : ""}
      </p>
    </div>

    <div className="w-full rounded-2xl bg-secondary border border-border overflow-hidden">
      <div className="px-4 py-3 flex flex-col gap-1.5">
        <SummaryRow label={`${quantity}× ${plant.name}`} value={`৳${totalPrice}`} />
        <SummaryRow
          label="Payment"
          value={saved.payment === "cod" ? "Cash on Delivery" : saved.payment === "stripe" ? "Card" : "bKash"}
        />
        <SummaryRow label="Delivery fee" value="Free" highlight />
        <div className="h-px bg-border my-1" />
        <SummaryRow label="Total" value={`৳${totalPrice}`} bold />
      </div>
      {orderId && (
        <div className="px-4 py-2.5 border-t border-border bg-card">
          <p className="text-[11px] text-muted-foreground font-semibold text-center">
            Order ID:{" "}
            <span className="font-black text-foreground">
              #{String(orderId).slice(-8).toUpperCase()}
            </span>
          </p>
        </div>
      )}
    </div>
  </div>
);

const StripeCheckoutModal = ({
  open,
  onClose,
  onConfirm,
  loading,
  payload,
  plant,
  quantity,
}) => {
  if (!open || !payload) return null;

  return (
    <div
      className="fixed inset-0 z-9600 flex items-center justify-center px-5"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        }}
      >
        <div className="mb-5">
          <p className="text-detail mb-2">Secure Card Checkout</p>
          <h3
            className="text-lg font-black text-foreground"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Continue to Stripe
          </h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
            You will be redirected to Stripe&apos;s secure payment page to complete
            your card payment.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-secondary p-4">
          <div className="mb-3 flex items-center gap-3">
            <img
              src={plant.image}
              alt={plant.name}
              className="h-14 w-14 rounded-xl border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-foreground">
                {plant.name}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {quantity} unit{quantity > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Customer</span>
              <span className="font-bold text-foreground">
                {payload.customer?.name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Phone</span>
              <span className="font-bold text-foreground">
                {payload.customer?.phone}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="font-medium text-muted-foreground">Address</span>
              <span className="text-right font-bold text-foreground">
                {payload.delivery?.address}
              </span>
            </div>

            <div className="my-2 h-px bg-border" />

            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Payment</span>
              <span className="font-bold capitalize text-foreground">
                {payload.payment?.method}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Total</span>
              <span
                className="text-base font-black text-foreground"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                ৳{(plant.price * quantity).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-border bg-accent text-sm font-bold text-foreground transition-all hover:bg-secondary"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-11 rounded-xl text-sm font-black transition-all"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Redirecting..." : "Pay with Card"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;