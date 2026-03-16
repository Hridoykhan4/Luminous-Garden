import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import Router from "./routers/Router";
import AuthProvider from "./providers/AuthProvider";
import { Toaster } from "react-hot-toast";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Toaster></Toaster>
      <RouterProvider router={Router}></RouterProvider>
    </AuthProvider>
  </StrictMode>,
);
