import { Link } from "react-router";
import logo from "../../../assets/images/logoPlants.png";

const LuminousLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-3 transition-transform active:scale-95">
      <img 
        src={logo} 
        alt="logo" 
        className="h-10 w-auto md:h-12" 
      />
      <span className="text-xl font-bold tracking-tight text-foreground">
        Luminous <span className="text-primary">Garden</span>
      </span>
    </Link>
  );
};

export default LuminousLogo;