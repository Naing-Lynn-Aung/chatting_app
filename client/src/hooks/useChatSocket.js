import { useCallback, useEffect } from "react";
import { socket } from "../helpers/socket";
import axios from '../helpers/axios';

export default function useChatSocket({
  chatId,
  user,
  selectedUser,
  messages,
  setMessages,
  setTypingUser,
  setLastSeenInfo,
  setSelectedMessageId,
  setLoadingMessages
}) {

  const fetchMessages = useCallback(async (skip = 0, limit = 20) => {
    if (!chatId) return;
    try {
      setLoadingMessages(true);
      const res = await axios.get(`/api/messages/${chatId}?skip=${skip}&limit=${limit}`);
      // setMessages(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }finally {
      setLoadingMessages(false);
  }
  }, [chatId, setLoadingMessages]);

  // User last seen updates
  useEffect(() => {
    if (!selectedUser?._id) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${selectedUser._id}`);
        setLastSeenInfo(res.data);
      } catch (err) {
        console.error("Failed to fetch selected user info:", err);
      }
    };
    fetchUser();
    const handleStatusUpdate = (data) => {
      if (data.userId === selectedUser?._id) {
        setLastSeenInfo((prev) => ({ ...prev, lastSeen: data.lastSeen }));
      }
    };
    socket.on("userLastSeenUpdated", handleStatusUpdate);
    return () => socket.off("userLastSeenUpdated", handleStatusUpdate);
  }, [selectedUser, setLastSeenInfo]);

  // Real-time message listeners
  useEffect(() => {
    const handleMessage = (message) => {
      const normalized = {
        ...message,
        sender: typeof message.sender === "string" ? { _id: message.sender } : message.sender,
      };
      if (message.chat === chatId) {
        setMessages((prev) => {
          const exists = prev.find((msg) => msg._id === message._id);
          return exists
            ? prev.map((msg) => (msg._id === message._id ? normalized : msg))
            : [...prev, normalized];
        });
      }
    };
    socket.on("messageSent", handleMessage);
    socket.on("receiveMessage", handleMessage);
    return () => {
      socket.off("messageSent", handleMessage)
      socket.off("receiveMessage", handleMessage)
    };
  }, [chatId, setMessages]);

  // Message delete / edit / restore / purge
  useEffect(() => {
    socket.on("messageDeleted", (message) => {
      setMessages((prev) => prev.map((msg) => (msg._id === message._id ? message : msg)));
    });
    socket.on("messagePurged", ({ _id }) => {
      setMessages((prev) => prev.filter((m) => m._id !== _id));
    });
    socket.on("messageEdited", (updatedMessage) => {
      setMessages((prev) => prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg)));
    });
    socket.on("messageRestored", (message) => {
      setMessages((prev) => prev.map((msg) => (msg._id === message._id ? message : msg)));
    });

    return () => {
      socket.off("messageDeleted")
      socket.off("messagePurged")
      socket.off("messageEdited")
      socket.off("messageRestored")
    };
  }, [messages, setMessages]);

  // Update message status (delivered/read)
  useEffect(() => {
    socket.on("messageStatus", ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    });
    return () => socket.off("messageStatus");
  }, [setMessages]);

  // Fetch messages or show welcome message
  useEffect(() => {
    if (!chatId) {
      setMessages([
        { _id: "welcome-1", sender: { _id: "system" }, content: "Welcome to ChatFlow 👋" },
        { _id: "welcome-2", sender: { _id: "system" }, content: "Select a user from the sidebar to start chatting." },
      ]);
      return;
    }

    socket.on("messageDelivered", (messageId) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, status: "delivered" } : msg))
      );
    });

    socket.on("typing", ({ userId }) => {
      if (userId !== user._id) {
        setTypingUser(userId);
        setTimeout(() => setTypingUser(null), 5000);
      }
    });

    return () => {
      socket.off("messageDelivered");
      socket.off("typing");
    };
  }, [chatId, user._id, setMessages, setTypingUser]);

  // Join chat room
  useEffect(() => {
    if (chatId) {
      socket.emit("joinChat", chatId);
    }
  }, [chatId]);

  // Mark messages as read
  useEffect(() => {
    if (!chatId || !selectedUser || selectedUser._id === user._id) return;

    const unreadMessages = messages.filter(
      (msg) =>
        msg.sender._id === selectedUser._id &&
        !msg.readBy.includes(user._id)
    );

    unreadMessages.forEach((msg) => {
      socket.emit("messageRead", { messageId: msg._id, userId: user._id });
    });
  }, [messages, chatId, selectedUser?._id, selectedUser, user._id]);

  // Reset selected message when chat changes
  useEffect(() => {
    setSelectedMessageId(null);
  }, [setSelectedMessageId]);

  return { fetchMessages };
}
