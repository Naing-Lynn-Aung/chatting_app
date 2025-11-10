import { useState } from "react";
import {
  TextField,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const FormTextField = ({ label, name, value, onChange, error, type = "text" }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <Box sx={{ mb: 3 }}>
      {error && (
        <Typography
          variant="body2"
          sx={{
            color: "#f44336",
            mb: 0.5,
            textAlign: "left",
            fontSize: "0.8rem",
          }}
        >
          {error.msg}
        </Typography>
      )}

      <TextField
        fullWidth
        label={label}
        name={name}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        error={Boolean(error)}
        sx={{
          input: {
            color: "#fff", // 👈 force white text
            caretColor: "#fff", // 👈 white cursor
            "&:-webkit-autofill": {
              boxShadow: "0 0 0 1000px transparent inset", // match background
              WebkitTextFillColor: "#fff", // 👈 force white text
              caretColor: "#fff",
              transition: "background-color 5000s ease-in-out 0s",
            }
          },
          label: {
            color: error ? "#f44336" : "rgba(255,255,255,0.6)",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: error ? "#f44336" : "rgba(255,255,255,0.2)",
            },
            "&:hover fieldset": {
              borderColor: error ? "#f44336" : "#90caf9",
            },
          },
        }
        }
        InputProps={
          isPassword
            ? {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? (
                      <VisibilityOff sx={{ color: "#90caf9" }} />
                    ) : (
                      <Visibility sx={{ color: "#90caf9" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }
            : {}
        }
      />
    </Box>
  );
};

export default FormTextField;
