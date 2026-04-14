import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import useUserRole from "@/hooks/useUserRole";
import { Navigate } from "react-router";
import AdminStatistics from "../Admin/AdminStatistics";

const Statistics = () => {
    const {role, isRoleLoading} = useUserRole();
    if(isRoleLoading)  return <LoadingSpinner></LoadingSpinner>
    if(role === 'customer' || role === 'seller') return <Navigate to="/dashboard/my-orders"></Navigate>
    
    return <AdminStatistics></AdminStatistics>
};

export default Statistics;