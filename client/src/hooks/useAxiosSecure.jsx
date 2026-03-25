import axios from "axios";
import useAuth from "./useAuth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
const useAxiosSecure = () => {
  const { logOut, setLoading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    const axiosInterceptor = axiosInstance.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          await logOut();
          toast.error(
            err?.response?.data?.message ||
            "Session expired. Please log in again.",
          );
          setLoading(false)
          nav("/login", { replace: true });
        }
        return Promise.reject(err);
      },
    );

    return () => axiosInstance.interceptors.response.eject(axiosInterceptor);
  }, [nav, logOut, setLoading]);
  return axiosInstance;
};

export default useAxiosSecure;
