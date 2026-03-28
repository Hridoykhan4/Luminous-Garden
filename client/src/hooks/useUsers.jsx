import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useUsers = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: users = [], isLoading: isUserLoading } = useQuery({
        queryKey: ["users", user?.email],
        enabled: !loading && !!user?.email,
        queryFn: async () => {
            const { data } = await axiosSecure.get(`/users`);
            return data;
        },
        staleTime: 1000 * 60 * 30,
        retry: 2,
    });

    return { users , isUserLoading };
};

export default useUsers;