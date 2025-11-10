import NotificationContext from "./NotificationContext";
import { useState } from "react";
import { Snackbar, Alert } from "@mui/material";

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const clearNotification = () => setNotification(null);

  return (
    <NotificationContext.Provider value={{ setNotification }}>
      {children}

      {/* Snackbar for notifications */}
      {notification && (
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={clearNotification}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={clearNotification}
            severity={notification.type}
            sx={{
              width: "100%",
              backgroundColor:
                notification.type === "success"
                  ? "#4caf50"
                  : notification.type === "error"
                    ? "#f44336"
                    : "#2196f3",
              color: "#fff",
              fontWeight: "bold",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
};
