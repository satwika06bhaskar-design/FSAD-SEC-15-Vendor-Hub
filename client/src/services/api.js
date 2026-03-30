import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("marketplace_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  login: (payload) => api.post("/login", payload),
  register: (payload) => api.post("/register", payload),
  sellerRegister: (payload) => api.post("/seller-register", payload),
};

export const buyerApi = {
  products: () => api.get("/products"),
  checkout: (payload) => api.post("/cart/checkout", payload),
  orders: () => api.get("/orders"),
  dispute: (payload) => api.post("/dispute", payload),
};

export const sellerApi = {
  dashboard: () => api.get("/seller/dashboard"),
  products: () => api.get("/seller/products"),
  addProduct: (payload) => api.post("/products", payload),
  updateProduct: (id, payload) => api.put(`/products/${id}`, payload),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  orders: () => api.get("/seller/orders"),
  updateOrderStatus: (id, status) => api.put(`/seller/orders/${id}/status`, { status }),
  analytics: () => api.get("/seller-analytics"),
  payouts: () => api.get("/seller/payouts"),
};

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
  sellers: () => api.get("/admin/sellers"),
  approveSeller: (id, approved) => api.put(`/admin/sellers/${id}/approve`, { approved }),
  commission: () => api.get("/admin/commission"),
  updateCommission: (rate) => api.put("/admin/commission", { rate }),
  disputes: () => api.get("/admin/disputes"),
  resolveDispute: (id, action) => api.put(`/dispute/${id}`, { action }),
  analytics: () => api.get("/admin-analytics"),
};

export default api;
