import { useEffect, useCallback } from "react";
import axios from '../helpers/axios';
import { socket } from "../helpers/socket";

export default function useChatSidebar({
  setChatSummaries,
  setOnlineUsers,
  searchTerm,
  setSearchResults,
}) {
  // Fetch chat summaries
  const fetchChats = useCallback(async () => {
    try {
      const res = await axios.get("/api/chats/summary");
      if (res.status === 200) {
        setChatSummaries(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  }, [setChatSummaries]);

  // Initial fetch on mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Track online users
  useEffect(() => {
    const handleOnlineUsers = (userList) => {
      setOnlineUsers(userList);
    };
    socket.on("onlineUsers", handleOnlineUsers);
    return () => socket.off("onlineUsers", handleOnlineUsers);
  }, [setOnlineUsers]);

  // Refetch chats when a message is sent
  useEffect(() => {
    socket.on("messageSent", fetchChats);
    return () => socket.off("messageSent", fetchChats);
  }, [fetchChats]);

  // Refetch chats on sidebar-related updates
  useEffect(() => {
    socket.on("sidebarUpdate", fetchChats);
    return () => {
      socket.off("sidebarUpdate", fetchChats);
    };
  }, [fetchChats]);

  // Search users by keyword
  useEffect(() => {
    if (!searchTerm) return;

    const fetchResults = async () => {
      try {
        const res = await axios.get(`/api/users/search?key=${searchTerm}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search failed:", err);
      }
    };

    fetchResults();
  }, [searchTerm, setSearchResults]);
}