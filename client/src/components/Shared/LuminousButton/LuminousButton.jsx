import { Link } from "react-router";
import { cn } from "@/lib/utils";

const LuminousButton = ({
  children,
  to,
  onClick,
  className,
  variant = "primary",
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center gap-2 px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 active:scale-95 overflow-hidden group";

  const variants = {
    primary:
      "bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40",
    outline:
      "border border-primary/20 bg-transparent text-primary hover:bg-primary/5",
    ghost: "text-muted-foreground hover:text-primary",
  };

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </>
  );

  if (to)
    return (
      <Link to={to} className={cn(baseStyles, variants[variant], className)}>
        {content}
      </Link>
    );
  return (
    <button
      onClick={onClick}
      className={cn(baseStyles, variants[variant], className)}
    >
      {content}
    </button>
  );
};

export default LuminousButton;
