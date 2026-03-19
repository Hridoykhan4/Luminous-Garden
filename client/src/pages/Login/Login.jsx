import { useRef } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { CiLock, CiMail } from "react-icons/ci";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import useAuth from "@/hooks/useAuth";
import useTogglePassword from "@/hooks/useTogglePassword";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LuminousLogo from "@/components/Shared/LuminousLogo/LuminousLogo";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showPass, togglePass, type } = useTogglePassword();
  const { signIn, signInWithGoogle, loading, setLoading, user } = useAuth();

  const from = location?.state?.from?.pathname || "/";
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // --- Animations (Matching SignUp Style) ---
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
    },
    { scope: containerRef },
  );

  if (user) return <Navigate to={from} replace={true} />;

  // --- Submit Logic ---
  const onFormSubmit = async (data) => {
    try {
      setLoading(true);
      await signIn(data.email, data.password);
      toast.success("Welcome back to the Garden!");
      navigate(from, { replace: true });
    } catch (err) {
      const errorMsg =
        err.code === "auth/wrong-password"
          ? "Incorrect password. Try again."
          : err.code === "auth/user-not-found"
            ? "No account found with this email."
            : "Access Denied: Invalid Credentials";

      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success("Identity Verified via Google");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.message || "Google Authentication Failed");
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-12"
    >
      {/* Background Blobs */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div
        ref={cardRef}
        className="z-10 w-full max-w-md rounded-[2.5rem] border border-white/5 bg-card/30 p-8 shadow-2xl backdrop-blur-3xl sm:p-12"
      >
        <header className="reveal-item flex flex-col items-center text-center mb-8">
          <LuminousLogo />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Access your botanical dashboard
          </p>
        </header>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="reveal-item space-y-1">
              <div className="relative group">
                <CiMail className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  {...register("email", { required: "Email is required" })}
                  className="h-11 border-white/5 bg-background/40 pl-11 transition-all focus-visible:ring-primary/30"
                />
              </div>
              {errors.email && (
                <p className="ml-2 text-[10px] text-destructive font-medium uppercase">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="reveal-item space-y-1 relative">
              <div className="relative group">
                <CiLock className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type={type}
                  placeholder="Password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="h-11 border-white/5 bg-background/40 pl-11 pr-11 transition-all focus-visible:ring-primary/30"
                />
              </div>
              <button
                type="button"
                onClick={togglePass}
                className="absolute right-4 top-3 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              {errors.password && (
                <p className="ml-2 text-[10px] text-destructive font-medium uppercase">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="reveal-item pt-2">
            <Button
              type="submit"
              className="btn-main w-full h-12 text-xs font-bold uppercase tracking-widest active:scale-[0.98] transition-all"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </div>
        </form>

        <footer className="reveal-item mt-8 space-y-6">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-full border-t border-white/5" />
            <span className="relative bg-card/0 px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
              Alternative Entry
            </span>
          </div>

          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-12 border-white/5 bg-background/20 hover:bg-background/40 transition-all"
            disabled={loading}
          >
            <FcGoogle className="mr-3 h-5 w-5" /> Google Gateway
          </Button>

          <p className="text-center text-xs font-medium text-muted-foreground">
            New to the Garden?{" "}
            <Link
              to="/signup"
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              Create Account
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
