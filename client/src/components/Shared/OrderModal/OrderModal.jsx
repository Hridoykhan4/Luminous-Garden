/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbX,
  TbCheck,
  TbCreditCard,
  TbCash,
  TbChevronRight,
  TbChevronLeft,
  TbMapPin,
  TbPhone,
  TbNotes,
  TbUser,
  TbLoader2,
} from "react-icons/tb";
import useCreateOrder from "@/hooks/useCreateOrder";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const STEPS = ["Review", "Delivery", "Payment"];


const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    sub: "Pay when your plant arrives",
    icon: TbCash,
    badge: "Recommended",
    available: true,
  },
  {
    id: "stripe",
    label: "Card Payment",
    sub: "Visa · Mastercard · AMEX — coming soon",
    icon: TbCreditCard,
    badge: "Soon",
    available: false,
  },
  {
    id: "bkash",
    label: "bKash",
    sub: "Mobile banking — coming soon",
    icon: () => (
      <span style={{ fontSize: 11, fontWeight: 900, color: "#E2136E" }}>
        bKash
      </span>
    ),
    badge: "Soon",
    available: false,
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const OrderModal = ({ plant, quantity, onClose, user }) => {
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const totalPrice = (plant.price * quantity).toLocaleString();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [form, setForm] = useState({
    name: user?.displayName || "",
    phone: user?.phoneNumber || "",
    address: "",
    area: "",
    note: "",
    payment: "cod", 
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { mutateAsync: placeOrder, isPending: loading } = useCreateOrder();

  /* ── Validation per step ── */
  const canProceed = [
    form.name.trim().length > 1 && form.phone.trim().length > 9,
    form.address.trim().length > 5,
    form.payment !== "",
  ][step];

  /* ── Mount animation ── */
  useGSAP(() => {
    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.22 },
    );
    gsap.fromTo(
      sheetRef.current,
      { y: "100%", opacity: 0 },
      { y: "0%", opacity: 1, duration: 0.42, ease: "expo.out" },
    );
  }, []);

  /* ── Lock body scroll ── */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* ── Close animation ── */
  const closeSheet = () => {
    gsap.to(sheetRef.current, {
      y: "100%",
      opacity: 0,
      duration: 0.28,
      ease: "expo.in",
    });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.22,
      onComplete: onClose,
    });
  };

  const onBackdrop = (e) => {
    if (e.target === backdropRef.current) closeSheet();
  };

  /* ── Step slide transition ── */
  const goStep = (dir) => {
    gsap.to(".om-content", {
      x: dir > 0 ? -28 : 28,
      opacity: 0,
      duration: 0.15,
      onComplete: () => {
        setStep((s) => s + dir);
        gsap.fromTo(
          ".om-content",
          { x: dir > 0 ? 28 : -28, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.2, ease: "expo.out" },
        );
      },
    });
  };

  /* ── Submit ── */
  const handleConfirm = async () => {
    try {
      const result = await placeOrder({
        plantId: plant._id,
        quantity,
        customer: {
          name: form.name,
          phone: form.phone,
          photo: user?.photoURL || "",
        },
        delivery: {
          address: form.address,
          area: form.area,
          note: form.note,
        },
        payment: {
          method: form.payment,
        },
      });

      setOrderId(result.orderId);
      /* Animate success */
      gsap.to(".om-content", {
        opacity: 0,
        y: -12,
        duration: 0.2,
        onComplete: () => setDone(true),
      });
    } catch {
      /* error is handled by useCreateOrder's onError toast */
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={onBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        ref={sheetRef}
        style={{
          width: "100%",
          maxWidth: 540,
          borderRadius: "22px 22px 0 0",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderBottom: "none",
          boxShadow: "0 -16px 64px rgba(0,0,0,0.2)",
          maxHeight: "92svh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 12,
            paddingBottom: 4,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "var(--border)",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px 14px",
            borderBottom: "1px solid var(--border)",
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
                marginBottom: 2,
              }}
            >
              Order Confirmation
            </p>
            <p
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: 16,
                fontWeight: 900,
                fontStyle: "italic",
                color: "var(--foreground)",
              }}
            >
              {plant.name}
            </p>
          </div>
          <button
            onClick={closeSheet}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--accent)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted-foreground)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--secondary)";
              e.currentTarget.style.color = "var(--foreground)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.color = "var(--muted-foreground)";
            }}
          >
            <TbX size={15} />
          </button>
        </div>

        {/* Step indicator — hidden when done */}
        {!done && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 20px 8px",
            }}
          >
            {STEPS.map((label, i) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < STEPS.length - 1 ? 1 : 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background:
                        i <= step ? "var(--primary)" : "var(--secondary)",
                      border: i <= step ? "none" : "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    {i < step ? (
                      <TbCheck size={12} color="white" />
                    ) : (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 900,
                          color:
                            i === step
                              ? "var(--primary-foreground)"
                              : "var(--muted-foreground)",
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: i === step ? 800 : 500,
                      color:
                        i === step
                          ? "var(--foreground)"
                          : "var(--muted-foreground)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "var(--border)",
                      margin: "0 8px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "6px 20px 10px" }}>
          {/* ── SUCCESS ── */}
          {done ? (
            <SuccessView
              plant={plant}
              quantity={quantity}
              form={form}
              totalPrice={totalPrice}
              orderId={orderId}
            />
          ) : (
            <div className="om-content">
              {/* STEP 0 — Review + Contact */}
              {step === 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    paddingTop: 4,
                  }}
                >
                  {/* Plant summary */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: 14,
                      borderRadius: 14,
                      background: "var(--secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <img
                      src={plant.image}
                      alt={plant.name}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 10,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: "'Georgia', serif",
                          fontSize: 15,
                          fontWeight: 900,
                          fontStyle: "italic",
                          color: "var(--foreground)",
                          marginBottom: 3,
                        }}
                      >
                        {plant.name}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--muted-foreground)",
                          fontWeight: 600,
                          marginBottom: 6,
                        }}
                      >
                        {plant.category} · {quantity} unit
                        {quantity > 1 ? "s" : ""}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--muted-foreground)",
                            fontWeight: 600,
                          }}
                        >
                          ৳{plant.price.toLocaleString()} × {quantity}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Georgia', serif",
                            fontSize: 16,
                            fontWeight: 900,
                            color: "var(--foreground)",
                          }}
                        >
                          ৳{totalPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <SectionLabel>Your Contact</SectionLabel>
                  <Field
                    icon={TbUser}
                    label="Full Name"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Your full name"
                  />
                  <Field
                    icon={TbPhone}
                    label="Phone Number"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="01XXXXXXXXX"
                    type="tel"
                  />
                </div>
              )}

              {/* STEP 1 — Delivery */}
              {step === 1 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    paddingTop: 4,
                  }}
                >
                  <SectionLabel>Delivery Address</SectionLabel>
                  <Field
                    icon={TbMapPin}
                    label="Full Address"
                    value={form.address}
                    onChange={set("address")}
                    placeholder="House, Road, Block, Area"
                  />
                  <Field
                    icon={TbMapPin}
                    label="City / District"
                    value={form.area}
                    onChange={set("area")}
                    placeholder="Dhaka, Chattogram…"
                  />
                  <Field
                    icon={TbNotes}
                    label="Note (optional)"
                    value={form.note}
                    onChange={set("note")}
                    placeholder="Leave at door, call before…"
                    multiline
                  />
                </div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    paddingTop: 4,
                  }}
                >
                  <SectionLabel>Payment Method</SectionLabel>
                  {PAYMENT_METHODS.map(
                    ({ id, label, sub, icon: Icon, badge, available }) => {
                      const selected = form.payment === id;
                      return (
                        <button
                          key={id}
                          disabled={!available}
                          onClick={() =>
                            available && setForm((f) => ({ ...f, payment: id }))
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "13px 14px",
                            borderRadius: 13,
                            width: "100%",
                            border: selected
                              ? "1.5px solid var(--primary)"
                              : "1px solid var(--border)",
                            background: selected
                              ? "var(--secondary)"
                              : "var(--card)",
                            cursor: available ? "pointer" : "not-allowed",
                            opacity: available ? 1 : 0.45,
                            textAlign: "left",
                            transition: "all 0.15s",
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              flexShrink: 0,
                              background: selected
                                ? "var(--primary)"
                                : "var(--accent)",
                              border: selected
                                ? "none"
                                : "1px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.15s",
                            }}
                          >
                            <Icon
                              size={17}
                              style={{
                                color: selected
                                  ? "var(--primary-foreground)"
                                  : "var(--muted-foreground)",
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "var(--foreground)",
                                marginBottom: 1,
                              }}
                            >
                              {label}
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                color: "var(--muted-foreground)",
                                fontWeight: 500,
                              }}
                            >
                              {sub}
                            </p>
                          </div>
                          {badge && (
                            <span
                              style={{
                                fontSize: 8,
                                fontWeight: 900,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                padding: "3px 7px",
                                borderRadius: 999,
                                background: selected
                                  ? "var(--primary)"
                                  : "var(--accent)",
                                color: selected
                                  ? "var(--primary-foreground)"
                                  : "var(--muted-foreground)",
                                border: "1px solid var(--border)",
                                flexShrink: 0,
                              }}
                            >
                              {badge}
                            </span>
                          )}
                          {selected && (
                            <TbCheck
                              size={15}
                              style={{ color: "var(--primary)", flexShrink: 0 }}
                            />
                          )}
                        </button>
                      );
                    },
                  )}

                  {/* Final summary */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "var(--secondary)",
                      border: "1px solid var(--border)",
                      marginTop: 4,
                    }}
                  >
                    <SummaryRow
                      label={`${quantity}× ${plant.name}`}
                      value={`৳${totalPrice}`}
                    />
                    <SummaryRow
                      label="Delivery fee"
                      value="Free"
                      valueColor="oklch(0.42 0.12 160)"
                    />
                    <div
                      style={{
                        height: 1,
                        background: "var(--border)",
                        margin: "8px 0",
                      }}
                    />
                    <SummaryRow label="Total" value={`৳${totalPrice}`} bold />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!done ? (
          <div
            style={{
              padding: "12px 20px 24px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: 9,
              background: "var(--card)",
            }}
          >
            {step > 0 && (
              <button
                onClick={() => goStep(-1)}
                style={{
                  height: 50,
                  padding: "0 16px",
                  borderRadius: 13,
                  border: "1px solid var(--border)",
                  background: "var(--accent)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--muted-foreground)",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--secondary)";
                  e.currentTarget.style.color = "var(--foreground)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.color = "var(--muted-foreground)";
                }}
              >
                <TbChevronLeft size={15} /> Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canProceed && goStep(1)}
                disabled={!canProceed}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 13,
                  border: "none",
                  cursor: canProceed ? "pointer" : "not-allowed",
                  background: canProceed
                    ? "var(--primary)"
                    : "var(--secondary)",
                  color: canProceed
                    ? "var(--primary-foreground)"
                    : "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 900,
                  boxShadow: canProceed
                    ? "0 4px 18px oklch(0.45 0.12 160 / 0.25)"
                    : "none",
                  transition: "all 0.15s",
                }}
              >
                Continue <TbChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!canProceed || loading}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 13,
                  border: "none",
                  cursor: canProceed && !loading ? "pointer" : "not-allowed",
                  background:
                    canProceed && !loading
                      ? "var(--primary)"
                      : "var(--secondary)",
                  color:
                    canProceed && !loading
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  fontSize: 14,
                  fontWeight: 900,
                  boxShadow:
                    canProceed && !loading
                      ? "0 4px 18px oklch(0.45 0.12 160 / 0.25)"
                      : "none",
                  transition: "all 0.15s",
                }}
              >
                {loading ? (
                  <>
                    <TbLoader2
                      size={16}
                      style={{ animation: "om-spin 0.8s linear infinite" }}
                    />{" "}
                    Placing Order…
                  </>
                ) : (
                  <>
                    <TbCheck size={16} /> Confirm · ৳{totalPrice}
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: "12px 20px 24px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              onClick={closeSheet}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 13,
                border: "none",
                cursor: "pointer",
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                fontSize: 14,
                fontWeight: 900,
                boxShadow: "0 4px 18px oklch(0.45 0.12 160 / 0.25)",
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes om-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SUCCESS VIEW
───────────────────────────────────────────── */
const SuccessView = ({ plant, quantity, form, totalPrice, orderId }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "36px 0 20px",
      textAlign: "center",
    }}
  >
    {/* Animated check */}
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "var(--secondary)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        boxShadow: "0 0 0 8px oklch(0.92 0.04 160 / 0.45)",
        animation: "om-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <TbCheck size={26} style={{ color: "var(--primary)" }} />
    </div>

    <h2
      style={{
        fontFamily: "'Georgia', serif",
        fontSize: 22,
        fontWeight: 900,
        fontStyle: "italic",
        color: "var(--foreground)",
        marginBottom: 8,
      }}
    >
      Order Placed! 🌱
    </h2>
    <p
      style={{
        color: "var(--muted-foreground)",
        fontSize: 14,
        lineHeight: 1.65,
        maxWidth: 280,
        marginBottom: 20,
      }}
    >
      {quantity} specimen{quantity > 1 ? "s" : ""} of{" "}
      <strong>{plant.name}</strong> will be delivered to{" "}
      <strong>{form.area || "your address"}</strong>.
      {form.payment === "cod" ? " Pay cash on arrival." : ""}
    </p>

    {/* Order summary card */}
    <div
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: 14,
        background: "var(--secondary)",
        border: "1px solid var(--border)",
        marginBottom: 10,
      }}
    >
      <SummaryRow
        label={`${quantity}× ${plant.name}`}
        value={`৳${totalPrice}`}
      />
      <SummaryRow
        label="Payment"
        value={form.payment === "cod" ? "Cash on Delivery" : "Card"}
      />
      <SummaryRow label="Delivery" value={`${form.address}, ${form.area}`} />
      {orderId && (
        <>
          <div
            style={{ height: 1, background: "var(--border)", margin: "8px 0" }}
          />
          <SummaryRow
            label="Order ID"
            value={`#${String(orderId).slice(-6).toUpperCase()}`}
          />
        </>
      )}
    </div>

    <style>{`@keyframes om-pop { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
  </div>
);

/* ─────────────────────────────────────────────
   SHARED SMALL COMPONENTS  (DRY)
───────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p
    style={{
      fontSize: 10,
      fontWeight: 900,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--muted-foreground)",
      margin: "2px 0 4px",
    }}
  >
    {children}
  </p>
);

const SummaryRow = ({ label, value, valueColor, bold }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    }}
  >
    <span
      style={{
        fontSize: 12,
        color: "var(--muted-foreground)",
        fontWeight: bold ? 800 : 600,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: bold ? 16 : 12,
        fontWeight: bold ? 900 : 700,
        color: valueColor || "var(--foreground)",
        fontFamily: bold ? "'Georgia', serif" : "inherit",
      }}
    >
      {value}
    </span>
  </div>
);

const Field = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
}) => (
  <div>
    <label
      style={{
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--muted-foreground)",
        display: "block",
        marginBottom: 4,
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <Icon
        size={13}
        style={{
          position: "absolute",
          left: 11,
          pointerEvents: "none",
          top: multiline ? 11 : "50%",
          transform: multiline ? "none" : "translateY(-50%)",
          color: "var(--muted-foreground)",
        }}
      />
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          style={{
            width: "100%",
            boxSizing: "border-box",
            paddingLeft: 32,
            paddingRight: 12,
            paddingTop: 10,
            paddingBottom: 10,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--accent)",
            color: "var(--foreground)",
            fontSize: 13,
            fontWeight: 500,
            outline: "none",
            resize: "none",
            fontFamily: "inherit",
            lineHeight: 1.55,
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--primary)";
            e.target.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: 40,
            boxSizing: "border-box",
            paddingLeft: 32,
            paddingRight: 12,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--accent)",
            color: "var(--foreground)",
            fontSize: 13,
            fontWeight: 500,
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--primary)";
            e.target.style.boxShadow = "0 0 0 3px oklch(0.45 0.12 160 / 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
      )}
    </div>
  </div>
);

export default OrderModal;
