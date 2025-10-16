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
import { useDispatch } from "react-redux";
import SemiBoldText from "../../components/typography/semiBoldText";
import RegularText from "../../components/typography/regularText";
import { FONT_SIZE } from "../../constant/lookUpConstant";
import RoundedButton from "../../components/button/roundedButton";

const SignInPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
          const userData = {
            id: res?.user?._id,
            name: res?.user?.name,
            email: res?.user?.email,
            clinicName: res?.user?.clinicName,
          };
          Cookies.set("self", JSON.stringify(userData));
          Cookies.set("token", res.token);
          dispatch(setUserData({ user: userData, token: res.token }));
          showSnackbar("Signed in successfully", "success");
          navigate("/patientProfile");
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
        <Box
          sx={{
            width: "100%",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <SemiBoldText fontSize="2rem">Sign In</SemiBoldText>
            </Box>

            {authError && (
              <Alert severity="error" sx={{ mb: 2, fontFamily: "regular" }}>
                {authError}
              </Alert>
            )}

            <Box component="form" onSubmit={formik.handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <RegularText>Email</RegularText>
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
                      fontSize: FONT_SIZE.BODY,
                      fontFamily: "regular",
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 1 }}>
                <RegularText>Password</RegularText>
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
                        <Lock fontSize="small" color="primary.hlt_none" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOff color="primary.hlt_none" />
                          ) : (
                            <Visibility color="primary.hlt_none" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontFamily: "regular",
                      fontSize: FONT_SIZE.BODY,
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ py: 2 }}>
                <RegularText color="text.secondary">
                  By continuing, you agree to our{" "}
                  <Link href="#" underline="hover" color="primary.hlt_main">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="#" underline="hover" color="primary.hlt_main">
                    Privacy Policy
                  </Link>
                </RegularText>
              </Box>
              <RoundedButton fullWidth type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </RoundedButton>
            </Box>
          </CardContent>
        </Box>
      </Box>
    </Container>
  );
};

export default SignInPage;
