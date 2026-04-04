import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useTracking = (orderId) => {
    const axiosSecure = useAxiosSecure();

    return useQuery({
        queryKey: ["tracking", orderId],
        queryFn: async ({ signal }) => {
            const { data } = await axiosSecure.get(`/orders/track/${orderId}`, { signal });
            return data.data; 
        },
        enabled: !!orderId,
        staleTime: 1000 * 30,   // 30s — tracking should feel live
        refetchInterval: 1000 * 60,   // auto-refetch every 60s
        refetchOnWindowFocus: true,
    });
};

export default useTracking;