import { useState, useEffect, useContext } from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import AuthContext from "../contexts/AuthContext";
import { socket } from "../helpers/socket";
import { useMediaQuery } from "@mui/material";

export default function ChatRoom() {
  const { user } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    socket.emit("join", { userId: user._id });
  }, [user._id]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #141e30, #243b55)",
        color: "#fff",
      }}
    >
      {/* Sidebar */}
      {(!isMobile || !activeChatId) && (
        <Sidebar
          onSelectUser={setSelectedUser}
          setActiveChatId={setActiveChatId}
          activeChatId={activeChatId}
          onlineUsers={onlineUsers}
          setOnlineUsers={setOnlineUsers}
        />
      )}
      {/* Chat Area */}
      {(!isMobile || activeChatId) && (
        <ChatArea
          sx={{ flex: 1 }}
          selectedUser={selectedUser}
          chatId={activeChatId}
          onlineUsers={onlineUsers}
          onBack={() => {
            setActiveChatId(null);
            setSelectedUser(null);
          }
          }
        />
      )}
    </Box>
  );
}
