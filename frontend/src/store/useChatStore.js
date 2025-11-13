import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

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
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser?._id;

      if (isMessageSentFromSelectedUser) {
        set({
          messages: [...get().messages, newMessage],
        });

        // Auto-mark as seen if user is viewing the chat
        if (!document.hidden) {
          setTimeout(() => {
            get().markMessagesAsSeen(selectedUser._id);
          }, 100);
        }
      }

      // Update users list with new last message and unread count
      const { users } = get();
      const updatedUsers = users.map((user) => {
        if (user._id === newMessage.senderId) {
          return {
            ...user,
            lastMessage: {
              text: newMessage.text,
              image: newMessage.image,
              video: newMessage.video,
              senderId: newMessage.senderId,
              createdAt: newMessage.createdAt,
              isDeleted: newMessage.isDeleted,
            },
            unreadCount: isMessageSentFromSelectedUser
              ? user.unreadCount
              : (user.unreadCount || 0) + 1,
          };
        }
        return user;
      });

      // Sort users by last message time
      updatedUsers.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || new Date(0);
        const bTime = b.lastMessage?.createdAt || new Date(0);
        return new Date(bTime) - new Date(aTime);
      });

      set({ users: updatedUsers });
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
    const { selectedUser, messages, users } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });

      // Update users list with new last message
      const updatedUsers = users.map((user) => {
        if (user._id === selectedUser._id) {
          return {
            ...user,
            lastMessage: {
              text: res.data.text,
              image: res.data.image,
              video: res.data.video,
              senderId: res.data.senderId,
              createdAt: res.data.createdAt,
              isDeleted: res.data.isDeleted,
            },
          };
        }
        return user;
      });

      // Sort users by last message time
      updatedUsers.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || new Date(0);
        const bTime = b.lastMessage?.createdAt || new Date(0);
        return new Date(bTime) - new Date(aTime);
      });

      set({ users: updatedUsers });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  markMessagesAsSeen: async (userId) => {
    try {
      await axiosInstance.put(`/messages/seen/${userId}`);

      // Reset unread count for this user
      const { users } = get();
      const updatedUsers = users.map((user) => {
        if (user._id === userId) {
          return { ...user, unreadCount: 0 };
        }
        return user;
      });
      set({ users: updatedUsers });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);

      const { messages, users, selectedUser } = get();

      // Update local state
      const updatedMessages = messages.map((msg) =>
        msg._id === messageId
          ? { ...msg, isDeleted: true, text: null, image: null, video: null }
          : msg
      );

      set({ messages: updatedMessages });

      // Update users list if the deleted message was the last message
      const updatedUsers = users.map((user) => {
        if (
          user._id === selectedUser._id &&
          user.lastMessage &&
          messages.find((m) => m._id === messageId)
        ) {
          // Find the last non-deleted message
          const lastMessage = updatedMessages
            .filter((m) => !m.isDeleted)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

          return {
            ...user,
            lastMessage: lastMessage
              ? {
                  text: lastMessage.text,
                  image: lastMessage.image,
                  video: lastMessage.video,
                  senderId: lastMessage.senderId,
                  createdAt: lastMessage.createdAt,
                  isDeleted: lastMessage.isDeleted,
                }
              : null,
          };
        }
        return user;
      });

      set({ users: updatedUsers });

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
