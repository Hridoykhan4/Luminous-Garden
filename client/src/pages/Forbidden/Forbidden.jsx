import LuminousButton from "@/components/Shared/LuminousButton/LuminousButton";
import { TbShieldLock } from "react-icons/tb";

const Forbidden = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
        <TbShieldLock className="relative text-9xl text-destructive animate-pulse" />
      </div>

      <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">
        Access Restricted
      </h1>
      <p className="text-muted-foreground max-w-md mb-8 italic">
        Your current credentials do not have the clearance required to access
        this sector of the garden. This attempt has been logged.
      </p>

      <LuminousButton to="/">Return to Safe Zone</LuminousButton>
    </div>
  );
};

export default Forbidden;
