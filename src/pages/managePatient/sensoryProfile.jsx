// pages/SensesForm.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Slider,
  Stack,
  Button,
  Chip,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import RoundedButton from "../../components/button/roundedButton";

const SENSE_FIELDS = [
  "Hearing",
  "Taste",
  "Sight",
  "Smell",
  "Touch",
  "Body Balance and Position",
  "Sense of Surroundings",
  "Body Awareness (Hunger, Thirst)",
  "Body Movement Sensitivity",
];

// UI label -> API field key
const labelToApi = {
  Hearing: "hearing",
  Taste: "taste",
  Sight: "sight",
  Smell: "smell",
  Touch: "touch",
  "Body Balance and Position": "bodyBalanceAndPosition",
  "Sense of Surroundings": "senseOfSurroundings",
  "Body Awareness (Hunger, Thirst)": "bodyAwareness",
  "Body Movement Sensitivity": "bodyMovementSensitivity",
};

const defaultValues = SENSE_FIELDS.reduce((acc, key) => {
  acc[key] = 50;
  return acc;
}, {});

const schema = Yup.object(
  SENSE_FIELDS.reduce((acc, key) => {
    acc[key] = Yup.number().min(0).max(100).required();
    return acc;
  }, {})
);

function SenseSliderCard({ label, value, onChange }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: 1.25,
        display: "grid",
        gap: 1,
        bgcolor: "background.paper",
        position: "relative",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">{label}</Typography>
        <Chip
          size="small"
          label={`${value}%`}
          sx={{
            fontWeight: 600,
            bgcolor: (theme) =>
              theme.palette.mode === "light" ? "#f3f6ff" : "action.selected",
          }}
        />
      </Stack>

      <Box sx={{ position: "relative", pt: 1, pb: 1.5 }}>
        <Slider
          value={value}
          onChange={(_, v) => onChange(Number(v))}
          step={1}
          min={0}
          max={100}
          aria-label={`${label} percentage`}
          sx={{
            "& .MuiSlider-thumb": {
              width: 12,
              height: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              bgcolor: "white",
            },
            "& .MuiSlider-track": {
              bgcolor: "#425580ff",
              border: "none",
              height: 10,
            },
            "& .MuiSlider-rail": {
              height: 8,
              opacity: 0.4,
            },
          }}
        />

        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "space-between",
            pointerEvents: "none",
            px: "15%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box
              sx={{ width: "2px", height: "11px", backgroundColor: " #fff" }}
            />
            <Typography variant="caption" color="text.secondary">
              Less Affected
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box
              sx={{ width: "2px", height: "11px", backgroundColor: " #fff" }}
            />
            <Typography variant="caption" color="text.secondary">
              More Affected
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function SensesProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  // Route-state from previous page navigate("/managePatient/sensoryProfile", { state: { from, mode, patientId, bundle } })
  const routeState = location?.state || {};
  const cameFromChild = routeState?.from === "ChildDetails";
  const isEdit = routeState?.mode === "edit";
  const bundle = routeState?.bundle || null;

  // Resolve patientId with fallbacks
  const [patientId, setPatientId] = useState(
    routeState?.patientId || bundle?.basicDetails?.patientId || ""
  );

  const [prefilling, setPrefilling] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // Formik
  const formik = useFormik({
    initialValues: defaultValues,
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      // Build payload as in RN
      const payload = { patientId: patientId || "" };
      SENSE_FIELDS.forEach((label) => {
        const apiKey = labelToApi[label];
        payload[apiKey] = Math.round(values[label] || 0);
      });

      if (!payload.patientId) {
        setToast({
          open: true,
          msg: "Missing Patient ID. Please complete Basic Details.",
          severity: "error",
        });
        return;
      }

      try {
        setSubmitting(true);

        // Upsert to /sensory-profile (same for create/edit)
        await api.post("/sensory-profile", payload);

        setToast({
          open: true,
          msg: isEdit ? "Sensory profile updated." : "Sensory profile saved.",
          severity: "success",
        });

        // Navigate back to Child Details or overview; adjust if a specific route is desired
        navigate("/patientProfile");
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to submit sensory profile.";
        setToast({ open: true, msg, severity: "error" });
        // Optional: console for developers
        // console.log("sensory-profile error:", err?.response || err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, setFieldValue, handleSubmit, setValues } = formik;

  // Prefill logic mirrors RN: only when editing the SAME patient and bundle has sensoryProfile
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      // Ensure route constraint
      if (!cameFromChild) {
        setToast({
          open: true,
          msg: "Please fill Child Details first.",
          severity: "info",
        });
      }

      // Confirm patientId from state or bundle
      let pid =
        routeState?.patientId || bundle?.basicDetails?.patientId || patientId;

      if (!cancelled) setPatientId(pid || "");

      const bundlePid = bundle?.basicDetails?.patientId;
      const hasSP = !!bundle?.sensoryProfile;
      const shouldPrefill =
        isEdit &&
        hasSP &&
        bundlePid &&
        pid &&
        String(bundlePid) === String(pid);

      if (shouldPrefill) {
        const sp = bundle.sensoryProfile;
        const next = { ...defaultValues };
        SENSE_FIELDS.forEach((label) => {
          const apiKey = labelToApi[label];
          const v = Number(sp?.[apiKey]);
          next[label] = Number.isFinite(v) ? Math.max(0, Math.min(v, 100)) : 50;
        });
        if (!cancelled) setValues(next);
      } else {
        if (!cancelled) setValues(defaultValues);
      }

      if (!cancelled) setPrefilling(false);
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [isEdit, routeState, bundle, cameFromChild, setValues, patientId]);

  return (
    <Box>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          boxShadow: "none",
          borderRadius: 2,
        }}
      >
        <Toolbar sx={{ px: 2 }}>
          <Typography>
            Where does the subject lie with respect to each of the senses?
          </Typography>
        </Toolbar>
      </AppBar>

      <Box mt={2} component="form" onSubmit={handleSubmit} noValidate>
        <Box>
          <Grid container spacing={1.5}>
            {SENSE_FIELDS.map((label) => (
              <Grid key={label} size={{ xs: 12, md: 6 }}>
                <SenseSliderCard
                  label={label}
                  value={values[label]}
                  onChange={(v) => setFieldValue(label, v)}
                />
              </Grid>
            ))}

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
                  sx={{ width: "fit-content", px: 10 }}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </RoundedButton>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((s) => ({ ...s, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SensesProfile;
