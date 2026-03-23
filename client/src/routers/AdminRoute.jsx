import { Navigate, useLocation } from "react-router";
import useAuth from "@/hooks/useAuth";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import useUserRole from "@/hooks/useUserRole";

const AdminRoute = ({ children }) => {
  const { user, loading: isAuthLoading } = useAuth();
  const { role, isRoleLoading } = useUserRole();
  const location = useLocation();

  if (isAuthLoading || isRoleLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role === "admin") {
    return children;
  }

  return <Navigate to="/forbidden" replace />;
};

export default AdminRoute;
