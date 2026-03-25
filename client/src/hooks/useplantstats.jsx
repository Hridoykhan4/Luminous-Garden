import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

/**
 * Fetches aggregate stats from GET /plants/stats
 * Returns: { totalCount, uniqueSellers, totalStock }
 * Used exclusively by PulseStats on the homepage.
 */
const usePlantStats = () => {
  const axiosPublic = useAxiosPublic();

  return useQuery({
    queryKey: ["plant-stats"],
    queryFn: async ({ signal }) => {
      const { data } = await axiosPublic.get("/plants/stats", { signal });
      return data; // { success, totalCount, uniqueSellers, totalStock }
    },
    staleTime: 1000 * 60 * 10, // 10 min — stats don't need to be live
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
  });
};

export default usePlantStats;
