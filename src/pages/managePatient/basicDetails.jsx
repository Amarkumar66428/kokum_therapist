// PatientFormGrid.jsx
import React, { useRef, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff, AttachFile } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const nameRule = Yup.string()
  .trim()
  .min(2, "Too short")
  .max(60, "Too long")
  .matches(/^[\p{L}\p{M}\s'.-]+$/u, "Letters only");

const schema = Yup.object({
  patientId: Yup.string().trim().required("Patient ID is required").max(40),
  patientName: nameRule.required("Patient name is required"),
  caretakerName: nameRule.optional(),
  fatherName: nameRule.optional(),
  motherName: nameRule.optional(),
  location: Yup.string().trim().max(100).optional(),
  email: Yup.string().trim().email("Invalid email").optional(),
  password: Yup.string()
    .min(8, "At least 8 characters")
    .max(64, "Max 64 characters")
    .matches(/[a-z]/, "Include a lowercase letter")
    .matches(/[A-Z]/, "Include an uppercase letter")
    .matches(/\d/, "Include a number")
    .optional(),
  diagnosisReport: Yup.string().trim().max(500).optional(),
  file: Yup.mixed()
    .test(
      "fileSize",
      "File too large (<= 5MB)",
      (f) => !f || f.size <= 5 * 1024 * 1024
    )
    .test("fileType", "Unsupported file", (f) => {
      if (!f) return true;
      const ok = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];
      return ok.includes(f.type);
    })
    .optional(),
});

const initialValues = {
  patientId: "",
  patientName: "",
  caretakerName: "",
  fatherName: "",
  motherName: "",
  location: "",
  email: "",
  password: "",
  diagnosisReport: "",
  file: null,
};

const GridSize = { xs: 12, sm: 6, md: 4 };

function BasicDetails({ onNext }) {
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: schema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      onNext?.(values);
      navigate("/managePatient/childDetails");
    },
  });

  const { values, touched, errors, handleSubmit, handleBlur, setFieldValue } =
    formik;

  const field = (name) => ({
    name,
    value: values[name],
    onChange: (e) => setFieldValue(name, e.target.value),
    onBlur: handleBlur,
    error: Boolean(touched[name] && errors[name]),
    helperText: touched[name] && errors[name] ? errors[name] : " ",
    fullWidth: true,
    size: "medium",
    variant: "outlined",
  });

  const Label = ({ children }) => (
    <Typography variant="subtitle2" sx={{ mb: 0.5, color: "text.primary" }}>
      {children}
    </Typography>
  );

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Basic Details
      </Typography>
      <Paper
        elevation={0}
        sx={{
          mx: "auto",
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Grid container spacing={2.5}>
          <Grid size={GridSize}>
            <Label>Patient ID</Label>
            <TextField placeholder="Enter Patient ID" {...field("patientId")} />
          </Grid>

          <Grid size={GridSize}>
            <Label>Patient Name</Label>
            <TextField
              placeholder="Enter Patient Name"
              {...field("patientName")}
            />
          </Grid>

          <Grid size={GridSize}>
            <Label>Patient’s Caretaker Name</Label>
            <TextField
              placeholder="Enter Caretaker Name"
              {...field("caretakerName")}
            />
          </Grid>

          {/* Second row */}
          <Grid size={GridSize}>
            <Label>Patient’s Father Name</Label>
            <TextField
              placeholder="Enter Father Name"
              {...field("fatherName")}
            />
          </Grid>

          <Grid size={GridSize}>
            <Label>Patient’s Mother Name</Label>
            <TextField
              placeholder="Enter Mother Name"
              {...field("motherName")}
            />
          </Grid>

          <Grid size={GridSize}>
            <Label>Location</Label>
            <TextField placeholder="Enter Location" {...field("location")} />
          </Grid>

          {/* Third row */}
          <Grid size={GridSize}>
            <Label>Email</Label>
            <TextField
              type="email"
              placeholder="Enter Email"
              autoComplete="email"
              {...field("email")}
            />
          </Grid>

          <Grid size={GridSize}>
            <Label>Password</Label>
            <TextField
              placeholder="Enter Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...field("password")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Diagnosis spans 2/3 columns on lg */}
          <Grid size={GridSize}>
            <Label>Diagnosis Report</Label>
            <TextField
              placeholder="Enter"
              multiline
              minRows={3}
              {...field("diagnosisReport")}
            />
          </Grid>

          {/* File attach column */}
          <Grid size={GridSize}>
            <Label>Attach File</Label>
            <input
              ref={fileRef}
              type="file"
              hidden
              accept=".pdf,image/*"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0] || null;
                setFieldValue("file", file);
              }}
            />
            <Grid container spacing={1}>
              <Grid item xs="auto">
                <Button
                  variant="outlined"
                  startIcon={<AttachFile />}
                  onClick={() => fileRef.current?.click()}
                >
                  {values.file ? "Change File" : "Attach File"}
                </Button>
              </Grid>
              <Grid item xs>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: "40px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {values.file ? values.file.name : "PDF or Image (max 5MB)"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  color={errors.file ? "error" : "text.disabled"}
                >
                  {errors.file ? errors.file : " "}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                type="submit"
                variant="outlined"
                sx={{
                  py: 1,
                  px: 8,
                  borderRadius: 10,
                  boxShadow: 1,
                  textTransform: "none",
                  color: "primary.success",
                  borderColor: "primary.success",
                  fontWeight: 500,
                  fontSize: "1em",
                }}
              >
                Save & Next
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default BasicDetails;
