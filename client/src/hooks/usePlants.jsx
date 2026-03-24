import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import useUserRole from "./useUserRole";

// We use an object with defaults here so it never breaks
const usePlants = ({
  email = "",
  limit = 10,
  page = 1,
  search = "",
  category = "",
} = {}) => {
  const axiosPublic = useAxiosPublic();
  const { role } = useUserRole();

  return useQuery({
    // The queryKey MUST include all dependencies so it refetches when you search/filter
    queryKey: ["plants", { email, limit, page, search, category, role }],
    queryFn: async () => {
      const { data } = await axiosPublic.get(`/plants`, {
        params: {
          email,
          limit,
          page,
          search,
          category,
          role,
        },
      });
      return data; // Backend returns { success, data, totalCount, totalPages }
    },
    placeholderData: (previousData) => previousData, // Smooth transitions during pagination
    staleTime: 1000 * 60 * 5,
  });
};

export default usePlants;
