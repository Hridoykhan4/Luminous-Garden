import { useQuery } from "@tanstack/react-query";
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
      { email, limit, page, search, category, role, minPrice, maxPrice },
    ],
    queryFn: async () => {
      const params = { email, limit, page, search, category, role };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await axiosPublic.get(`/plants`, { params });
      return data; // { success, data, totalCount, totalPages, currentPage }
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });
};

export default usePlants;
