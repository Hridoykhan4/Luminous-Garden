import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import useUserRole from "./useUserRole";

/**
 * usePlants
 *
 * WHY two separate enabled conditions:
 *
 * 1. Public browsing (no email filter) — always enabled, role doesn't matter.
 *    The plants endpoint is public. No need to wait for role.
 *
 * 2. Seller's own inventory (email filter present) — must wait for role to load.
 *    If `email` is passed, it means we're fetching seller-specific plants.
 *    Firing before role loads gives a stale/wrong result and can cause
 *    a double-fetch with incorrect params.
 *
 * This keeps the homepage Plants page instant while protecting the
 * seller inventory view from the race condition.
 */
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
  const { role, isRoleLoading } = useUserRole();

  const safeRole = role || "";

  // If email is provided (seller inventory), wait for role to load first.
  // If no email (public browse), fire immediately.
  const isSellerView = !!email;
  const enabled = isSellerView ? (!isRoleLoading && !!role) : true;

  return useQuery({
    queryKey: [
      "plants",
      { email, limit, page, search, category, role: safeRole, minPrice, maxPrice },
    ],

    queryFn: async ({ signal }) => {
      const params = { limit, page };

      if (email) params.email = email;
      if (search) params.search = search;
      if (category) params.category = category;
      if (safeRole) params.role = safeRole;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await axiosPublic.get("/plants", { params, signal });
      return data;
    },

    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,   // 5 min
    gcTime: 1000 * 60 * 10,  // 10 min
    refetchOnWindowFocus: false,
  });
};

export default usePlants;