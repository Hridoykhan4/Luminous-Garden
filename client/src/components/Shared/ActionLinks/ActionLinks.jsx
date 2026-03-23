import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { TbPlus, TbLayoutDashboard, TbLogin, TbUserPlus } from "react-icons/tb";

const ActionLinks = ({ role , isRoleLoading}) => {
    if (isRoleLoading) return <div className="h-14 w-40 bg-secondary animate-pulse rounded-2xl" />;
  if (!role) {
    return (
      <div className="flex flex-wrap gap-4">
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20"
        >
          <Link to="/login" className="flex items-center gap-2">
            <TbLogin size={20} /> Access Portal
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-14 px-8 rounded-2xl font-bold border-border/60 hover:bg-secondary/50"
        >
          <Link to="/register" className="flex items-center gap-2">
            <TbUserPlus size={20} /> Join Community
          </Link>
        </Button>
      </div>
    );
  }

  // 2. Admin Logic
  if (role === "admin") {
    return (
      <Button
        asChild
        className="bg-foreground text-background h-14 px-8 rounded-2xl font-bold hover:bg-foreground/90 transition-all"
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-2"
        >
          <TbLayoutDashboard size={20} /> System Control
        </Link>
      </Button>
    );
  }

  // 3. Seller Logic
  if (role === "seller") {
    return (
      <div className="flex flex-wrap gap-4">
        <Button
          asChild
          className="bg-primary text-primary-foreground h-14 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20 hover-lift"
        >
          <Link to="/dashboard/add-plant" className="flex items-center gap-2">
            <TbPlus size={20} /> List Specimen
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="h-14 px-8 rounded-2xl font-bold hover-lift"
        >
          <Link to="/dashboard/my-plants">My Inventory</Link>
        </Button>
      </div>
    );
  }

  // 4. Customer Logic
  return (
    <Button
      asChild
      className="bg-primary text-primary-foreground h-14 px-10 rounded-2xl font-black italic tracking-tight shadow-xl shadow-primary/10 hover-lift"
    >
      <Link to="/plants">Browse Collection</Link>
    </Button>
  );
};

export default ActionLinks;
