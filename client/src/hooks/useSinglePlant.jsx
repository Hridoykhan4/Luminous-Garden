import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useSinglePlant = (id) => {
  const axiosPublic = useAxiosPublic();
  return useQuery({
    queryKey: ["plant", id],
    queryFn: async () => {
      const { data } = await axiosPublic.get(`/plants/${id}`);
      return data.data; 
    },
    enabled: !!id,
  });
};

export default useSinglePlant