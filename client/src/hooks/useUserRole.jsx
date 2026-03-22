import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useUserRole = () => {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: role, isLoading: isRoleLoading } = useQuery({
    queryKey: ["userRole", user?.email],
    enabled: !loading && !!user?.email,
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/users/role/${user?.email}`);
      return data.role;
    },
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  return {role, isRoleLoading};
};

export default useUserRole;
