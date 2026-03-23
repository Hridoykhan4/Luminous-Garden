import useAuth from "@/hooks/useAuth";
import useUserRole from "@/hooks/useUserRole";
import { Navigate, useLocation } from "react-router";

const SellerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { isRoleLoading, role } = useUserRole();
  const location = useLocation();
  if (loading || isRoleLoading)
    return <progress className="progress w-56"></progress>;
  if (user && role === "seller") return children;
  return (
    <Navigate to="/forbidden" state={{ from: location }} replace></Navigate>
  );
};

export default SellerRoute;
