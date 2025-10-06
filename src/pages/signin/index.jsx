import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Link,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import authService from "../../services/authService";
import { setUserData } from "../../reducer/authSlice";
import Cookies from "js-cookie";
import useSnackbar from "../../hooks/useSnackbar";

const SignInPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Yup schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      setAuthError("");
      try {
        setLoading(true);
        const res = await authService?.signIn(values);
        if (res.token) {
          setUserData(res);
          navigate("/patientProfile");
          Cookies.set("token", res.token);
          showSnackbar("Signed in successfully", "success");
        } else {
          setAuthError(
            res?.message || "Invalid email or password. Please try again."
          );
        }
      } catch (err) {
        console.log("err: ", err);
        setAuthError("Invalid email or password. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Card
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 480,
            borderRadius: 3,
            overflow: "visible",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
              {" "}
              <Typography
                variant="h6"
                component="h4"
                fontWeight={600}
                gutterBottom
              >
                Sign In{" "}
              </Typography>{" "}
            </Box>

            {/* Error message */}
            {authError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {authError}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="youremail@example.com"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ py: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  By continuing, you agree to our{" "}
                  <Link href="#" underline="hover" color="primary.main">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="#" underline="hover" color="primary.main">
                    Privacy Policy
                  </Link>
                </Typography>
              </Box>

              {/* Sign In Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  borderRadius: 20,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  border: "1px solid #ccc",
                  bgcolor: "#fff",
                  boxShadow: 2,
                  color: "primary.main",
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SignInPage;
