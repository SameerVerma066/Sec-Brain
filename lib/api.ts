import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const auth = {
  signup: (username: string, password: string) =>
    apiClient.post("/api/v1/signup", { username, password }),
  signin: (username: string, password: string) =>
    apiClient.post("/api/v1/signin", { username, password }),
};

export const content = {
  create: (
    title: string,
    link: string,
    type: "twitter" | "youtube" | "document"
  ) =>
    apiClient.post("/api/v1/content", { title, link, type }),
  list: (params?: { type?: "twitter" | "youtube" | "document"; tag?: string }) =>
    apiClient.get("/api/v1/content", { params }),
  delete: (contentId: string) =>
    apiClient.delete("/api/v1/content", { data: { contentId } }),
};

export const tags = {
  list: () => apiClient.get("/api/v1/tags"),
};

export const share = {
  create: () => apiClient.post("/api/v1/brain/share", { share: true }),
  remove: () => apiClient.post("/api/v1/brain/share", { share: false }),
  fetch: (hash: string) => apiClient.get(`/api/v1/brain/${hash}`),
};

export default apiClient;
