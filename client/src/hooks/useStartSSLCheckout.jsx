import { useMutation } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import toast from "react-hot-toast";

const useStartSSLCheckout = () => {
    const axiosPublic = useAxiosPublic()
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await axiosPublic.post(
                `/payments/create-ssl-payment`,
                payload,
                {
                    withCredentials: false,
                },
            );
            return data;
        },
        onError: (error) => {
            const msg =
                error?.response?.data?.message ||
                "Failed to start Stripe checkout.";
            toast.error(msg);
        },
    });
};

export default useStartSSLCheckout;