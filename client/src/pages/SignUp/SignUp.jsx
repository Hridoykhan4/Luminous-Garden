import { Link, useNavigate } from "react-router";
import { FcGoogle } from "react-icons/fc";
import { CiCamera, CiLock, CiMail, CiUser } from "react-icons/ci";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { useRef, useState } from "react";
import toast, { LoaderIcon } from "react-hot-toast";

import useAuth from "@/hooks/useAuth";
import useTogglePassword from "@/hooks/useTogglePassword";
import { imageUpload } from "@/api/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LuminousLogo from "@/components/Shared/LuminousLogo/LuminousLogo";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const SignUp = () => {
  const { showPass, togglePass, type } = useTogglePassword();
  const {
    createUser,
    updateUserProfile,
    signInWithGoogle,
    loading,
    setLoading,
  } = useAuth();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const magneticButtonRef = useRef(null);

  // --- GSAP Entrance & Parallax Animations ---
  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out", duration: 1.2 },
      });

      // Initial state setup to avoid FOUC (Flash of Unstyled Content)
      gsap.set(".reveal-item", { opacity: 0, y: 30 });

      tl.fromTo(
        cardRef.current,
        { scale: 0.92, opacity: 0, filter: "blur(15px)" },
        {
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.5,
          delay: 0.1,
        },
      ).to(
        ".reveal-item",
        {
          opacity: 1,
          y: 0,
          stagger: 0.07,
          duration: 1.1,
          ease: "power4.out",
        },
        "-=1.1",
      );

      // Mouse Parallax for Background Blobs
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPos = clientX / window.innerWidth - 0.5;
        const yPos = clientY / window.innerHeight - 0.5;

        gsap.to(".bg-blob-1", {
          x: xPos * 50,
          y: yPos * 50,
          duration: 3,
          ease: "power2.out",
        });
        gsap.to(".bg-blob-2", {
          x: xPos * -30,
          y: yPos * -30,
          duration: 3,
          ease: "power2.out",
        });
      };

      // Magnetic Button Effect
      const magneticMove = (e) => {
        const btn = magneticButtonRef.current;
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.3, // Strength of the pull
          y: y * 0.3,
          duration: 0.5,
          ease: "power2.out",
        });
      };

      const magneticReset = () => {
        gsap.to(magneticButtonRef.current, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      const btn = magneticButtonRef.current;
      if (btn) {
        btn.addEventListener("mousemove", magneticMove);
        btn.addEventListener("mouseleave", magneticReset);
      }

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        if (btn) {
          btn.removeEventListener("mousemove", magneticMove);
          btn.removeEventListener("mouseleave", magneticReset);
        }
      };
    },
    { scope: containerRef },
  );

  // --- Logic Handlers ---
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!imageFile) return toast.error("Please upload an avatar");

    const form = event.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      setLoading(true);
      const photoURL = await imageUpload(imageFile);
      await createUser(email, password);
      await updateUserProfile(name, photoURL);
      toast.success("Welcome to the Garden!");
      navigate("/");
    } catch (err) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate("/");
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err?.message);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 selection:bg-primary/30"
    >
      {/* Decorative Parallax Background Elements */}
      <div className="bg-blob-1 absolute -top-32 -right-32 h-125 w-125 rounded-full bg-primary/10 blur-[120px]" />
      <div className="bg-blob-2 absolute -bottom-32 -left-32 h-125 w-125 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div
        ref={cardRef}
        className="z-10 w-full max-w-md space-y-8 rounded-[2.5rem] border border-white/10 bg-card/30 p-8 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] backdrop-blur-2xl sm:p-12"
      >
        {/* Header Section */}
        <div className="reveal-item flex flex-col items-center text-center">
          <div className="transition-transform duration-500 hover:scale-110">
            <LuminousLogo />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Join the Club.
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Luminous Garden is better with you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="reveal-item flex flex-col items-center justify-center space-y-3">
            <label htmlFor="image" className="relative cursor-pointer group">
              <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-primary/20 p-1 group-hover:border-primary transition-all duration-700 shadow-2xl">
                <div className="h-full w-full overflow-hidden rounded-full bg-muted/50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <CiCamera className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-1 right-1 rounded-full bg-primary p-2.5 text-white shadow-xl transition-transform duration-300 group-hover:scale-110 active:scale-90">
                <CiCamera className="h-4 w-4" />
              </div>
            </label>
            <input
              type="file"
              id="image"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files[0])}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Upload Identity
            </span>
          </div>

          <div className="space-y-4">
            {/* Input fields with group styling */}
            {[
              {
                id: "name",
                label: "Full Name",
                icon: CiUser,
                type: "text",
                placeholder: "Alex Rivera",
              },
              {
                id: "email",
                label: "Email Address",
                icon: CiMail,
                type: "email",
                placeholder: "alex@example.com",
              },
            ].map((field) => (
              <div key={field.id} className="reveal-item space-y-1.5">
                <label
                  className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  htmlFor={field.id}
                >
                  {field.label}
                </label>
                <div className="relative group">
                  <field.icon className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="h-12 border-white/5 bg-background/40 pl-11 transition-all focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
            ))}

            {/* Password Field */}
            <div className="reveal-item space-y-1.5">
              <label
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative group">
                <CiLock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  name="password"
                  type={type}
                  placeholder="••••••••"
                  className="h-12 border-white/5 bg-background/40 pl-11 transition-all focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                  required
                />
                <button
                  type="button"
                  onClick={togglePass}
                  className="absolute right-4 top-3.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div ref={magneticButtonRef} className="reveal-item pt-2">
            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold uppercase tracking-widest transition-transform active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <LoaderIcon className="h-5 w-5 animate-spin" />
              ) : (
                "Establish Account"
              )}
            </Button>
          </div>
        </form>

        <div className="reveal-item flex flex-col space-y-4">
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute w-full border-t border-white/5" />
            <span className="relative bg-transparent px-4 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
              Social Sync
            </span>
          </div>

          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            className="h-12 border-white/5 bg-background/20 font-semibold hover:bg-background/40 transition-all"
            disabled={loading}
          >
            <FcGoogle className="mr-3 h-5 w-5" /> Google Gateway
          </Button>

          <p className="text-center text-sm font-medium text-muted-foreground">
            Known to us?{" "}
            <Link
              to="/login"
              className="font-bold text-primary underline-offset-4 hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
