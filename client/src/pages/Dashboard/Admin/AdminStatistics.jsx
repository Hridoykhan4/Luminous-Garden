import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    FaUserAlt,
    FaDollarSign,
    FaClipboardCheck,
    FaWarehouse,
} from "react-icons/fa";
import {
    BsFillCartPlusFill,
    BsFillHouseDoorFill,
    BsGraphUpArrow,
} from "react-icons/bs";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

import useAxiosSecure from "@/hooks/useAxiosSecure";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";

const COLORS = [
    "#16a34a",
    "#2563eb",
    "#7c3aed",
    "#f59e0b",
    "#dc2626",
    "#0ea5e9",
    "#14b8a6",
    "#64748b",
];

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatNumber = (value = 0) =>
    new Intl.NumberFormat("en-BD", {
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const toPieData = (obj = {}) =>
    Object.entries(obj)
        .map(([name, entry], index) => {
            if (typeof entry === "object" && entry !== null) {
                return {
                    name,
                    value: entry.count || 0,
                    amount: entry.totalAmount || 0,
                    color: COLORS[index % COLORS.length],
                };
            }

            return {
                name,
                value: entry || 0,
                color: COLORS[index % COLORS.length],
            };
        })
        .filter((item) => item.value > 0);

const CustomTooltip = ({ active, payload, label, currency = false }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="glass-card rounded-2xl p-3 shadow-xl">
            <p className="mb-2 text-sm font-black text-slate-800">{label}</p>
            <div className="space-y-1">
                {payload.map((entry, index) => (
                    <div
                        key={`${entry.dataKey}-${index}`}
                        className="flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm font-semibold capitalize text-slate-600">
                                {entry.name}
                            </span>
                        </div>
                        <span className="text-sm font-black text-slate-900">
                            {currency
                                ? formatCurrency(entry.value)
                                : formatNumber(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subtitle, icon, gradient }) => (
    <div className="vault-card hover-lift relative overflow-hidden p-5">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
            <div>
                <p className="text-detail mb-2">{title}</p>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                    {value}
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">{subtitle}</p>
            </div>

            <div
                className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br shadow-lg ${gradient}`}
            >
                {icon}
            </div>
        </div>
    </div>
);

const MiniRow = ({ label, value, total, color = "bg-primary" }) => {
    const percent = total ? Math.min((value / total) * 100, 100) : 0;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold capitalize text-slate-600">
                    {label}
                </span>
                <span className="text-sm font-black text-slate-900">
                    {formatNumber(value)}
                </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100">
                <div
                    className={`h-2.5 rounded-full ${color}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};

const AdminStatistics = () => {
    const axiosSecure = useAxiosSecure();

    const { data: statData = {}, isLoading, isError, error } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const { data } = await axiosSecure.get("/admin-stats");
            return data;
        },
        staleTime: 60 * 1000,
    });

    const users = statData?.users || {};
    const plants = statData?.plants || {};
    const orders = statData?.orders || {};
    const sellerRequests = statData?.sellerRequests || {};
    const tracking = statData?.tracking || {};
    const charts = useMemo(() => {
        return statData?.charts?.last30Days || []
    }, [statData]);

    const chartData = useMemo(() => {
        return charts.map((item) => ({
            ...item,
            shortDate: new Date(item.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
            }),
        }));
    }, [charts]);

    const orderStatusData = useMemo(
        () => toPieData(orders?.statusBreakdown),
        [orders?.statusBreakdown],
    );

    const paymentMethodData = useMemo(
        () => toPieData(orders?.paymentMethodBreakdown),
        [orders?.paymentMethodBreakdown],
    );

    const totalOrders = orders?.totalOrders || 0;
    const totalUsers = users?.totalUsers || 0;
    const totalPlants = plants?.totalPlants || 0;
    const totalSellerRequests = sellerRequests?.totalSellerRequests || 0;
    const totalTracking = tracking?.totalTracking || 0;

    if (isLoading) return <LoadingSpinner />;

    if (isError) {
        return (
            <div className="container-page section-spacing">
                <div className="vault-card p-8 text-center">
                    <h2 className="text-2xl font-black text-slate-900">
                        Failed to load admin statistics
                    </h2>
                    <p className="mt-3 text-sm font-medium text-slate-500">
                        {error?.message || "Something went wrong."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="">
            <div className="rounded-4xl bg-linear-to-br from-emerald-50 via-white to-cyan-50 p-6 shadow-[0_30px_90px_rgba(16,185,129,0.08)] md:p-8">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-detail mb-2">Admin overview</p>
                        <h1 className="title-gradient text-3xl font-black tracking-tight md:text-5xl">
                            Luminous Garden Dashboard
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-600">
                            Revenue, order performance, inventory health, seller approval flow,
                            tracking status, and payment insights — all in one place.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="glass-card rounded-2xl px-4 py-3">
                            <p className="text-detail mb-1">Avg order value</p>
                            <p className="text-lg font-black text-slate-900">
                                {formatCurrency(orders?.avgOrderValue || 0)}
                            </p>
                        </div>
                        <div className="glass-card rounded-2xl px-4 py-3">
                            <p className="text-detail mb-1">Active revenue</p>
                            <p className="text-lg font-black text-emerald-700">
                                {formatCurrency(orders?.activeRevenue || 0)}
                            </p>
                        </div>
                        <div className="glass-card rounded-2xl px-4 py-3">
                            <p className="text-detail mb-1">Cancelled loss</p>
                            <p className="text-lg font-black text-rose-600">
                                {formatCurrency(orders?.cancelledRevenueLoss || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(orders?.grossRevenue || 0)}
                        subtitle={`${formatNumber(orders?.totalItemsSold || 0)} items sold`}
                        gradient="from-orange-500 to-amber-500 text-white"
                        icon={<FaDollarSign className="h-6 w-6 text-white" />}
                    />

                    <StatCard
                        title="Total Orders"
                        value={formatNumber(totalOrders)}
                        subtitle={`${formatNumber(orders?.pendingOrders || 0)} pending`}
                        gradient="from-blue-500 to-cyan-500 text-white"
                        icon={<BsFillCartPlusFill className="h-6 w-6 text-white" />}
                    />

                    <StatCard
                        title="Total Plants"
                        value={formatNumber(totalPlants)}
                        subtitle={`${formatNumber(plants?.activePlants || 0)} active`}
                        gradient="from-pink-500 to-rose-500 text-white"
                        icon={<BsFillHouseDoorFill className="h-6 w-6 text-white" />}
                    />

                    <StatCard
                        title="Total Users"
                        value={formatNumber(totalUsers)}
                        subtitle={`${formatNumber(users?.sellers || 0)} sellers`}
                        gradient="from-green-500 to-emerald-500 text-white"
                        icon={<FaUserAlt className="h-6 w-6 text-white" />}
                    />
                </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-3">
                <div className="vault-card p-5 md:p-6 xl:col-span-2">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                Revenue trend
                            </h3>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                Gross revenue and active revenue over the last 30 days
                            </p>
                        </div>
                        <div className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                            Analytics
                        </div>
                    </div>

                    <div className="h-[360px] min-w-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.03} />
                                    </linearGradient>
                                    <linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.03} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="shortDate"
                                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip currency />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Gross Revenue"
                                    stroke="#16a34a"
                                    fill="url(#revenueFill)"
                                    strokeWidth={3}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="activeRevenue"
                                    name="Active Revenue"
                                    stroke="#0ea5e9"
                                    fill="url(#activeFill)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="vault-card p-5 md:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                Order status
                            </h3>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                Current order distribution
                            </p>
                        </div>
                        <BsGraphUpArrow className="h-5 w-5 text-primary" />
                    </div>

                    <div className="h-[280px] min-w-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={65}
                                    outerRadius={100}
                                    paddingAngle={4}
                                >
                                    {orderStatusData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-5 space-y-4">
                        {orderStatusData.map((item, idx) => (
                            <MiniRow
                                key={item.name}
                                label={item.name}
                                value={item.value}
                                total={totalOrders}
                                color={
                                    [
                                        "bg-emerald-500",
                                        "bg-blue-500",
                                        "bg-violet-500",
                                        "bg-amber-500",
                                        "bg-rose-500",
                                    ][idx % 5]
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-3">
                <div className="vault-card p-5 md:p-6 xl:col-span-2">
                    <div className="mb-5">
                        <h3 className="text-xl font-black text-slate-900">
                            Orders and quantities
                        </h3>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                            Daily order volume, quantity sold, and cancellations
                        </p>
                    </div>

                    <div className="h-[360px] min-w-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="shortDate"
                                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar
                                    dataKey="orders"
                                    name="Orders"
                                    fill="#2563eb"
                                    radius={[10, 10, 0, 0]}
                                    barSize={22}
                                />
                                <Bar
                                    dataKey="quantity"
                                    name="Items"
                                    fill="#14b8a6"
                                    radius={[10, 10, 0, 0]}
                                    barSize={22}
                                />
                                <Bar
                                    dataKey="cancelledOrders"
                                    name="Cancelled"
                                    fill="#dc2626"
                                    radius={[10, 10, 0, 0]}
                                    barSize={22}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="vault-card p-5 md:p-6">
                    <div className="mb-5">
                        <h3 className="text-xl font-black text-slate-900">
                            Payment methods
                        </h3>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                            COD now, card-ready for future integrations
                        </p>
                    </div>

                    <div className="h-[240px] min-w-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentMethodData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={45}
                                    outerRadius={80}
                                    paddingAngle={4}
                                >
                                    {paymentMethodData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                        {paymentMethodData.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="font-bold capitalize text-slate-700">
                                        {item.name}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900">
                                        {formatNumber(item.value)}
                                    </p>
                                    <p className="text-xs font-semibold text-slate-500">
                                        {formatCurrency(item.amount || 0)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
                <div className="vault-card p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900">Users</h3>
                        <FaUserAlt className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <MiniRow
                            label="Active users"
                            value={users?.activeUsers || 0}
                            total={totalUsers}
                            color="bg-emerald-500"
                        />
                        <MiniRow
                            label="Sellers"
                            value={users?.sellers || 0}
                            total={totalUsers}
                            color="bg-blue-500"
                        />
                        <MiniRow
                            label="Customers"
                            value={users?.customers || 0}
                            total={totalUsers}
                            color="bg-violet-500"
                        />
                        <MiniRow
                            label="Admins"
                            value={users?.admins || 0}
                            total={totalUsers}
                            color="bg-amber-500"
                        />
                    </div>
                </div>

                <div className="vault-card p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900">Inventory</h3>
                        <FaWarehouse className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <MiniRow
                            label="Active plants"
                            value={plants?.activePlants || 0}
                            total={totalPlants}
                            color="bg-emerald-500"
                        />
                        <MiniRow
                            label="Low stock"
                            value={plants?.lowStockPlants || 0}
                            total={totalPlants}
                            color="bg-amber-500"
                        />
                        <MiniRow
                            label="Out of stock"
                            value={plants?.outOfStockPlants || 0}
                            total={totalPlants}
                            color="bg-rose-500"
                        />
                    </div>
                </div>

                <div className="vault-card p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900">
                            Seller Requests
                        </h3>
                        <FaClipboardCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <MiniRow
                            label="Approved"
                            value={sellerRequests?.approvedSellerRequests || 0}
                            total={totalSellerRequests}
                            color="bg-emerald-500"
                        />
                        <MiniRow
                            label="Pending"
                            value={sellerRequests?.pendingSellerRequests || 0}
                            total={totalSellerRequests}
                            color="bg-amber-500"
                        />
                        <MiniRow
                            label="Rejected"
                            value={sellerRequests?.rejectedSellerRequests || 0}
                            total={totalSellerRequests}
                            color="bg-rose-500"
                        />
                    </div>
                </div>

                <div className="vault-card p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900">Tracking</h3>
                        <BsGraphUpArrow className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-4">
                        {Object.entries(tracking?.statusBreakdown || {}).length ? (
                            Object.entries(tracking.statusBreakdown).map(([label, value], i) => (
                                <MiniRow
                                    key={label}
                                    label={label}
                                    value={value}
                                    total={totalTracking}
                                    color={
                                        [
                                            "bg-blue-500",
                                            "bg-cyan-500",
                                            "bg-emerald-500",
                                            "bg-amber-500",
                                        ][i % 4]
                                    }
                                />
                            ))
                        ) : (
                            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                                No tracking data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 vault-card p-5 md:p-6">
                <div className="mb-5">
                    <h3 className="text-xl font-black text-slate-900">
                        Order momentum line view
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        A simple trend line for orders and sold items
                    </p>
                </div>

                <div className="h-[340px] min-w-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="shortDate"
                                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="orders"
                                name="Orders"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="quantity"
                                name="Items"
                                stroke="#14b8a6"
                                strokeWidth={3}
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminStatistics;