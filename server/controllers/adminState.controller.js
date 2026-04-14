const asyncHandler = require("express-async-handler");

const safeDate = (field) => ({
  $convert: {
    input: field,
    to: "date",
    onError: null,
    onNull: null,
  },
});

const safeLower = (field) => ({
  $toLower: {
    $ifNull: [field, "unknown"],
  },
});

const arrayToCountMap = (items = []) =>
  items.reduce((acc, item) => {
    acc[item._id || "unknown"] = item.count || 0;
    return acc;
  }, {});

const arrayToPaymentMap = (items = []) =>
  items.reduce((acc, item) => {
    acc[item._id || "unknown"] = {
      count: item.count || 0,
      totalAmount: item.totalAmount || 0,
    };
    return acc;
  }, {});

const getAdminStats = ({
  plantsCollection,
  usersCollection,
  ordersCollection,
  trackingCollection,
  sellerRequestsCollection,
}) =>
  asyncHandler(async (req, res) => {
    const today = new Date();
    const last30Days = new Date(today);
    last30Days.setUTCDate(last30Days.getUTCDate() - 29);
    last30Days.setUTCHours(0, 0, 0, 0);

    const defaultUserStats = {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      admins: 0,
      sellers: 0,
      customers: 0,
    };

    const defaultPlantStats = {
      totalPlants: 0,
      activePlants: 0,
      inactivePlants: 0,
      outOfStockPlants: 0,
      lowStockPlants: 0,
      totalInventoryUnits: 0,
    };

    const defaultOrderOverview = {
      totalOrders: 0,
      totalItemsSold: 0,
      grossRevenue: 0,
      activeRevenue: 0,
      cancelledRevenueLoss: 0,
      avgOrderValue: 0,
      pendingOrders: 0,
      processingOrders: 0,
      deliveredOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    };

    const defaultSellerRequestStats = {
      totalSellerRequests: 0,
      pendingSellerRequests: 0,
      approvedSellerRequests: 0,
      rejectedSellerRequests: 0,
    };

    const [
      userStats,
      plantStats,
      orderOverview,
      orderStatusBreakdownRaw,
      paymentMethodBreakdownRaw,
      paymentStatusBreakdownRaw,
      sellerRequestStats,
      trackingStatusBreakdownRaw,
      chartData,
    ] = await Promise.all([
      usersCollection
        .aggregate([
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              activeUsers: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "active"] }, 1, 0],
                },
              },
              inactiveUsers: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "inactive"] }, 1, 0],
                },
              },
              admins: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$role"), "admin"] }, 1, 0],
                },
              },
              sellers: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$role"), "seller"] }, 1, 0],
                },
              },
              customers: {
                $sum: {
                  $cond: [
                    {
                      $in: [safeLower("$role"), ["customer", "user", "buyer"]],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalUsers: 1,
              activeUsers: 1,
              inactiveUsers: 1,
              admins: 1,
              sellers: 1,
              customers: 1,
            },
          },
        ])
        .next(),

      plantsCollection
        .aggregate([
          {
            $group: {
              _id: null,
              totalPlants: { $sum: 1 },
              activePlants: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "active"] }, 1, 0],
                },
              },
              inactivePlants: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "inactive"] }, 1, 0],
                },
              },
              outOfStockPlants: {
                $sum: {
                  $cond: [{ $lte: [{ $ifNull: ["$quantity", 0] }, 0] }, 1, 0],
                },
              },
              lowStockPlants: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gt: [{ $ifNull: ["$quantity", 0] }, 0] },
                        { $lte: [{ $ifNull: ["$quantity", 0] }, 5] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              totalInventoryUnits: {
                $sum: { $ifNull: ["$quantity", 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalPlants: 1,
              activePlants: 1,
              inactivePlants: 1,
              outOfStockPlants: 1,
              lowStockPlants: 1,
              totalInventoryUnits: 1,
            },
          },
        ])
        .next(),

      ordersCollection
        .aggregate([
          {
            $addFields: {
              createdAtDate: safeDate("$createdAt"),
            },
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalItemsSold: { $sum: { $ifNull: ["$quantity", 0] } },
              grossRevenue: { $sum: { $ifNull: ["$totalPrice", 0] } },
              activeRevenue: {
                $sum: {
                  $cond: [
                    { $ne: [safeLower("$status"), "cancelled"] },
                    { $ifNull: ["$totalPrice", 0] },
                    0,
                  ],
                },
              },
              cancelledRevenueLoss: {
                $sum: {
                  $cond: [
                    { $eq: [safeLower("$status"), "cancelled"] },
                    { $ifNull: ["$totalPrice", 0] },
                    0,
                  ],
                },
              },
              avgOrderValue: { $avg: { $ifNull: ["$totalPrice", 0] } },
              pendingOrders: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "pending"] }, 1, 0],
                },
              },
              processingOrders: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        safeLower("$status"),
                        ["processing", "confirmed", "shipped"],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              deliveredOrders: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "delivered"] }, 1, 0],
                },
              },
              completedOrders: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "completed"] }, 1, 0],
                },
              },
              cancelledOrders: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "cancelled"] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalOrders: 1,
              totalItemsSold: 1,
              grossRevenue: 1,
              activeRevenue: 1,
              cancelledRevenueLoss: 1,
              avgOrderValue: { $round: ["$avgOrderValue", 2] },
              pendingOrders: 1,
              processingOrders: 1,
              deliveredOrders: 1,
              completedOrders: 1,
              cancelledOrders: 1,
            },
          },
        ])
        .next(),

      ordersCollection
        .aggregate([
          {
            $group: {
              _id: safeLower("$status"),
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      ordersCollection
        .aggregate([
          {
            $group: {
              _id: safeLower("$payment.method"),
              count: { $sum: 1 },
              totalAmount: { $sum: { $ifNull: ["$totalPrice", 0] } },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      ordersCollection
        .aggregate([
          {
            $group: {
              _id: safeLower("$payment.status"),
              count: { $sum: 1 },
              totalAmount: { $sum: { $ifNull: ["$totalPrice", 0] } },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      sellerRequestsCollection
        .aggregate([
          {
            $group: {
              _id: null,
              totalSellerRequests: { $sum: 1 },
              pendingSellerRequests: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "pending"] }, 1, 0],
                },
              },
              approvedSellerRequests: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "approved"] }, 1, 0],
                },
              },
              rejectedSellerRequests: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "rejected"] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalSellerRequests: 1,
              pendingSellerRequests: 1,
              approvedSellerRequests: 1,
              rejectedSellerRequests: 1,
            },
          },
        ])
        .next(),

      trackingCollection
        .aggregate([
          {
            $group: {
              _id: safeLower("$currentStatus"),
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      ordersCollection
        .aggregate([
          {
            $addFields: {
              createdAtDate: safeDate("$createdAt"),
            },
          },
          {
            $match: {
              createdAtDate: { $ne: null, $gte: last30Days },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAtDate",
                },
              },
              orders: { $sum: 1 },
              quantity: { $sum: { $ifNull: ["$quantity", 0] } },
              revenue: { $sum: { $ifNull: ["$totalPrice", 0] } },
              activeRevenue: {
                $sum: {
                  $cond: [
                    { $ne: [safeLower("$status"), "cancelled"] },
                    { $ifNull: ["$totalPrice", 0] },
                    0,
                  ],
                },
              },
              cancelledOrders: {
                $sum: {
                  $cond: [{ $eq: [safeLower("$status"), "cancelled"] }, 1, 0],
                },
              },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id",
              orders: 1,
              quantity: 1,
              revenue: 1,
              activeRevenue: 1,
              cancelledOrders: 1,
            },
          },
        ])
        .toArray(),
    ]);

    const statusBreakdown = arrayToCountMap(orderStatusBreakdownRaw);
    const paymentMethodBreakdown = arrayToPaymentMap(paymentMethodBreakdownRaw);
    const paymentStatusBreakdown = arrayToPaymentMap(paymentStatusBreakdownRaw);
    const trackingStatusBreakdown = arrayToCountMap(trackingStatusBreakdownRaw);

    const totalTracking = Object.values(trackingStatusBreakdown).reduce(
      (sum, count) => sum + count,
      0,
    );

    res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      users: userStats || defaultUserStats,
      plants: plantStats || defaultPlantStats,
      orders: {
        ...(orderOverview || defaultOrderOverview),
        statusBreakdown,
        paymentMethodBreakdown,
        paymentStatusBreakdown,
      },
      sellerRequests: sellerRequestStats || defaultSellerRequestStats,
      tracking: {
        totalTracking,
        statusBreakdown: trackingStatusBreakdown,
      },
      charts: {
        last30Days: chartData || [],
      },
    });
  });

module.exports = { getAdminStats };
