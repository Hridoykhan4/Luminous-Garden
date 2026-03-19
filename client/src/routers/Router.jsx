import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import ErrorPage from "../pages/ErrorPage/ErrorPage";

import PrivateRoute from "./PrivateRoute";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";

// ---  Lazy Loading Wrapper ---
// eslint-disable-next-line no-unused-vars
const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
);

// --- Lazy Imports ---
const Home = Loadable(lazy(() => import("../pages/Home/Home")));
const Login = Loadable(lazy(() => import("../pages/Login/Login")));
const SignUp = Loadable(lazy(() => import("../pages/SignUp/SignUp")));
const AddPlant = Loadable(
  lazy(() => import("../pages/Dashboard/Seller/AddPlant")),
);
const PlantDetails = Loadable(
  lazy(() => import("../pages/PlantDetails/PlantDetails")),
);
const DashboardLayout = Loadable(
  lazy(() => import("../layouts/DashboardLayout")),
);
const Statistics = Loadable(
  lazy(() => import("../pages/Dashboard/Common/Statistics")),
);

const Router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "plant/:id",
        element: <PlantDetails />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Statistics />,
      },
      {
        path: "add-plant",
        element: <AddPlant></AddPlant>,
      },
    ],
  },
]);

export default Router;
