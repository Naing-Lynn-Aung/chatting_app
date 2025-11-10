import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useState, useContext } from "react";
import FormTextField from "../components/FormTextField";
import axios from "../helpers/axios";
import AuthContext from "../contexts/AuthContext";
import NotificationContext from "../contexts/NotificationContext";

export default function Login() {
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);
  const { setNotification } = useContext(NotificationContext);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const res = await axios.post("/api/users/login", form);

      if (res.status === 200) {
        dispatch({ type: 'LOGIN', payload: res.data.user });
        setNotification({
          open: true,
          message: "Login successful! Welcome back.",
          type: "success",
        });
        navigate('/');
      }
    } catch (error) {
      setErrors(error.response.data.message);
      setNotification({
        open: true,
        message: "Login failed. Please check your credentials.",
        type: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #141e30, #243b55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          width: 450,
          borderRadius: 4,
          boxShadow: "0px 8px 30px rgba(0,0,0,0.3)",
          backgroundColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <CardContent sx={{ p: 5, textAlign: "center" }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: "#90caf9" }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color: "#fff", mb: 2 }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Sign in to continue to ChatFlow
          </Typography>
          {typeof errors === "string" && (
            <Typography
              variant="body2"
              sx={{
                color: "#f44336",
                mt: 2,
                textAlign: "left",
                fontSize: "0.8rem",
              }}
            >
              {errors}
            </Typography>
          )}
          <Box component="form" mt={3} onSubmit={handleSubmit}>
            <FormTextField
              label="Email Address"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <FormTextField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                py: 1.3,
                fontWeight: "bold",
                borderRadius: 2,
                background:
                  "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
                boxShadow: "0px 4px 15px rgba(25,118,210,0.5)",
              }}
            >
              Sign In
            </Button>
            <Typography sx={{ color: "#90caf9", mt: 2 }}>
              <Link
                to="#"
                style={{ color: "#0ea5e9", textDecoration: "none" }}
              >
                Forgot password?
              </Link>
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.7)", mt: 3 }}
            >
              Don’t have an account?{" "}
              <Link to="/register" style={{ color: "#0ea5e9", textDecoration: "none" }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
