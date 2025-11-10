import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
} from "@mui/material";
export default function ChatUserHeader({ selectedUser, isOnline, lastSeenInfo }) {
  const formatLastSeen = (date) => {
    if (!date) return "unknown";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "unknown"; // catch invalid date

    return d.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "short",
    });
  };
  return (
    selectedUser && (
      <Box sx={{ mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={selectedUser.avatar} />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {selectedUser.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color:
                  selectedUser.status === "online"
                    ? "#4caf50"
                    : selectedUser.status === "away"
                      ? "#ff9800"
                      : "#9e9e9e",
                fontWeight: "medium",
              }}
            >
              {selectedUser.status === "online" && isOnline
                ? "online" : selectedUser.status !== "online" ? selectedUser.status
                  : `last seen ${formatLastSeen(lastSeenInfo?.lastSeen)}`}
            </Typography>
          </Box>
        </Box>
        <IconButton>
          <MoreVertIcon sx={{ color: "#90caf9" }} />
        </IconButton>
      </Box>
    )
  );
}
