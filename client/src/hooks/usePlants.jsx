import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const usePlants = (email = "") => {
  const axiosPublic = useAxiosPublic();

  return useQuery({
    queryKey: ["plants", email],
    queryFn: async () => {
      const url = email ? `/plants?email=${email}` : "/plants";
      const { data } = await axiosPublic.get(url);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export default usePlants;
