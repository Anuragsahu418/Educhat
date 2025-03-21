import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [], // This will store the list of online user IDs
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      console.log("checkAuth response:", res.data);
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error.response?.data || error.message);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      console.log("Signup response:", res.data);
      set({ authUser: res.data }); // authUser will now include role
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to sign up");
      console.error("Signup error:", error.response?.data || error.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      console.log("Login response:", res.data);
      set({ authUser: res.data }); // authUser will now include role
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log in");
      console.error("Login error:", error.response?.data || error.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log out");
      console.error("Logout error:", error.response?.data || error.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      console.log("Update profile response:", res.data);
      set({ authUser: res.data }); // authUser will include role
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error("Update profile error:", error.response?.data || error.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser) {
      console.log("Cannot connect socket: No authenticated user");
      return;
    }
    if (socket?.connected) {
      console.log("Socket already connected:", socket.id);
      return;
    }

    console.log("Connecting to Socket.io at:", BASE_URL);
    const newSocket = io(BASE_URL, {
      withCredentials: true,
      autoConnect: false,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("setUser", authUser._id.toString());
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      toast.error("Failed to connect to chat server");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      set({ onlineUsers: [] });
    });

    newSocket.on("onlineUsers", ({ userIds }) => {
      console.log("Received online users:", userIds);
      set({ onlineUsers: userIds });
    });

    newSocket.connect();
    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      console.log("Disconnecting socket:", socket.id);
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));