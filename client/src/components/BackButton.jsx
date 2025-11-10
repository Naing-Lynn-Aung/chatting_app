import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";

export default function BackButton({ isMobile, onBack, selectedUser }) {
  return (
    isMobile && (
      <Box sx={{ display: "flex", alignItems: "center", px: 1, py: 1 }}>
        <IconButton onClick={onBack}>
          <ArrowBackIcon sx={{ color: "#90caf9" }} />
        </IconButton>
        <Typography variant="subtitle1" sx={{ ml: 1 }}>
          {selectedUser?.name || "Chat"}
        </Typography>
      </Box>
    )
  );
}
