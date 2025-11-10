import { socket } from '../helpers/socket';
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from '@mui/material/CircularProgress';
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  IconButton,
  TextField,
} from "@mui/material";
import { useState } from 'react';

export default function ChatInput({ fileRef, selectedUser, chatId, user, handleSend, input, setInput, previews, setPreviews, sending }) {
  const [fileInputValue, setFileInputValue] = useState("");

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ file, preview: reader.result });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setPreviews((prev) => [...prev, ...results]);
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  return (
    selectedUser && (
      <>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {previews.map((pre, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                width: 120,
                height: 120,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 2,
              }}
            >
              <img
                src={pre.preview}
                alt={`preview-${index}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <IconButton
                size="small"
                onClick={() =>
                  setPreviews((prev) => prev.filter((_, i) => i !== index))
                }
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            component="label"
            sx={{ color: "#90caf9" }}
          >
            <ImageIcon />
            <input
              type="file"
              hidden
              accept="image/*"
              multiple
              value={fileInputValue}
              onChange={(e) => {
                handleImageSelect(e);
                setFileInputValue("");
              }}
              ref={fileRef}
            />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              socket.emit("typing", { chatId, userId: user._id });
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                input: { color: "#fff" },
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "#90caf9" },
              },
            }}
          />
          <IconButton
            color="primary"
            disabled={sending}
            onClick={handleSend}
            sx={{
              background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
              color: "#fff",
              borderRadius: 3,
              "&:hover": { opacity: 0.9 },
            }}
          >
            {sending ? <CircularProgress size={24} /> : <SendIcon />}

          </IconButton>
        </Box>
      </>
    )
  );
}
