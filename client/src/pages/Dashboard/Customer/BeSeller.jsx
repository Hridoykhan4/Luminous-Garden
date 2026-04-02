import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    TbBuildingStore, TbId,
    TbLoader2, TbLeaf,
    TbAlertCircle, TbClockHour4, TbShieldCheck,
} from "react-icons/tb";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const DISTRICTS = [
    "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria",
    "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla",
    "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
    "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat",
    "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur",
    "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar",
    "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
    "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh",
    "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
    "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet",
    "Tangail", "Thakurgaon",
];

const schema = z.object({
    shopName: z.string().min(3, "Shop name must be at least 3 characters"),
    phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid BD mobile number"),
    district: z.string().min(1, "Please select your district"),
    address: z.string().min(10, "Provide your full shop/pickup address"),
    nidNumber: z.string().min(10, "NID must be at least 10 digits").max(17),
    tradeLicense: z.string().optional(),
    experience: z.string().min(1, "Please select your experience"),
    specialization: z.string().min(1, "Tell us what plants you sell"),
    bio: z.string().min(20, "Bio must be at least 20 characters").max(300),
    agree: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
});

const BeSeller = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const pageRef = useRef(null);
    const [submitted, setSubmitted] = useState(false);
    const [existingRequest, setExistingRequest] = useState(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    useGSAP(() => {
        gsap.from(".bs-card", {
            y: 28, opacity: 0, stagger: 0.08, duration: 0.7, ease: "expo.out",
        });
    }, { scope: pageRef });

    const onSubmit = async (data) => {
        try {
            await axiosSecure.post("/seller-requests", {
                ...data,
                applicantEmail: user?.email,
                applicantName: user?.displayName,
                applicantPhoto: user?.photoURL,
            });
            setSubmitted(true);
            toast.success("Application submitted! We'll review within 24–48 hours.");
        } catch (err) {
            if (err?.response?.status === 409) {
                setExistingRequest(err?.response?.data?.status || "pending");
            } else {
                toast.error(err?.response?.data?.message || "Submission failed");
            }
        }
    };

    /* Already submitted or has existing request */
    if (submitted || existingRequest) {
        return (
            <div ref={pageRef} className="py-6">
                <div className="bs-card max-w-xl mx-auto rounded-3xl border border-border bg-card p-10 text-center"
                    style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>
                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                        {existingRequest === "rejected"
                            ? <TbAlertCircle size={36} className="text-destructive" />
                            : <TbClockHour4 size={36} className="text-primary" />
                        }
                    </div>
                    <h2 style={{ fontFamily: "'Georgia', serif", fontSize: "1.6rem", fontWeight: 900, fontStyle: "italic" }}>
                        {existingRequest === "rejected" ? "Application Rejected" : "Under Review"}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium mt-3 leading-relaxed max-w-sm mx-auto">
                        {existingRequest === "rejected"
                            ? "Your previous application was rejected. Contact support for more information."
                            : "Your seller application has been received and is under review. Our team will verify your information within 24–48 hours."
                        }
                    </p>
                    <div className="mt-6 flex flex-col gap-2">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-semibold">
                            <TbShieldCheck size={14} className="text-primary" />
                            We verify NID and trade license for marketplace integrity
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={pageRef} className="py-6 flex flex-col gap-6">


            <div className="bs-card">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <TbBuildingStore size={22} className="text-primary" />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.02em" }}>
                            Become a Seller
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            Join our verified seller network and start listing your plants.
                        </p>
                    </div>
                </div>

                {/* Steps */}
                <div className="mt-5 flex items-center gap-0 overflow-x-auto pb-1">
                    {["Apply", "Verification", "Approval", "Start Selling"].map((step, i) => (
                        <div key={step} className="flex items-center shrink-0">
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider",
                                i === 0 ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground border border-border"
                            )}>
                                <span className={cn(
                                    "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black",
                                    i === 0 ? "bg-white/20" : "bg-border"
                                )}>{i + 1}</span>
                                {step}
                            </div>
                            {i < 3 && <div className="w-6 h-px bg-border shrink-0" />}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                {/* Shop Info */}
                <div className="bs-card rounded-2xl border border-border bg-card overflow-hidden"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                    <FormSectionHead icon={TbBuildingStore} title="Shop Information" />
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            label="Shop / Business Name"
                            error={errors.shopName?.message}
                            required
                        >
                            <input {...register("shopName")}
                                placeholder="e.g. Green Jungle BD"
                                className={inputCls(errors.shopName)} />
                        </FormField>

                        <FormField label="Mobile Number" error={errors.phone?.message} required>
                            <input {...register("phone")}
                                placeholder="01XXXXXXXXX"
                                className={inputCls(errors.phone)} />
                        </FormField>

                        <FormField label="District" error={errors.district?.message} required>
                            <select {...register("district")} className={inputCls(errors.district)}>
                                <option value="">Select district…</option>
                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </FormField>

                        <FormField label="Specialization" error={errors.specialization?.message} required>
                            <select {...register("specialization")} className={inputCls(errors.specialization)}>
                                <option value="">What do you sell?</option>
                                <option value="indoor">Indoor Plants</option>
                                <option value="outdoor">Outdoor Plants</option>
                                <option value="succulents">Succulents & Cacti</option>
                                <option value="tropical">Tropical Plants</option>
                                <option value="herbs">Herbs & Edibles</option>
                                <option value="rare">Rare & Exotic</option>
                                <option value="mixed">Mixed / All Types</option>
                            </select>
                        </FormField>

                        <FormField label="Pickup / Shop Address" error={errors.address?.message} required className="sm:col-span-2">
                            <input {...register("address")}
                                placeholder="Full address where orders will be picked up from"
                                className={inputCls(errors.address)} />
                        </FormField>

                        <FormField label="Your Bio" error={errors.bio?.message} required className="sm:col-span-2">
                            <textarea {...register("bio")} rows={3}
                                placeholder="Tell buyers about yourself and your plants…"
                                className={cn(inputCls(errors.bio), "resize-none")} />
                        </FormField>
                    </div>
                </div>

                {/* Verification */}
                <div className="bs-card rounded-2xl border border-border bg-card overflow-hidden"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                    <FormSectionHead icon={TbId} title="Identity Verification" />
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="National ID (NID) Number" error={errors.nidNumber?.message} required>
                            <input {...register("nidNumber")}
                                placeholder="10 or 17-digit NID number"
                                className={inputCls(errors.nidNumber)} />
                        </FormField>

                        <FormField label="Trade License No." error={errors.tradeLicense?.message}
                            hint="Optional but improves trust score">
                            <input {...register("tradeLicense")}
                                placeholder="XXXXXXXXXX (if available)"
                                className={inputCls(errors.tradeLicense)} />
                        </FormField>

                        <FormField label="Selling Experience" error={errors.experience?.message} required>
                            <select {...register("experience")} className={inputCls(errors.experience)}>
                                <option value="">Select experience</option>
                                <option value="new">Just starting out</option>
                                <option value="1-2">1–2 years</option>
                                <option value="3-5">3–5 years</option>
                                <option value="5+">5+ years</option>
                            </select>
                        </FormField>
                    </div>

                    {/* Trust badges */}
                    <div className="px-5 pb-5 flex flex-wrap gap-2">
                        {["NID Verified", "Address Confirmed", "Secure Marketplace"].map(t => (
                            <span key={t} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-primary/8 text-primary border border-primary/20">
                                <TbShieldCheck size={10} /> {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Terms + Submit */}
                <div className="bs-card rounded-2xl border border-border bg-card p-5"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" {...register("agree")}
                            className="mt-0.5 w-4 h-4 accent-primary rounded shrink-0" />
                        <span className="text-xs text-muted-foreground font-medium leading-relaxed">
                            I confirm that all information provided is accurate and genuine.
                            I agree to the Seller Terms of Service and understand that providing
                            false information may result in permanent account suspension.
                        </span>
                    </label>
                    {errors.agree && (
                        <p className="text-xs text-destructive font-semibold mt-2 flex items-center gap-1">
                            <TbAlertCircle size={12} /> {errors.agree.message}
                        </p>
                    )}

                    <button type="submit" disabled={isSubmitting}
                        className="mt-4 w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-all">
                        {isSubmitting
                            ? <><TbLoader2 size={16} className="animate-spin" /> Submitting…</>
                            : <><TbLeaf size={16} /> Submit Application</>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ─── helpers ─── */
const inputCls = (err) => cn(
    "w-full h-11 px-3.5 rounded-xl border text-sm font-medium bg-accent/30 outline-none transition-all",
    "focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-card",
    "placeholder:text-muted-foreground/60",
    err ? "border-destructive/60 bg-destructive/5" : "border-border"
);

// eslint-disable-next-line no-unused-vars
const FormSectionHead = ({ icon: Icon, title }) => (
    <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
        <Icon size={13} className="text-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground">{title}</span>
    </div>
);

const FormField = ({ label, error, hint, required, children, className }) => (
    <div className={cn("flex flex-col gap-1.5", className)}>
        <label className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
        </label>
        {children}
        {hint && !error && <p className="text-[10px] text-muted-foreground font-medium">{hint}</p>}
        {error && (
            <p className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                <TbAlertCircle size={10} /> {error}
            </p>
        )}
    </div>
);

export default BeSeller;