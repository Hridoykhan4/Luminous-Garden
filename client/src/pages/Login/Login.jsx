import { Link, Navigate, useLocation, useNavigate } from "react-router";
// import { FcGoogle } from "react-icons/fc";
// import { Loader2, Mail, Lock, Leaf } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import toast, { LoaderIcon } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LuminousLogo from "@/components/Shared/LuminousLogo/LuminousLogo";
import useTogglePassword from "@/hooks/useTogglePassword";
import { CiLock, CiMail } from "react-icons/ci";
import { FaEyeSlash , FaEye} from "react-icons/fa";
const Login = () => {
    const {showPass, togglePass, type} = useTogglePassword()
  const { signIn, signInWithGoogle, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location?.state?.from?.pathname || "/";

  if (user) return <Navigate to={from} replace={true} />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
      toast.success("Welcome back to the Garden!");
    } catch (err) {
      toast.error(err?.message || "Invalid credentials");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
      toast.success("Connected with Google");
    } catch (err) {
      toast.error(err?.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Background Decorative Elements */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="z-10 w-full max-w-md space-y-8 rounded-2xl border bg-card/50 p-8 shadow-xl backdrop-blur-md sm:p-10">
        <div className="flex flex-col items-center text-center">
          <LuminousLogo />
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to manage your plants
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <CiMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="password"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <CiLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={type}
                  placeholder="••••••••"
                  className="pl-10 focus-visible:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={togglePass}
                  className="text-xs cursor-pointer absolute right-5 top-2 text-primary hover:underline"
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
            disabled={loading}
          >
            {loading ? (
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full transition-all hover:bg-secondary"
          disabled={loading}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
