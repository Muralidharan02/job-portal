import axios from "axios";
import offlineApi from "./offlineApi";

export const offlineMode = import.meta.env.VITE_OFFLINE_MODE !== "false";

const api = offlineMode
  ? offlineApi
  : axios.create({ baseURL: "http://localhost:5000/api" });

if (!offlineMode) {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

export default api;
