import { useCallback } from "react";
import axios from "../helpers/axios";

export default function useChatActions({
  currentUser,
  setActiveChatId,
  setChatSummaries,
  setSearchTerm,
  onSelectUser
}) {
  const clickUser = useCallback(async (user) => {
    try {
      const res = await axios.post("/api/chats", { userId: user._id });
      const chatId = res.data._id;

      onSelectUser(user);
      setActiveChatId(chatId);
      // Mark messages as read
      await axios.put("/api/messages/read", {
        chatId,
        userId: currentUser._id,
      });
      setSearchTerm("");
      // Reset unread count
      setChatSummaries((prev) =>
        prev.map((summary) =>
          summary.chatId === chatId ? { ...summary, unreadCount: 0 } : summary
        )
      );
      return chatId;
    } catch (err) {
      console.error("Failed to open chat:", err);
    }
  }, [currentUser, setActiveChatId, setChatSummaries, onSelectUser, setSearchTerm]);

  const deleteChat = useCallback(async (chatId) => {
    try {
      await axios.delete(`/api/chats/${chatId}`);
      setChatSummaries((prev) => prev.filter((c) => c.chatId !== chatId));
      return true;
    } catch (err) {
      console.error("Failed to delete chat:", err);
      return false;
    }
  }, [setChatSummaries]);

  return { clickUser, deleteChat };

}