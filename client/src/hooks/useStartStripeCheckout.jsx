import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAxiosPublic from "./useAxiosPublic";

const useStartStripeCheckout = () => {
    const axiosPublic = useAxiosPublic()
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await axiosPublic.post(
                `/payments/stripe/checkout-session`,
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

export default useStartStripeCheckout;