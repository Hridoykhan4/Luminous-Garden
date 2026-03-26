import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import useUserRole from "./useUserRole";

/**
 * useOrders
 * 
 * @param {object} options
 * @param {"customer"|"seller"} options.perspective  — which hat the user is wearing
 * @param {string}           options.status       — filter by order status
 * @param {number}           options.page
 * @param {number}           options.limit
 * 
 * Admin automatically gets all orders regardless of perspective.
 */
const useOrders = ({
  perspective = "seller",
  status      = "",
  page        = 1,
  limit       = 20,
} = {}) => {
  const axiosSecure = useAxiosSecure();
  const { role }    = useUserRole();

  return useQuery({
    queryKey: ["orders", { perspective, status, page, limit, role }],
    queryFn: async ({ signal }) => {
      const params = { page, limit };
      if (perspective) params.role   = perspective;
      if (status)      params.status = status;

      const { data } = await axiosSecure.get("/orders", { params, signal });
      return data; // { success, totalCount, totalPages, currentPage, data }
    },
    placeholderData:      keepPreviousData,
    staleTime:            1000 * 60 * 2,   
    gcTime:               1000 * 60 * 10,
    refetchOnWindowFocus: true,            
  });
};

export default useOrders;