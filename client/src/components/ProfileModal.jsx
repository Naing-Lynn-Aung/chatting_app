import { useContext, useState } from 'react';
import Transition from '../components/Transition';
import {
  Box,
  Button,
  Dialog,
  Avatar,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import InputAdornment from '@mui/material/InputAdornment';
import LockIcon from '@mui/icons-material/Lock';
import AuthContext from '../contexts/AuthContext';
import axios from 'axios';

export default function ProfileModal() {
  const { user, dispatch } = useContext(AuthContext);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState(user.status);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };
  const handleCancel = () => {
    setOpenProfileModal(false);
    setName(user.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append("status", status);
      if (image) formData.append('avatar', image);

      const res = await axios.patch("/api/users/" + user._id, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      if (res.status === 200) {
        const updatedUser = res.data.user;
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        setName(updatedUser.name);
        setStatus(res.data.user.status);
        setLoading(false);
        setOpenProfileModal(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  return (
    <>
      <Box
        onClick={() => setOpenProfileModal(true)}
        sx={{
          px: 2,
          py: 2,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          cursor: "pointer",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
        }}
      >
        <Avatar src={user.avatar} />
        <Box>
          <Typography variant="body2" fontWeight="bold" color="#fff">
            You
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  user.status === "online"
                    ? "#4caf50"
                    : user.status === "away"
                      ? "#ff9800"
                      : "#9e9e9e"
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color:
                  user.status === "online"
                    ? "#4caf50"
                    : user.status === "away"
                      ? "#ff9800"
                      : "#9e9e9e"
              }}
            >
              {user.status}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: "90vw",
            backgroundColor: "#243b55",
            backdropFilter: "blur(12px)",
            borderRadius: 4,
            p: 3,
            color: "#fff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          },
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Edit Profile</Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Avatar src={image ? URL.createObjectURL(image) : user.avatar} sx={{ width: 80, height: 80 }} />
          </Box>

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 2, color: "#fff", borderColor: "#90caf9" }}
          >
            Upload Avatar
            <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
          </Button>

          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            size="small"
            InputLabelProps={{ style: { color: "#90caf9" } }}
            InputProps={{ style: { color: "#fff" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "#90caf9" },
              },
              mb: 2
            }}
          />

          <TextField
            fullWidth
            label="Email"
            value={user.email}
            disabled
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <LockIcon sx={{ color: "rgba(255,255,255,0.6)" }} />
                </InputAdornment>
              ),
              sx: {
                "& input": {
                  WebkitTextFillColor: "#fff",
                },
              },
            }}
            InputLabelProps={{ style: { color: "#90caf9" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "#90caf9" },
                "&.Mui-disabled": {
                  opacity: 0.6,
                  "& input": {
                    WebkitTextFillColor: "#fff",
                  },
                },
              },
            }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: "#90caf9" }}>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
              sx={{
                color: "#fff",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.2)"
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#90caf9"
                }
              }}
            >
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
              <MenuItem value="away">Away</MenuItem>
            </Select>
          </FormControl>


          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={handleCancel} sx={{ color: "#fff" }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </Box>
        </Box>

      </Dialog>
    </>
  );
}
