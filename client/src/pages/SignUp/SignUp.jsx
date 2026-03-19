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
import useAxiosPublic from "@/hooks/useAxiosPublic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LuminousLogo from "@/components/Shared/LuminousLogo/LuminousLogo";
import { imageUpload } from "@/api/utils";

const SignUp = () => {
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const { showPass, togglePass, type } = useTogglePassword();
  const { uploadWithProgress, progress, isUploading } = useUploadProgress();
  const {
    createUser,
    updateUserProfile,
    signInWithGoogle,
    loading,
    setLoading,
  } = useAuth();

  const [imagePreview, setImagePreview] = useState(null);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  const { register, handleSubmit, setValue } = useForm();

  // --- REUSABLE SYNC LOGIC ---
  const syncUserToDatabase = async (userPayload) => {
    try {
      await axiosPublic.post("/users", userPayload);
    } catch (err) {
      console.error("Database Sync Failed:", err);
    }
  };

  // --- IMAGE HANDLING ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Please upload an image");
    if (file.size > 2 * 1024 * 1024)
      return toast.error("Image must be under 2MB");

    setImagePreview(URL.createObjectURL(file));
    setValue("imageFile", file);
  };

  // --- MANUAL SIGNUP FLOW ---
  const onFormSubmit = async (data) => {
    if (!data.imageFile) return toast.error("Identity image is required");

    try {
      setLoading(true);

      const photoURL = await imageUpload(data.imageFile, uploadWithProgress);
      if (!photoURL) throw new Error("Media synchronization failed");

      await createUser(data.email, data.password);

      await updateUserProfile(data.name, photoURL);

      await syncUserToDatabase({
        name: data.name,
        email: data.email,
        photo: photoURL,
      });

      toast.success("Account Established!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Internal Gateway Error");
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SIGNUP/LOGIN FLOW ---
  const handleGoogleAction = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();

      await syncUserToDatabase({
        name: result.user?.displayName,
        email: result.user?.email,
        photo: result.user?.photoURL,
      });

      toast.success("Identity Verified via Google");
      navigate("/");
    } catch (err) {
      toast.error(err?.message || "Google Auth Failed");
    } finally {
      setLoading(false);
    }
  };

  // --- GSAP ANIMATIONS ---
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
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.8 },
        "-=0.8",
      );

      const moveBlobs = (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        gsap.to(".bg-blob", { x, y, duration: 2, stagger: 0.1 });
      };

      window.addEventListener("mousemove", moveBlobs);
      return () => window.removeEventListener("mousemove", moveBlobs);
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-12"
    >
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
        </header>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Avatar Section */}
          <div className="reveal-item flex flex-col items-center gap-3">
            <label
              htmlFor="image"
              className="group relative block h-24 w-24 cursor-pointer"
            >
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-dashed border-primary/30 transition-all group-hover:border-primary">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="h-full w-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <CiCamera className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <input
                type="file"
                id="image"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="space-y-4">
            <FormInput
              icon={CiUser}
              placeholder="Full Name"
              {...register("name", { required: "Name is required" })}
            />
            <FormInput
              icon={CiMail}
              type="email"
              placeholder="Email Address"
              {...register("email", { required: "Email required" })}
            />

            <div className="relative">
              <FormInput
                icon={CiLock}
                type={type}
                placeholder="Password"
                {...register("password", {
                  required: "Password required",
                  minLength: 6,
                })}
              />
              <button
                type="button"
                onClick={togglePass}
                className="absolute right-4 top-3 text-muted-foreground"
              >
                {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {isUploading && (
            <div className="reveal-item space-y-2 py-2">
              <div className="flex justify-between text-[10px] font-bold text-primary">
                <span>Syncing Media</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12"
            disabled={loading || isUploading}
          >
            {loading ? "Establishing..." : "Establish Account"}
          </Button>
        </form>

        <footer className="reveal-item mt-8 space-y-6">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-full border-t border-white/5" />
            <span className="relative bg-card/0 px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
              Social Gateway
            </span>
          </div>

          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleAction}
            className="w-full h-12"
            disabled={loading}
          >
            <FcGoogle className="mr-3 h-5 w-5" /> Continue with Google
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already a member?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              Log In
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const FormInput = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <Icon className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
    <Input
      {...props}
      className="h-11 border-white/5 bg-background/40 pl-11 focus-visible:ring-primary/30"
    />
  </div>
);

export default SignUp;
