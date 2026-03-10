import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children: [
        {
            index: true,
            element: 'h'
        }
    ]
  },
]);

export default Router;