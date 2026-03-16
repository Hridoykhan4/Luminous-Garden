import { Link } from "react-router";
import logo from '../../../assets/images/logoPlants.png'
const LuminousLogo = () => {
    return (
      <Link className="btn btn-ghost text-xl" to="/">
        <img src={logo} alt="logo" width="100" height="100" />
      </Link>
    );
};

export default LuminousLogo;