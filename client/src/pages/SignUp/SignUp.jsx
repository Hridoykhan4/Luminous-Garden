import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { CiCamera, CiLock, CiMail, CiUser } from "react-icons/ci";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import useAuth from "@/hooks/useAuth";
import useTogglePassword from "@/hooks/useTogglePassword";
import useUploadProgress from "@/hooks/useUploadProgress";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LuminousLogo from "@/components/Shared/LuminousLogo/LuminousLogo";
import { imageUpload } from "@/api/utils";

const SignUp = () => {
  const navigate = useNavigate();
  const { showPass, togglePass, type } = useTogglePassword();
  const { uploadWithProgress, progress, isUploading } = useUploadProgress();
  const {
    createUser,
    updateUserProfile,
    signInWithGoogle,
    loading,
    setLoading,
  } = useAuth();

  // --- Form State ---
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const [imagePreview, setImagePreview] = useState(null);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  // --- Image Handling ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please upload an image file");
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image size must be under 2MB");
    }

    setImagePreview(URL.createObjectURL(file));
    setValue("imageFile", file); // Register file in RHF
  };

  // --- Animations ---
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      gsap.set(".reveal-item", { opacity: 0, y: 15 });

      tl.fromTo(
        cardRef.current,
        { scale: 0.98, opacity: 0, filter: "blur(10px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.2 },
      ).to(
        ".reveal-item",
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.8,
        },
        "-=0.8",
      );

      const moveBlobs = (e) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 40;
        const y = (clientY / window.innerHeight - 0.5) * 40;
        gsap.to(".bg-blob", { x, y, duration: 2, stagger: 0.1 });
      };

      window.addEventListener("mousemove", moveBlobs);
      return () => window.removeEventListener("mousemove", moveBlobs);
    },
    { scope: containerRef },
  );

  // --- Submit Logic ---
  const onFormSubmit = async (data) => {
    if (!data.imageFile) return toast.error("Identity image is required");

    try {
      setLoading(true);
      // Pass the progress function from hook to utility
      const photoURL = await imageUpload(data.imageFile, uploadWithProgress);
      if (!photoURL) {
        throw new Error("Failed to get image URL from Cloudinary");
      }
      await createUser(data.email, data.password);
      await updateUserProfile(data.name, photoURL);

      toast.success("Account Established!");
      navigate("/");
    } catch (err) {
      toast.error(err?.message || "Internal Gateway Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-12"
    >
      {/* Dynamic Background */}
      <div className="bg-blob absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="bg-blob absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div
        ref={cardRef}
        className="z-10 w-full max-w-112.5 rounded-[2.5rem] border border-white/5 bg-card/30 p-8 shadow-2xl backdrop-blur-3xl sm:p-12"
      >
        <header className="reveal-item flex flex-col items-center text-center mb-8">
          <LuminousLogo />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Join the Luminous Garden community
          </p>
        </header>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Avatar Upload */}
          <div className="reveal-item flex flex-col items-center gap-3">
            <label
              htmlFor="image"
              className="group relative block h-24 w-24 cursor-pointer"
            >
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-dashed border-primary/30 transition-all group-hover:border-primary group-hover:bg-primary/5">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="h-full w-full object-cover"
                    alt="Avatar preview"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <CiCamera className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-white shadow-lg transition-transform group-active:scale-90">
                <CiCamera size={16} />
              </div>
              <input
                type="file"
                id="image"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Upload Identity
            </span>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="reveal-item space-y-1">
              <FormInput
                icon={CiUser}
                placeholder="Full Name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="ml-2 text-[10px] text-destructive font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="reveal-item space-y-1">
              <FormInput
                icon={CiMail}
                type="email"
                placeholder="Email Address"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="ml-2 text-[10px] text-destructive font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="reveal-item space-y-1 relative">
              <FormInput
                icon={CiLock}
                type={type}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
              <button
                type="button"
                onClick={togglePass}
                className="absolute right-4 top-3 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              {errors.password && (
                <p className="ml-2 text-[10px] text-destructive font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="reveal-item space-y-2 py-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <span>Syncing Media</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="reveal-item pt-2">
            <Button
              type="submit"
              className="w-full h-12 text-xs font-bold uppercase tracking-widest active:scale-[0.98] transition-transform"
              disabled={loading || isUploading}
            >
              {loading ? "Establishing..." : "Establish Account"}
            </Button>
          </div>
        </form>

        <footer className="reveal-item mt-8 space-y-6">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-full border-t border-white/5" />
            <span className="relative bg-card/0 px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
              Social Gateway
            </span>
          </div>

          <Button
            variant="outline"
            type="button"
            onClick={signInWithGoogle}
            className="w-full h-12 border-white/5 bg-background/20 hover:bg-background/40 transition-all"
            disabled={loading}
          >
            <FcGoogle className="mr-3 h-5 w-5" /> Continue with Google
          </Button>

          <p className="text-center text-xs font-medium text-muted-foreground">
            Already a member?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              Log In
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

// --- Reusable Input Component ---
// eslint-disable-next-line no-unused-vars
const FormInput = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <Icon className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
    <Input
      {...props}
      className="h-11 border-white/5 bg-background/40 pl-11 transition-all focus-visible:ring-primary/30 focus-visible:ring-offset-0"
    />
  </div>
);

export default SignUp;
