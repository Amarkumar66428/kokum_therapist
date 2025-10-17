// PatientFormGrid.jsx (web MUI version with RN features applied)
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Grid, // MUI v6 Grid2 API; if using Grid v5, switch to Grid and use item/container props accordingly
  TextField,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Alert as MuiAlert,
  Backdrop,
  CircularProgress,
  LinearProgress,
  AppBar,
  Toolbar,
  Stack,
} from "@mui/material";
import { Visibility, VisibilityOff, AttachFile } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../../utils/axios";
import RoundedButton from "../../components/button/roundedButton";

const nameRule = Yup.string()
  .trim()
  .min(2, "Too short")
  .max(60, "Too long")
  .matches(/^[\p{L}\p{M}\s'.-]+$/u, "Letters only");

const schema = Yup.object({
  patientId: Yup.string().trim().max(40),
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
        // Accept common office/text types to match RN picker behavior
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      return ok.includes(f.type);
    })
    .nullable(),
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
  const location = useLocation();

  const routeState = location?.state || {};
  const patientId = routeState?.patientId;
  const isEdit = patientId || routeState?.mode === "edit";

  const [showPassword, setShowPassword] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const formik = useFormik({
    initialValues,
    validationSchema: schema,
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);

        const body = new FormData();
        body.append("patientName", values.patientName || "");
        body.append("caretakerName", values.caretakerName || "");
        body.append("fatherName", values.fatherName || "");
        body.append("motherName", values.motherName || "");
        body.append("location", values.location || "");
        body.append("email", values.email || "");
        if (values.password && !isEdit)
          body.append("password", values.password);
        body.append("diagnosisReportText", values.diagnosisReport || "");

        let pidForNext = values.patientId;

        if (values.file) {
          body.append("diagnosisReportFile", values.file);
        }

        if (values.patientId) body.append("patientId", values.patientId);

        const { data } = await api.post(`/basic-details`, body, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const created = data?.data ?? data;
        pidForNext =
          patientId ||
          created?.patientId ||
          created?.basicDetails?.patientId ||
          values.patientId ||
          "";

        if (pidForNext) {
          localStorage.setItem("createdPatientId", String(pidForNext));
        }
        setToast({ open: true, msg: "Details saved.", severity: "success" });

        onNext?.(values);
        navigate("/managePatient/childDetails", {
          state: {
            from: "BasicDetails",
            mode: isEdit ? "edit" : "create",
            patientId: pidForNext,
            bundle: undefined,
          },
          replace: false,
        });
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          (isEdit ? "Failed to update details" : "Failed to save details");
        setToast({ open: true, msg, severity: "error" });
        console.log("Submit error:", err?.response || err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    touched,
    errors,
    handleSubmit,
    handleBlur,
    setFieldValue,
    setValues,
  } = formik;

  const fetchPatient = async () => {
    setPrefilling(true);
    try {
      const params = { id: patientId };
      const { data } = await api.get(`/basic-details`, { params });
      const patient = data?.data ?? data;
      setValues(patient);
    } catch (err) {
      console.error("Error fetching patient:", err);
    } finally {
      setPrefilling(false);
    }
  };

  useEffect(() => {
    if (isEdit) fetchPatient();
  }, [isEdit]);

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
    fontFamily: "regular",
  });

  const Label = ({ children }) => (
    <Typography variant="subtitle2" sx={{ mb: 0.5, color: "text.primary" }}>
      {children}
    </Typography>
  );

  return (
    <Box>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {prefilling && <LinearProgress sx={{ mb: 2 }} />}
        <Paper
          elevation={0}
          sx={{
            mx: "auto",
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 2,
          }}
        >
          <Grid container spacing={2.5}>
            <Grid size={GridSize}>
              <Label>Patient ID</Label>
              <TextField
                placeholder="Enter Patient ID"
                disabled={isEdit}
                {...field("patientId")}
              />
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

            <Grid size={GridSize}>
              <Label>Email</Label>
              <TextField
                type="email"
                placeholder="Enter Email"
                autoComplete="email"
                disabled={isEdit}
                {...field("email")}
              />
            </Grid>

            <Grid size={GridSize}>
              <Label>{isEdit ? "Password" : "New Password"}</Label>
              <TextField
                placeholder="Enter Password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isEdit}
                {...field("password")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        disabled={isEdit}
                        onClick={() => setShowPassword((s) => !s)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={GridSize}>
              <Label>Diagnosis Report</Label>
              <TextField
                placeholder="Enter"
                multiline
                minRows={3}
                {...field("diagnosisReport")}
              />
            </Grid>

            {/* File uploader with edit-mode hint */}
            <Grid size={GridSize}>
              <Label>Attach File</Label>
              <input
                ref={fileRef}
                type="file"
                hidden
                // Match RN permissive types, but validation still enforces allowed set
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => {
                  const f = e.currentTarget.files?.[0] || null;
                  // Attach browser File directly; Yup will validate size/type
                  setFieldValue("file", f);
                }}
              />
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: "auto" }}>
                  <Button
                    variant="outlined"
                    startIcon={<AttachFile sx={{ color: "primary.icon" }} />}
                    onClick={() => fileRef.current?.click()}
                  >
                    {values.file ? "Change File" : "Attach File"}
                  </Button>
                </Grid>
                <Grid size={{ xs: "auto" }}>
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
                    {values.file
                      ? values.file.name
                      : "PDF/Image/Doc/Txt (max 5MB)"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="caption"
                    color={errors.file ? "error" : "text.disabled"}
                  >
                    {errors.file ? String(errors.file) : " "}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                spacing={1.5}
                justifyContent="flex-end"
                sx={{ mt: 1 }}
              >
                <RoundedButton
                  type="submit"
                  size="large"
                  disabled={submitting}
                  sx={{ width: "fit-content", px: 10 }}
                >
                  Save & Next
                </RoundedButton>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Submit Backdrop */}
        <Backdrop open={submitting} sx={{ zIndex: (t) => t.zIndex.modal + 1 }}>
          <Box
            sx={{
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CircularProgress size={24} />
            <Typography>Saving...</Typography>
          </Box>
        </Backdrop>

        {/* Toasts */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <MuiAlert
            onClose={() => setToast((s) => ({ ...s, open: false }))}
            severity={toast.severity}
            elevation={6}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {toast.msg}
          </MuiAlert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default BasicDetails;
