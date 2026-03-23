import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import useAuth from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { loading, user } = useAuth();
  if (loading) return <LoadingSpinner></LoadingSpinner>;
  if (user) return children;
  return <Navigate to="/login" state={{ from: location }} replace></Navigate>;
};

export default PrivateRoute;
