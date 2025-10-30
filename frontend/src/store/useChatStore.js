import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { Socket } from "socket.io-client";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/messages/users");
      set({ users: response.data });
    } catch (error) {
      toast.error(error.response.data.message || "Internal Server Error");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });

      // Auto-mark as seen if user is viewing the chat
      if (!document.hidden) {
        setTimeout(() => {
          get().markMessagesAsSeen(selectedUser._id);
        }, 100);
      }
    });

    socket.on("messagesSeen", (data) => {
      const { messages } = get();
      const currentUserId = useAuthStore.getState().authUser._id;

      // Mark ALL messages sent by current user to the recipient as seen
      const updatedMessages = messages.map((message) => {
        if (
          message.senderId === currentUserId &&
          message.recieverId === data.userId &&
          !message.seen // Only update if not already seen
        ) {
          return { ...message, seen: true, seenAt: new Date() };
        }
        return message;
      });

      set({ messages: updatedMessages });
    });

    socket.on("messageDeleted", (data) => {
      const { messages } = get();
      const updatedMessages = messages.map((message) =>
        message._id === data.messageId
          ? {
              ...message,
              isDeleted: true,
              text: null,
              image: null,
              video: null,
            }
          : message
      );
      set({ messages: updatedMessages });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messagesSeen");
    socket.off("messageDeleted");
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  markMessagesAsSeen: async (userId) => {
    try {
      await axiosInstance.put(`/messages/seen/${userId}`);
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);

      // Update local state
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, isDeleted: true, text: null, image: null, video: null }
            : msg
        ),
      });

      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  setReplyTo: (message) => {
    set({ replyTo: message });
  },

  clearReplyTo: () => {
    set({ replyTo: null });
  },

  replyTo: null,

  setSelectedUser: async (selectedUser) => set({ selectedUser }),
}));
