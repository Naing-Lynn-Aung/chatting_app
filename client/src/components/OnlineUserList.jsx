import { useState } from "react";
import {
  Drawer,
  Box,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
export default function OnlineUserList({ onlineUsers, currentUser, onClickUser, isMobile }) {
  const [showDrawer, setShowDrawer] = useState(false);
  return (
    <>
      <Box sx={{ px: 2, py: 1 }}>
        <Box sx={{
          display: "flex",
          justifyContent: "space-between"
        }}>
          <Typography variant="subtitle2" sx={{ color: "#90caf9", mb: 1 }}>
            Online Users
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "#90caf9", mb: 1, cursor: "pointer", textDecoration: "underline" }} onClick={() => setShowDrawer(true)}>
            See All
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {onlineUsers.filter(usr => usr._id !== currentUser._id && usr.status === "online").slice(0, 5).map((user) => (
            <Tooltip title={user.name} key={user._id} onClick={() => onClickUser(user)}>
              <Avatar
                src={user.avatar}
                sx={{
                  border: "2px solid #4caf50",
                  width: 36,
                  height: 36,
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>
      <Drawer anchor="left" open={showDrawer} onClose={() => setShowDrawer(false)}>
        <Box sx={{
          width: 280, p: 2, height: "100%",
          backgroundColor: "#141e30", backdropFilter: "blur(10px)", color: "#fff"
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Online Users</Typography>
            {isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", px: 1, py: 1 }}>
                <IconButton onClick={() => setShowDrawer(false)}>
                  <ArrowBackIcon sx={{ color: "#90caf9" }} />
                </IconButton>
              </Box>
            )}
          </Box>
          {onlineUsers
            .filter((usr) => usr._id !== currentUser._id)
            .map((usr) => (
              <Box
                key={usr._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    p: 1
                  },
                }}
                onClick={() => onClickUser(usr)}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar src={usr.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                  <Typography variant="body2">{usr.name}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "#4caf50", fontWeight: 500 }}>
                  Active now
                </Typography>
              </Box>
            ))}
          {onlineUsers.length === 1 && <Typography sx={{ p: 2, color: "#aaa", height: "90%", display: "flex", alignItems: "center", justifyContent: "center" }}>No active users yet.</Typography>}
        </Box>
      </Drawer>
    </>
  );
}
