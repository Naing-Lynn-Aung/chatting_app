import {
  Box,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";

export default function SearchPanel({ results, onClickResult }) {
  return (
    <List sx={{ flexGrow: 1, overflowY: "auto" }}>
      {results.length === 0 && <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="subtitle2" sx={{ color: "#90caf9", mb: 1 }}>
          No user found
        </Typography>
      </Box>
      }
      {results.map((result) => (
        <ListItem
          onClick={() => onClickResult(result)}
          button="true"
          key={result._id}
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
        >
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, cursor: "pointer" }}>
            <ListItemAvatar>
              <Avatar src={result.avatar} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                    {result.name}
                  </Typography>
                </Box>
              }
              primaryTypographyProps={{ color: "#fff", fontWeight: 500 }}
            />
          </Box>
        </ListItem>
      ))}
    </List>
  );
}
