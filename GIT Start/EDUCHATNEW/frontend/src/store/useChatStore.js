// frontend/src/store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  selectedMessages: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data, selectedMessages: [] });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  toggleMessageSelection: (messageId) => {
    set((state) => {
      const selectedMessages = state.selectedMessages.includes(messageId)
        ? state.selectedMessages.filter((id) => id !== messageId)
        : [...state.selectedMessages, messageId];
      return { selectedMessages };
    });
  },

  deleteSelectedMessages: async () => {
    const { selectedMessages, messages } = get();
    if (selectedMessages.length === 0) return;

    try {
      await axiosInstance.delete("/messages/delete", { data: { messageIds: selectedMessages } });
      set({
        messages: messages.filter((msg) => !selectedMessages.includes(msg._id)),
        selectedMessages: [],
      });
      const socket = useAuthStore.getState().socket;
      socket.emit("deleteMessage", selectedMessages);
      toast.success("Messages deleted successfully");
    } catch (error) {
      toast.error(error.response.data.message || "Failed to delete messages");
    }
  },

  forwardSelectedMessages: async () => {
    const { selectedMessages, messages, selectedUser } = get();
    if (selectedMessages.length === 0) return;

    try {
      const messagesToForward = messages.filter((msg) => selectedMessages.includes(msg._id));
      console.log("Forwarding messages:", messagesToForward, "to user:", selectedUser._id);
      toast.success("Messages forwarded (placeholder)");
      set({ selectedMessages: [] });
    } catch (error) {
      toast.error("Failed to forward messages");
    }
  },

  clearSelection: () => set({ selectedMessages: [] }),

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
      set({ messages: [...get().messages, newMessage] });
    });

    socket.on("deleteMessage", (deletedMessageIds) => {
      set({
        messages: get().messages.filter((msg) => !deletedMessageIds.includes(msg._id)),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("deleteMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));