import {
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Tooltip,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ProfileModal from "./ProfileModal";
import { useState, useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";
import LogoutButton from "./LogoutButton";
import SearchPanel from "./SearchPanel";
import ChatList from "./ChatList";
import useChatSidebar from "../hooks/useChatSidebar";
import SearchForm from "./SearchForm";
import OnlineUserList from "./OnlineUserList";
import useChatActions from "../hooks/useChatAction";

export default function Sidebar({ onSelectUser, activeChatId, setActiveChatId, onlineUsers, setOnlineUsers }) {
  const [chatSummaries, setChatSummaries] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const { user: currentUser } = useContext(AuthContext);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const isMobile = useMediaQuery("(max-width:600px)");

  useChatSidebar({
    setChatSummaries,
    setOnlineUsers,
    searchTerm,
    setSearchResults,
  });

  const { clickUser, deleteChat } = useChatActions({
    currentUser,
    setActiveChatId,
    setChatSummaries,
    setSearchTerm,
    onSelectUser
  });

  const handleMenuOpen = (event, chatId) => {
    event.stopPropagation(); // prevent triggering clickUser
    setAnchorEl(event.currentTarget);
    setSelectedChatId(chatId);
  };

  const handleMenuClose = () => {
    if (document.activeElement?.tagName === "LI") {
      document.activeElement.blur();
    }
    setAnchorEl(null);
  };

  const handleDeleteChat = () => {
    setOpenDeleteDialog(true);
    handleMenuClose(); // close the menu first
  };

  const handleDeleteConfirm = async () => {
    try {
      const success = await deleteChat(selectedChatId);
      if (success && activeChatId === selectedChatId) {
        setActiveChatId(null);
        onSelectUser(null);
      }
      setSelectedChatId(null);
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: isMobile ? "100%" : 300,
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#fff">
          ChatFlow
        </Typography>
        <Tooltip title="More options">
          <IconButton>
            <MoreVertIcon sx={{ color: "#90caf9" }} />
          </IconButton>
        </Tooltip>
      </Box>

      <SearchForm
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      {searchTerm ? (
        <SearchPanel results={searchResults} onClickResult={(user) => clickUser(user)} />
      ) : (
        <>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
          {/* Online Users */}
          <OnlineUserList
            onlineUsers={onlineUsers}
            currentUser={currentUser}
            onClickUser={(user) => clickUser(user)}
            isMobile={isMobile}
          />
          {/* Profile Section */}
          <ProfileModal />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1 }} />
          {/* Chat List */}
          <ChatList
            chatSummaries={chatSummaries}
            activeChatId={activeChatId}
            onClickUser={(user) => clickUser(user)}
            currentUser={currentUser}
            onHandleMenuOpen={(e, chatId) => handleMenuOpen(e, chatId)}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleDeleteChat}>Delete Chat</MenuItem>
          </Menu>
          <ConfirmDialog
            open={openDeleteDialog}
            title="Delete Chat"
            message="Are you sure you want to delete this chat?"
            confirmText="Delete"
            type="danger"
            onConfirm={handleDeleteConfirm}
            onClose={() => setOpenDeleteDialog(false)}
          />
          {chatSummaries.length === 0 && <Box sx={{ p: 2, color: "#aaa", flexGrow: 1, m: 'auto' }}>No messages yet.</Box>}

          <LogoutButton />
        </>
      )}

    </Paper>
  );
}
