import axios from "axios";
// import { getStoredToken } from "@/lib/auth-token";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // const token = await getStoredToken();

    // if (token?.access_token && config.headers) {
    // config.headers.set("Authorization", `Bearer ${token.access_token}`);
    config.headers.Authorization = `Bearer VnklZUGlhddj64Oq6WeGFfzwxXE3oOBw`;
    // }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
