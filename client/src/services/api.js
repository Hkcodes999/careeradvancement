import axios from "axios";

const API_BASE = "http://localhost:5000/api";

/* ---------------- AXIOS INSTANCE ---------------- */
const api = axios.create({
  baseURL: API_BASE,
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 AUTO LOGOUT ON TOKEN EXPIRY
    if (error.response?.data?.code === "TOKEN_EXPIRED") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* ---------------- EXISTING FUNCTION (PRESERVED) ---------------- */
export const testServer = async () => {
  const res = await api.get("/assessment/test");
  return res.data;
};

export default api;
