import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

// Layouts
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Guards
import PrivateRoute from "./PrivateRoute";
import SellerRoute from "./SellerRoute";
import AdminRoute from "./AdminRoute";
import UserRoute from "./UserRoute";

// Shared
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import Forbidden from "@/pages/Forbidden/Forbidden";

// Loadable helper
// eslint-disable-next-line no-unused-vars
const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
);

// Public Pages
const Home = Loadable(lazy(() => import("../pages/Home/Home")));
const Plants = Loadable(lazy(() => import("../pages/Plants/Plants")));
const PlantDetails = Loadable(
  lazy(() => import("../pages/PlantDetails/PlantDetails")),
);
const OrderTracking = Loadable(
  lazy(() => import("../pages/OrderTracking/OrderTracking")),
);
const About = Loadable(lazy(() => import("../pages/About/About")));
const CheckoutSuccess = Loadable(
  lazy(() => import("../pages/Checkout/CheckoutSuccess")),
);
const CheckoutCancel = Loadable(
  lazy(() => import("../pages/Checkout/CheckoutCancel")),
);


const CheckoutSSLSuccess = Loadable(
  lazy(() => import("../pages/Checkout/CheckoutSSLSuccess")),
);
const CheckoutSSLFail = Loadable(
  lazy(() => import("../pages/Checkout/CheckoutSSLFail")),
);
const CheckoutSSLCancel = Loadable(
  lazy(() => import("../pages/Checkout/CheckoutSSLCancel")),
);


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
const MyOrders = Loadable(
  lazy(() => import("../pages/Dashboard/Common/MyOrders")),
);

// Dashboard: Customer
const BeSeller = Loadable(
  lazy(() => import("../pages/Dashboard/Customer/BeSeller")),
);

// Dashboard: Seller
const AddPlant = Loadable(
  lazy(() => import("../pages/Dashboard/Seller/AddPlant")),
);
const MyInventory = Loadable(
  lazy(() => import("../pages/Dashboard/Seller/MyInventory")),
);
const UpdatePlant = Loadable(
  lazy(() => import("../pages/Dashboard/Seller/UpdatePlant")),
);

// Dashboard: Admin
const ManageUsers = Loadable(
  lazy(() => import("../pages/Dashboard/Admin/ManageUsers")),
);
const AllOrders = Loadable(
  lazy(() => import("../pages/Dashboard/Admin/AllOrders")),
);

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
      { path: "orders/track/:orderId", element: <OrderTracking /> },

      // Stripe return pages — 
      { path: "checkout/success", element: <CheckoutSuccess /> },
      { path: "checkout/cancel", element: <CheckoutCancel /> },


      // SSL COMMERZE return pages 
      { path: "checkout/ssl/success", element: <CheckoutSSLSuccess /> },
      { path: "checkout/ssl/fail", element: <CheckoutSSLFail /> },
      { path: "checkout/ssl/cancel", element: <CheckoutSSLCancel /> },
    ],
  },

  // Public auth routes
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },

  // Protected dashboard
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      // Common
      { index: true, element: <Statistics /> },
      { path: "profile", element: <Profile /> },
      { path: "my-orders", element: <MyOrders /> },

      // Customer
      {
        path: "be-seller",
        element: (
          <UserRoute>
            <BeSeller />
          </UserRoute>
        ),
      },

      // Seller
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
      {
        path: "update-plant/:id",
        element: (
          <SellerRoute>
            <UpdatePlant />
          </SellerRoute>
        ),
      },

      // Admin
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
  { path: "*", element: <ErrorPage /> },
]);

export default Router;