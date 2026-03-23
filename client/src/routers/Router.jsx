import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";

// --- Layouts ---
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// --- Components & Guards ---
import PrivateRoute from "./PrivateRoute";
import SellerRoute from "./SellerRoute";
import AdminRoute from "./AdminRoute"; 
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import Forbidden from "@/pages/Forbidden/Forbidden";

// --- 1. Lazy Loading ---
// eslint-disable-next-line no-unused-vars
const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
);

// --- 2. Lazy Imports ---

// Public Pages
const Home = Loadable(lazy(() => import("../pages/Home/Home")));
const Plants = Loadable(lazy(() => import("../pages/Plants/Plants")));
const PlantDetails = Loadable(
  lazy(() => import("../pages/PlantDetails/PlantDetails")),
);
const About = Loadable(lazy(() => import("../pages/About/About")));

// Auth Pages
const Login = Loadable(lazy(() => import("../pages/Login/Login")));
const SignUp = Loadable(lazy(() => import("../pages/SignUp/SignUp")));

// Dashboard: Common
const Statistics = Loadable(
  lazy(() => import("../pages/Dashboard/Common/Statistics")),
);
const Profile = Loadable(
  lazy(() => import("../pages/Dashboard/Common/Profile")),
);

// Dashboard: Seller
const AddPlant = Loadable(
  lazy(() => import("../pages/Dashboard/Seller/AddPlant")),
);
const MyInventory = Loadable(
  lazy(() => import("../pages/Dashboard/Seller/MyInventory")),
);

// Dashboard: Admin
const ManageUsers = Loadable(
  lazy(() => import("../pages/Dashboard/Admin/ManageUsers")),
);
const AllOrders = Loadable(
  lazy(() => import("../pages/Dashboard/Admin/AllOrders")),
);

//  Router Configuration
const Router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "plants", element: <Plants /> },
      { path: "plants/:id", element: <PlantDetails /> },
      { path: "about", element: <About /> },
    ],
  },

  // Auth Routes
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },

  // --- Dashboard Structure ---
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      // 🟢 Common Routes
      { index: true, element: <Statistics /> },
      { path: "profile", element: <Profile /> },

      // 🟡 Seller Routes
      {
        path: "add-plant",
        element: (
          <SellerRoute>
            <AddPlant />
          </SellerRoute>
        ),
      },
      {
        path: "my-plants",
        element: (
          <SellerRoute>
            <MyInventory />
          </SellerRoute>
        ),
      },

      // 🔴 Admin Routes
      {
        path: "manage-users",
        element: (
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        ),
      },
      {
        path: "all-orders",
        element: (
          <AdminRoute>
            <AllOrders />
          </AdminRoute>
        ),
      },
    ],
  },


  { path: "/forbidden", element: <Forbidden /> },
  { path: "*", element: <ErrorPage></ErrorPage>}, 
]);

export default Router;
