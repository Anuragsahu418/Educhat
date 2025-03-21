// frontend/src/lib/axios.js
import axios from "axios";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true, // Ensures cookies (e.g., jwt) are sent with requests
  timeout: 10000, // 10-second timeout
});

// Request interceptor to log outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Request:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("Request error:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh/logout
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error("Axios response error:", {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      url: error.response?.config?.url,
    });

    if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        // Optionally, implement token refresh logic here
        console.warn("401 Unauthorized - Consider logging out or refreshing token");
        // Example: Dispatch logout action or redirect to login
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Optional: Add retry logic for failed requests
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    if (!config || !response) return Promise.reject(error);

    const { status } = response;
    if (status === 503 || status === 504) {
      const maxRetries = 3;
      config.retryCount = config.retryCount || 0;
      if (config.retryCount < maxRetries) {
        config.retryCount += 1;
        console.log(`Retrying request (${config.retryCount}/${maxRetries}) to ${config.url}`);
        return new Promise((resolve) => setTimeout(() => resolve(axiosInstance(config)), 1000));
      }
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };