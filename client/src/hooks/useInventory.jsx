import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import useAuth from "./useAuth";
import toast from "react-hot-toast";

const useInventory = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetching logic
  const {
    data: plants = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["inventory", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/plants?email=${user?.email}`);
      // console.log(data);
      return data?.data;
    },
  });

  // 2. Delete Mutation
  const { mutateAsync: deletePlant } = useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosSecure.delete(`/plants/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory", user?.email]);
      toast.success("Plant removed", { icon: "🗑️" });
    },
  });

  // 3. Update Mutation (Price/Quantity)
  const { mutateAsync: updatePlant } = useMutation({
    mutationFn: async ({ id, ...updatedData }) => {
      const { data } = await axiosSecure.patch(`/plants/${id}`, updatedData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory", user?.email]);
      toast.success("Inventory Synced", { icon: "🔄" });
    },
  });

  return { plants, isLoading, deletePlant, updatePlant, refetch };
};

export default useInventory;
