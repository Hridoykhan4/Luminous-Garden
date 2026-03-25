import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import toast from "react-hot-toast";

const useCreateOrder = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderPayload) => {
      const { data } = await axiosSecure.post("/orders", orderPayload);
      return data; // { success, orderId, orderData }
    },

    onSuccess: () => {
      // Invalidate plant cache so stock count reflects the decrement
      queryClient.invalidateQueries({ queryKey: ["plants"] , exact: false});
      // Also invalidate orders list if it's open somewhere (e.g. dashboard)
      queryClient.invalidateQueries({ queryKey: ["orders"] , exact: false});
    },

    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(msg);
    },
  });
};

export default useCreateOrder;
