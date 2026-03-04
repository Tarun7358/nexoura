import axios from "axios";

const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");
const normalizedBaseHost =
  /Android/i.test(typeof navigator !== "undefined" ? navigator.userAgent : "") &&
  rawApiBaseUrl.includes("://localhost")
    ? rawApiBaseUrl.replace("://localhost", "://10.0.2.2")
    : rawApiBaseUrl;

const API_BASE_URL = normalizedBaseHost.endsWith("/api")
  ? normalizedBaseHost
  : `${normalizedBaseHost}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nexouraToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    const isAuthAttempt =
      requestUrl.includes("/users/login") ||
      requestUrl.includes("/users/register") ||
      requestUrl.includes("/users/google-login");

    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem("nexouraToken");
      localStorage.removeItem("nexouraUserId");
      localStorage.removeItem("nexouraRole");
      window.location.href = "/login";
    }

    if (status === 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (gamerTag, email, password) =>
    api.post("/users/register", { gamerTag, email, password }),

  login: (email, password) =>
    api.post("/users/login", { email, password }),

  googleLogin: (idToken) =>
    api.post("/users/google-login", { idToken }),

  getProfile: (userId) =>
    api.get(`/users/${userId}`),

  updateProfile: (userId, data) =>
    api.put(`/users/${userId}`, data),

  getLeaderboard: () =>
    api.get("/users"),
};

export const tournamentAPI = {
  getAll: () =>
    api.get("/tournaments"),

  getById: (id) =>
    api.get(`/tournaments/${id}`),

  create: (tournamentData) =>
    api.post("/tournaments", tournamentData),

  join: (id) =>
    api.post(`/tournaments/${id}/join`),

  update: (id, data) =>
    api.put(`/tournaments/${id}`, data),

  delete: (id) =>
    api.delete(`/tournaments/${id}`),
};

export const walletAPI = {
  getBalance: () =>
    api.get("/wallet/balance"),

  deposit: (amount, paymentMethod) =>
    api.post("/wallet/deposit", { amount, paymentMethod }),

  withdraw: (amount, paymentMethod) =>
    api.post("/wallet/withdraw", { amount, paymentMethod }),

  getTransactions: (params = {}) =>
    api.get("/wallet/transactions", { params }),

  joinTournament: (tournamentId, entryFee) =>
    api.post("/wallet/join-tournament", { tournamentId, entryFee }),

  checkActivity: () =>
    api.get("/wallet/check-activity"),
};

export const teamAPI = {
  getUserTeams: (userId) =>
    api.get(`/teams/user/${userId}`),

  getById: (id) =>
    api.get(`/teams/${id}`),

  create: (teamData) =>
    api.post("/teams", teamData),

  addMember: (teamId, userId) =>
    api.post(`/teams/${teamId}/members`, { userId }),

  removeMember: (teamId, userId) =>
    api.delete(`/teams/${teamId}/members/${userId}`),

  update: (id, data) =>
    api.put(`/teams/${id}`, data),

  delete: (id) =>
    api.delete(`/teams/${id}`),
};

export const matchRoomAPI = {
  create: (data) =>
    api.post("/match-rooms", data),

  getByTournament: (tournamentId) =>
    api.get(`/match-rooms/tournament/${tournamentId}`),

  getMyRooms: () =>
    api.get("/match-rooms/my"),

  update: (roomId, data) =>
    api.put(`/match-rooms/${roomId}`, data),
};

export default api;
