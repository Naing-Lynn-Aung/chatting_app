import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function ConfirmDialog({
  open,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  onConfirm,
  onClose,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) {
  const isDanger = type === "danger";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: "linear-gradient(145deg, #1f2937, #111827)", // subtle dark gradient
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", // premium shadow
          color: "#fff",
          width: 500,
          px: 2,
          py: 1.5,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          fontSize: 20,
          letterSpacing: 0.5,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "rgba(255,255,255,0.8)",
            mt: 1,
            fontSize: 15,
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "center",
          pb: 2,
          gap: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "rgba(144, 202, 249,0.7)",
            color: "rgba(144, 202, 249,0.7)",
            textTransform: "none",
            fontWeight: "bold",
            px: 4,
            py: 1,
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(144, 202, 249,0.1)",
              borderColor: "#90caf9",
            },
          }}
        >
          {cancelText}
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            background: isDanger
              ? "linear-gradient(90deg, #ef4444, #f87171)"
              : "linear-gradient(90deg, #1976d2, #42a5f5)",
            textTransform: "none",
            fontWeight: "bold",
            px: 4,
            py: 1,
            borderRadius: 2,
            boxShadow: "0px 6px 20px rgba(0,0,0,0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              filter: "brightness(1.1)",
              boxShadow: "0px 8px 24px rgba(0,0,0,0.5)",
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
