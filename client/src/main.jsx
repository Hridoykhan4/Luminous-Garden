import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Router from "./routers/Router";
import AuthProvider from "./providers/AuthProvider";
import "./index.css";

document.documentElement.classList.remove("dark");
document.documentElement.classList.add("light");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const toasterOptions = {
  duration: 3000,
  className: "glass",
  style: {
    background: "oklch(0.25 0.04 160 / 0.9)", 
    color: "oklch(0.98 0.01 160)",
    backdropFilter: "blur(10px)",
    border: "1px solid oklch(0.88 0.02 160 / 0.1)",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
  },
  success: {
    iconTheme: {
      primary: "oklch(0.45 0.12 160)", 
      secondary: "#fff",
    },
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={toasterOptions} />
        <RouterProvider
          router={Router}
          future={{ v7_startTransition: true }} 
        />
      </AuthProvider>

      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  </StrictMode>,
);
