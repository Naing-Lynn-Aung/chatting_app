import {
  Button,
  IconButton,
  Box,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { forwardRef, useImperativeHandle, useEffect, useRef, useState } from "react";
import { useCallback } from "react";

const MessageLists = forwardRef(function MessageLists({
  messages,
  user,
  onLoadMore,
  isInitialLoad,
  isAtBottom,
  setIsAtBottom,
  selectedMessageId,
  setSelectedMessageId,
  onEditMessage,
  onDeleteMessage,
  onUndoDeleteMessage
}, ref) {
  const containerRef = useRef(null);
  const isFetchingRef = useRef(false); // prevent double API calls
  const manualScrollTriggered = useRef(false);

  // Scroll to bottom when messages update
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    },
  }));

  useEffect(() => {
    if (isAtBottom && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isAtBottom]);

  // Scroll event logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isInitialLoad) return;

    const handleScroll = async () => {
      const nearTop = container.scrollTop === 0;
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;

      setIsAtBottom(nearBottom);
      if (!manualScrollTriggered.current && container.scrollTop !== 0) {
        manualScrollTriggered.current = true;
      }
      if (nearTop && !isFetchingRef.current && onLoadMore) {
        isFetchingRef.current = true;
        const oldScrollHeight = container.scrollHeight;
        await onLoadMore();
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTo({
            top: newScrollHeight - oldScrollHeight + container.scrollTop,
            behavior: "instant", // don't animate when loading old messages
          });
          isFetchingRef.current = false;
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [onLoadMore, isInitialLoad, setIsAtBottom]);

  // State for menu and hover
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuMessageId, setMenuMessageId] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  //  Menu Handlers
  const handleMenuOpen = (event, messageId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuMessageId(messageId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuMessageId(null);
  };

  const handleEdit = useCallback(() => {
    const messageToEdit = messages.find((msg) => msg._id === menuMessageId);
    if (messageToEdit && onEditMessage) onEditMessage(messageToEdit);
    handleMenuClose();
  }, [messages, menuMessageId, onEditMessage]);

  const handleDelete = useCallback(() => {
    const messageToDelete = messages.find((msg) => msg._id === menuMessageId);
    if (messageToDelete && onDeleteMessage) onDeleteMessage(messageToDelete);
    handleMenuClose();
  }, [messages, menuMessageId, onDeleteMessage]);

  const handleUndoDelete = (messageId) => {
    if (onUndoDeleteMessage) onUndoDeleteMessage(messageId);
  };

  const canEditMessage = (msg) =>
    msg?.sender?._id === user._id && msg?.content.length > 0;

  const renderMessage = (msg, index) => {
    const isSender = msg.sender?._id === user._id || msg.sender === user._id;
    const isLast = index === messages.length - 1;
    const isSelected = selectedMessageId === msg._id;
    const isHovered = hoveredMessageId === msg._id;
    const isFullyDeleted =
      msg.deleted ||
      msg.deletedBy?.includes(user._id) ||
      (msg.images?.length === 0 && msg.originalImages?.length > 0 && msg.deleted);

    const handleClick = () => {
      if (isSender) setSelectedMessageId((prev) => (prev === msg._id ? null : msg._id));
    };

    return (
      <Box
        key={index}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: isSender ? "flex-end" : "flex-start",
          position: "relative",
        }}
        onMouseEnter={() => setHoveredMessageId(msg._id)}
        onMouseLeave={() => setHoveredMessageId(null)}
      >
        {/* Undo deleted message */}
        {msg.deleted && msg.sender?._id === user._id || (msg.deletedBy?.includes(user._id)) ? (
          <Button
            size="small"
            onClick={() => handleUndoDelete(msg._id)}
            sx={{
              mt: 0.5,
              fontSize: "0.7rem",
              color: "#90caf9",
              textTransform: "none",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            Undo
          </Button>
        ) : null}
        {/* Edited Tag */}
        {msg.edited && (!msg.deleted && !msg.deletedBy?.includes(user._id)) && (
          <Typography variant="caption" sx={{ fontSize: 11, mt: 0.5, color: "skyblue" }}>
            Edited
          </Typography>
        )}
        {/* Message Bubble */}
        <Box
          sx={{
            opacity: msg.purging ? 0 : 1,
            transition: "opacity 0.8s ease",
            display: "flex",
            alignItems: "center",
            position: "relative",
            justifyContent: isSender ? "flex-end" : "flex-start",
            width: "100%",
          }}
        >
          <Box
            onClick={handleClick}
            sx={{
              position: "relative",
              maxWidth: "70%",
              p: 1.2,
              borderRadius: 3,
              background: isSender && msg.content
                ? "linear-gradient(90deg, #1976d2, #42a5f5)"
                : "rgba(255,255,255,0.08)",
              color: isSender ? "#fff" : "#e0e0e0",
              wordBreak: "break-word",
              cursor: "pointer",
            }}
          >
            {/* Message content */}
            {isFullyDeleted ? (
              <Typography
                variant="body2"
                sx={{
                  color: isSender ? "#fff" : "#e0e0e0",
                  fontStyle: "italic",
                  opacity: 0.6,
                }}
              >
                This message was deleted
              </Typography>
            ) : (
              <>
                {(msg.content || msg.originalContent) && (
                  <Typography
                    variant="body2"
                    sx={{ color: isSender ? "#fff" : "#e0e0e0" }}
                  >
                    {msg.content || msg.originalContent}
                  </Typography>
                )}
                {msg.images?.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: msg.content ? 1 : 0 }}>
                    {msg.images.map((src, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 150,
                          height: 150,
                          borderRadius: 2,
                          overflow: "hidden",
                          boxShadow: 2,
                        }}
                      >
                        <img
                          src={src}
                          alt={`img-${index}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            )}
            {/* Message menu */}
            {!msg.deleted && !msg.deletedBy?.includes(user._id) ?
              <IconButton
                className="chat-options"
                size="small"
                onClick={(e) => handleMenuOpen(e, msg._id)}
                sx={{
                  position: "absolute",
                  left: isSender ? "-30px" : "",
                  right: isSender ? "" : "-30px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: isHovered || menuMessageId === msg._id ? 1 : 0,
                  pointerEvents:
                    isHovered || menuMessageId === msg._id ? "auto" : "none",
                  transition: "opacity 0.15s ease",
                  color: "#90caf9",
                  "&:hover": {
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              : null}
          </Box>
        </Box>
        {/* Status */}
        {isSender && (isLast || isSelected) && (
          <Typography variant="caption" sx={{ fontSize: 11, mt: 0.5, color: "#fff" }}>
            {msg.status}
          </Typography>
        )}
      </Box>);
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        pr: 1,
        scrollBehavior: "smooth",
      }}
    >


      {messages.length ? (
        messages.map(renderMessage)
      ) : (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.6)",
            fontSize: "1rem",
          }}
        >
          Say Hi to start conversation
        </Box>
      )}
      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {canEditMessage(messages.find(msg => msg._id === menuMessageId)) && (
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
        )}
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </Box>
  );
});

export default MessageLists;
