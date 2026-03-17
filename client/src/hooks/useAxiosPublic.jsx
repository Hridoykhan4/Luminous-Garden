import axios from "axios";
import { useMemo } from "react";

const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

const useAxiosPublic = () => {
    return useMemo(() => axiosPublic, []);
};

export default useAxiosPublic;