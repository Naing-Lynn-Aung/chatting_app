import {
  Box,
  Avatar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function ChatList({ chatSummaries, activeChatId, onClickUser, currentUser, onHandleMenuOpen }) {
  return (
    <List sx={{ flexGrow: 1, overflowY: "auto" }}>
      {chatSummaries.map(({ user, chatId, deleted, deletedBy, lastMessage, unreadCount, isPhoto }) => (
        <ListItem
          button="true"
          key={chatId}
          selected={activeChatId === chatId}
          sx={{
            position: "relative",
            "&.Mui-selected": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.08)",
              "& .chat-options": {
                opacity: 1,
                pointerEvents: "auto",
              },
            },

          }}
          onClick={() => onClickUser(user)}
        >
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, cursor: "pointer" }}>
            <ListItemAvatar>
              <Avatar src={user.avatar} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                    {user.name}
                  </Typography>
                  {unreadCount > 0 && (
                    <Box
                      sx={{
                        backgroundColor: "#2196f3",
                        color: "#fff",
                        borderRadius: "12px 12px 12px 0",
                        px: 1.2,
                        py: 0.3,
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        ml: 1,
                        boxShadow: "0 2px 4px rgba(33,150,243,0.3)",
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Box>
                  )}

                </Box>
              }
              secondary={chatSummaries && deleted || deletedBy?.includes(currentUser._id) ? "This message was deleted" : isPhoto ? "Sending you a photo" : lastMessage.length > 0 ? lastMessage : "Say Hi to start conversation"}
              secondaryTypographyProps={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "200px"
              }}
              primaryTypographyProps={{ color: "#fff", fontWeight: 500 }}
            />
          </Box>
          <IconButton
            className="chat-options"
            onClick={(e) => onHandleMenuOpen(e, chatId)}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0,
              pointerEvents: "none",
              transition: "opacity 0.2s ease",
              color: "#fff",
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
}
