import { useState, useContext, useRef, useEffect } from 'react';
import {
  Fab,
  Snackbar,
  Alert,
  Box,
  Typography,
  Divider,
  useMediaQuery,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import AuthContext from '../contexts/AuthContext';
import { socket } from "../helpers/socket";
import axios from '../helpers/axios';

import useChatSocket from "../hooks/useChatSocket";
import MessageLists from './MessageLists';
import ChatInput from './ChatInput';
import ChatUserHeader from './ChatUserHeader';
import BackButton from './BackButton';
import LoadingSpinner from './LoadingSpinner';

export default function ChatArea({ selectedUser, chatId, onlineUsers, onBack }) {
  const { user } = useContext(AuthContext);
  const isMobile = useMediaQuery("(max-width:600px)");
  const messageListRef = useRef();
  const fileRef = useRef();
  const hasAutoScrolled = useRef(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [lastSeenInfo, setLastSeenInfo] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [previews, setPreviews] = useState([]);
  const [sending, setSending] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const isOnline = onlineUsers.some(user => user._id === selectedUser?._id);
  // Reset states when chat changes
  useEffect(() => {
    setSkip(0);
    setHasMore(true);
    setMessages([]);
  }, [chatId]);

  // Socket + Fetch logic
  const { fetchMessages } = useChatSocket({
    chatId,
    user,
    selectedUser,
    messages,
    setMessages,
    setTypingUser,
    setLastSeenInfo,
    setSelectedMessageId,
    setLoadingMessages
  });

  // Load messages initially
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;
      hasAutoScrolled.current = false;
      const res = await fetchMessages(0, 20);
      setMessages(res);
      setSkip(res.length);
      setIsInitialLoad(true);
    };
    loadMessages();
  }, [chatId, fetchMessages]);

  // Load more (pagination)
  const handleLoadMore = async () => {
    if (!hasMore || !isInitialLoad) return;
    const more = await fetchMessages(skip, 20);
    if (more.length === 0) setHasMore(false);
    setMessages((prev) => [...more, ...prev]);
    setSkip((prev) => prev + more.length);
  };

  // Message Actions
  const handleSend = async () => {
    const trimmed = input.trim();
    const status = isOnline ? "delivered" : "sent";
    if (!trimmed && previews.length === 0) return;

    setSending(true);

    let imageUrls = [];
    let imagePublicIds = [];
    if (previews.length > 0) {
      const formData = new FormData();
      previews.forEach((p) => formData.append("file", p.file));
      try {
        const res = await axios.post("/api/messages/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imageUrls = res.data.urls || [];
        imagePublicIds = res.data.publicIds || [];
      } catch (error) {
        console.error("Upload failed", error);
        setSending(false);
        return;
      }
    }
    // Build message payload
    const message = {
      sender: user._id,
      receiver: selectedUser?._id,
      chat: chatId,
      status,
      type: trimmed && imageUrls.length ? "mixed" : imageUrls.length ? "image" : "text",
      content: trimmed || "",
      images: imageUrls,
      imagePublicIds
    };

    if (editMode && editMessageId) {
      message._id = editMessageId;
      message.edited = true;
    }

    socket.emit("sendMessage", message);
    messageListRef.current?.scrollToBottom();

    // Reset states
    setInput("");
    setPreviews([]);
    if (fileRef.current) fileRef.current.value = "";
    setEditMode(false);
    setEditMessageId(null);
    setSending(false);
  };

  const handleEditMessage = async (message) => {
    setEditMode(true);
    setEditMessageId(message._id);
    setInput(message.content);
  };

  const handleDeleteMessage = (message) => {
    const isSender = message.sender?._id === user._id || message.sender === user._id;
    socket.emit("deleteMessage", { messageId: message._id, userId: user._id });
    if (isSender) {
      setSnackbarMessage("Message will be permanently deleted in 24 hours");
      setSnackbarOpen(true);
    }
  };

  const handleUndoDelete = (messageId) => {
    socket.emit("undoDeleteMessage", { messageId, userId: user._id });
  };

  return (
    <Box
      sx={{
        width: 500,
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        p: 2,
        position: "relative",
        margin: "0 auto",
        height: "100%"
      }}
    >
      {/* Mobile back button */}
      <BackButton isMobile={isMobile} onBack={onBack} selectedUser={selectedUser} />

      {/* Only show header if a user is selected */}
      <ChatUserHeader
        selectedUser={selectedUser}
        isOnline={isOnline}
        lastSeenInfo={lastSeenInfo}
      />

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 2 }} />
      {/* Loading */}
      {loadingMessages && (<LoadingSpinner />)}
      {/* Messages */}
      <MessageLists
        ref={messageListRef}
        messages={messages}
        user={user}
        onLoadMore={handleLoadMore}
        isInitialLoad={isInitialLoad}
        setIsInitialLoad={setIsInitialLoad}
        isAtBottom={isAtBottom}
        setIsAtBottom={setIsAtBottom}
        hasAutoScrolled={hasAutoScrolled}
        selectedMessageId={selectedMessageId}
        setSelectedMessageId={setSelectedMessageId}
        onEditMessage={(msg) => handleEditMessage(msg)}
        onDeleteMessage={(msg) => handleDeleteMessage(msg)}
        onUndoDeleteMessage={(id) => handleUndoDelete(id)}
      />
      {/* Arrow down to bottom */}
      {!isAtBottom && (
        <Fab
          color="primary"
          size="medium"
          onClick={() => messageListRef.current.scrollToBottom()}
          sx={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            boxShadow: 3,
            width: 48,
            height: 48,
          }}
        >
          <ArrowDownwardIcon />
        </Fab>
      )}
      {/* Typing indicator */}
      {typingUser && typingUser === selectedUser._id && (
        <Typography variant="caption" sx={{ color: "#90caf9", mb: 1 }}>
          {selectedUser.name} is typing...
        </Typography>
      )}
      {/* Input Box */}
      <ChatInput
        selectedUser={selectedUser}
        chatId={chatId}
        user={user}
        handleSend={handleSend}
        input={input}
        setInput={setInput}
        previews={previews}
        setPreviews={setPreviews}
        fileRef={fileRef}
        sending={sending}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
