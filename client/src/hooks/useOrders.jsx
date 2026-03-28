import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import useUserRole from "./useUserRole";

/**
 * useOrders
 *
 * WHY the `enabled` guard exists:
 * useUserRole fetches asynchronously. On first render, `role` is undefined/null.
 * Without `enabled`, useOrders fires immediately with no auth context —
 * the request hits the server before the cookie is established or before
 * useAxiosSecure has the right session, causing a 401/403 that logs the user out.
 *
 * The fix: don't run the query until `role` is confirmed truthy.
 * This adds ~200ms on first load but eliminates the spurious cancellation.
 *
 * @param {object} options
 * @param {"customer"|"seller"} options.perspective
 * @param {string}              options.status
 * @param {number}              options.page
 * @param {number}              options.limit
 */
const useOrders = ({
  perspective = "customer",
  status = "",
  page = 1,
  limit = 20,
} = {}) => {
  const axiosSecure = useAxiosSecure();
  const { role, isRoleLoading } = useUserRole();

  return useQuery({
    queryKey: ["orders", { perspective, status, page, limit, role }],

    queryFn: async ({ signal }) => {
      const params = { page, limit };
      if (perspective) params.role = perspective;
      if (status) params.status = status;

      const { data } = await axiosSecure.get("/orders", { params, signal });
      return data; // { success, totalCount, totalPages, currentPage, data[] }
    },

    // ✅ THE FIX: do not fire until role is loaded.
    // isRoleLoading guards the async fetch.
    // !!role guards against the empty-string / null / undefined states.
    enabled: !isRoleLoading && !!role,

    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,   // 2 min
    gcTime: 1000 * 60 * 10,  // 10 min
    refetchOnWindowFocus: true,
  });
};

export default useOrders;