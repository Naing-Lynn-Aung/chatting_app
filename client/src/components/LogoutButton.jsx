import { useState } from 'react';
import {
  Button,
} from "@mui/material";
import ConfirmDialog from './ConfirmDialog';
import axios from '../helpers/axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import NotificationContext from '../contexts/NotificationContext';
import { socket } from '../helpers/socket';

export default function LogoutButton() {
  const navigate = useNavigate();
  const { user, dispatch } = useContext(AuthContext);
  const { setNotification } = useContext(NotificationContext);

  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleConfirm = async () => {
    try {
      const res = await axios.post('/api/users/logout');
      if (res.status === 200) {
        dispatch({ type: "LOGOUT" });
        setNotification({
          open: true,
          message: "Logout successful! Thanks for using.",
          type: "success",
        });
        socket.emit("logout", user._id);
        navigate("/");
      }
    } catch {
      setNotification({
        open: true,
        message: "Logout failed. Please try again.",
        type: "error",
      });
    }
    setOpen(false);

  };

  return (
    <>
      <Button
        fullWidth
        variant="contained"
        sx={{
          py: 1.3,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #d2191fff 0%, #f54242ff 100%)',
          boxShadow: '0px 4px 15px rgba(210, 25, 25, 0.5)',
          '&:hover': {
            background: 'linear-gradient(90deg, #f54242ff 0%, #d2191fff 100%)',
          },
        }}
        onClick={handleClick}
      >
        Log out
      </Button>

      <ConfirmDialog
        open={open}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        type="danger"
        onClose={handleClose}
        onConfirm={handleConfirm}
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
}
