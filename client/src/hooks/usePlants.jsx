import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const usePlants = (email = "", limit = 0) => {
  const axiosPublic = useAxiosPublic();

  return useQuery({
    queryKey: ["plants", email, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (email) params.append("email", email);
      if (limit) params.append("limit", limit);

      const { data } = await axiosPublic.get(`/plants?${params.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export default usePlants;
