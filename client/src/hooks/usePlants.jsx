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

  // Never send undefined/null — would serialize as the string "undefined"
  const safeRole = role || "";

  return useQuery({
    queryKey: [
      "plants",
      {
        email,
        limit,
        page,
        search,
        category,
        role: safeRole,
        minPrice,
        maxPrice,
      },
    ],
    queryFn: async ({ signal }) => {
      // Only include params that have real values — keeps URL clean & server query clean
      const params = { limit, page };

      if (email) params.email = email;
      if (search) params.search = search;
      if (category) params.category = category; // empty string = "all" = not sent = no filter
      if (safeRole) params.role = safeRole;
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
