import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../helpers/axios";
import FormTextField from "../components/FormTextField";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useContext } from "react";
import NotificationContext from "../contexts/NotificationContext";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const { setNotification } = useContext(NotificationContext);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };
  const register = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/users/register", form);
      if (res.status === 201) {
        setNotification({
          open: true,
          message: "Registration successful! Please log in.",
          type: "success",
        });
        navigate("/login");
      }
    } catch (error) {
      setErrors(error.response.data.message);
      setNotification({
        open: true,
        message: "Registration failed. Please check your input.",
        type: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
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
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#fff", mb: 2 }}>
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Join ChatFlow and start messaging instantly
          </Typography>
          <Box component="form" mt={4} onSubmit={register}>
            {/* Name */}
            <FormTextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            {/* Email */}
            <FormTextField
              label="Email Address"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            {/* Password */}
            <FormTextField
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              type="password"
            />
            {/* Confirm Password */}
            <FormTextField
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              type="password"
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{
                py: 1.3,
                fontWeight: "bold",
                borderRadius: 2,
                background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
                boxShadow: "0px 4px 15px rgba(25,118,210,0.5)",
              }}
            >
              Register
            </Button>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.7)", mt: 3 }}
            >
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#0ea5e9", textDecoration: "none" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
