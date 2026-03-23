import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import useUserRole from "./useUserRole";

const usePlants = (email = "", limit = 0) => {
  const axiosPublic = useAxiosPublic();
  const { role } = useUserRole(); 

  return useQuery({
    queryKey: ["plants", email, limit, role], 
    queryFn: async () => {
      const params = new URLSearchParams();
      if (email) params.append("email", email);
      if (limit) params.append("limit", limit);
      if (role) params.append("role", role); 

      const { data } = await axiosPublic.get(`/plants?${params.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export default usePlants;