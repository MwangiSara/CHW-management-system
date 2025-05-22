import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

//  axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");
const setTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};
const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const { access } = response.data;
          setTokens(access, refreshToken);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          window.location.href = "/login";
        }
      } else {
        clearTokens();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (credentials) => api.post("/auth/login/", credentials),
  logout: (refreshToken) =>
    api.post("/auth/logout/", { refresh: refreshToken }),
  getProfile: () => api.get("/auth/profile/"),
  changePassword: (data) => api.put("/auth/change-password/", data),
};

export const commoditiesAPI = {
  getAll: () => api.get("/commodities/"),
  getById: (id) => api.get(`/commodities/${id}/`),
  getCategories: () => api.get("/commodities/categories/"),
};

export const requestsAPI = {
  getAll: () => api.get("/requests/"),
  create: (data) => api.post("/requests/create/", data),
  getById: (id) => api.get(`/requests/${id}/`),
  update: (id, data) => api.put(`/requests/${id}/`, data),
  getPending: () => api.get("/requests/pending/"),
  getLogs: (requestId) => api.get(`/requests/${requestId}/logs/`),
  getDashboardStats: () => api.get("/requests/dashboard/stats/"),
  getAllocationStatus: () => api.get("/requests/allocation-status/"),
  getAnalytics: () => api.get("/requests/analytics/"),
};

export { setTokens, clearTokens, getAccessToken };
export default api;
