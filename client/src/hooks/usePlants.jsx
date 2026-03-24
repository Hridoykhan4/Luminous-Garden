import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import useUserRole from "./useUserRole";

const usePlants = ({
  email = "",
  limit = 10,
  page = 1,
  search = "",
  category = "",
  minPrice = "",
  maxPrice = "",
} = {}) => {
  const axiosPublic = useAxiosPublic();
  const { role } = useUserRole();

  return useQuery({
    queryKey: [
      "plants",
      JSON.stringify({
        email,
        limit,
        page,
        search,
        category,
        role,
        minPrice,
        maxPrice,
      }),
    ],
    queryFn: async ({ signal }) => {
      const params = { email, limit, page, search, category, role };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await axiosPublic.get("/plants", { params, signal });
      return data; 
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export default usePlants;
