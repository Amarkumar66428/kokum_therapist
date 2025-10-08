// ChildProfileForm.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  TextField,
  Chip,
  Stack,
  Button,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "../utils/storage"; // returns token string like RN getAuth
import api from "../../utils/axios";

// Reference options
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const RELATION_OPTIONS = [
  "Parent",
  "Teacher",
  "Sibling",
  "Family",
  "Friend",
  "Therapist",
  "Educator",
  "Caretaker",
];
const SCHOOL_OPTIONS = ["Regular", "Special", "Home", "None"];
const THERAPY_SUGGESTIONS = [
  "Speech Therapy",
  "Occupational Therapy",
  "Counseling",
  "Play Therapy",
  "Behavior Therapy",
];
const INTEREST_SUGGESTIONS = [
  "Music",
  "Art",
  "Dance",
  "Athletics",
  "Coding",
  "Books",
  "Games",
  "Nature",
];

const schema = Yup.object({
  gender: Yup.string()
    .oneOf(GENDER_OPTIONS.concat("Prefer not to say"))
    .required("Select a gender"),
  age: Yup.number().min(3).max(30).required("Age is required"),
  relation: Yup.string().oneOf(RELATION_OPTIONS).required("Select relation"),
  schoolDetail: Yup.string()
    .oneOf(SCHOOL_OPTIONS)
    .required("Select school type"),
  therapies: Yup.array().of(Yup.string().trim()).max(10, "Too many therapies"),
  interests: Yup.array().of(Yup.string().trim()).max(15, "Too many interests"),
  specialTalents: Yup.string().trim().max(300, "Max 300 characters"),
  difficulties: Yup.string().trim().max(500, "Max 500 characters"),
});

const initialValues = {
  gender: "",
  age: 18,
  relation: "",
  schoolDetail: "",
  therapies: [],
  interests: [],
  specialTalents: "",
  difficulties: "",
};

function pickFromBundle(bundle) {
  if (!bundle) return null;
  const cd = bundle?.childDetails || bundle;
  return {
    gender: cd?.gender ?? "",
    age:
      Number.isFinite(Number(cd?.age)) && Number(cd?.age) > 0
        ? Number(cd?.age)
        : 18,
    relation: cd?.relationshipToChild ?? "",
    schoolDetail: cd?.schoolType ?? "",
    therapies: Array.isArray(cd?.therapyDetails) ? cd?.therapyDetails : [],
    interests: Array.isArray(cd?.childInterests) ? cd?.childInterests : [],
    specialTalents: cd?.specialTalents ?? "",
    difficulties: cd?.difficulties ?? "",
  };
}

function ChildDetails({ onNext }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Route state from previous pages (BasicDetails → ChildDetails)
  // Expected: { from, mode, patientId, bundle }
  const routeState = location?.state || {};
  const isEdit =
    routeState?.mode === "edit" ||
    routeState?.prefillFrom === "childProfile" ||
    routeState?.edit === true ||
    !!routeState?.bundle;

  const [patientId, setPatientId] = useState("");
  const [prefilling, setPrefilling] = useState(true);
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
      // Guard: patientId must exist
      const pid = patientId || routeState?.patientId || "";
      if (!pid) {
        setToast({
          open: true,
          msg: "Missing Patient. Complete Basic Details first.",
          severity: "error",
        });
        return;
      }

      try {
        const payload = {
          patientId: pid,
          gender: values.gender,
          age: Number(values.age),
          relationshipToChild: values.relation,
          schoolType: values.schoolDetail,
          therapyDetails: values.therapies,
          childInterests: values.interests,
          specialTalents: values.specialTalents,
          difficulties: values.difficulties,
        };

        const token = await getAuth();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await api.post("/child-details", payload, { headers });
        setToast({
          open: true,
          msg: isEdit ? "Child details updated." : "Child details saved.",
          severity: "success",
        });

        onNext?.(values);
        navigate("/managePatient/sensoryProfile", {
          state: {
            from: "ChildDetails",
            mode: isEdit ? "edit" : "create",
            patientId: pid,
            bundle: routeState?.bundle, // pass along if present
          },
        });
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save child details";
        setToast({ open: true, msg, severity: "error" });
        // eslint-disable-next-line no-console
        console.log("child-details error:", err?.response || err);
      }
    },
  });

  const { values, errors, touched, setFieldValue, handleSubmit, setValues } =
    formik;

  // Prefill flow: derive patientId from route state or localStorage, and hydrate form when editing
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      setPrefilling(true);

      // Patient ID from state, else from createdPatientId (RN AsyncStorage)
      let pid =
        routeState?.patientId ||
        routeState?.child?.patientId ||
        routeState?.createdPatientId ||
        routeState?.bundle?.basicDetails?.patientId ||
        "";
      if (!pid) {
        const stored = localStorage.getItem("createdPatientId");
        if (stored) pid = stored;
      }
      if (!cancelled) setPatientId(pid || "");

      if (isEdit) {
        const base = pickFromBundle(routeState?.bundle);
        if (base && !cancelled) {
          setValues({
            gender: base.gender || "",
            age: base.age ?? 18,
            relation: base.relation || "",
            schoolDetail: base.schoolDetail || "",
            therapies: base.therapies || [],
            interests: base.interests || [],
            specialTalents: base.specialTalents || "",
            difficulties: base.difficulties || "",
          });
        }
      } else {
        if (!cancelled) setValues({ ...initialValues });
      }

      if (!cancelled) setPrefilling(false);
    };

    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, routeState?.patientId, routeState?.bundle]);

  const helper = (name) => (touched[name] && errors[name] ? errors[name] : " ");

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {prefilling && <LinearProgress sx={{ mb: 1 }} />}

      <Typography variant="h6" sx={{ mb: 2 }}>
        {isEdit ? "Edit Child Details" : "Child Profile"}
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Grid container spacing={2.5}>
          {/* Gender */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Gender
            </Typography>
            <RadioGroup
              value={values.gender}
              onChange={(e) => setFieldValue("gender", e.target.value)}
              name="gender"
              sx={{ display: "grid", gridAutoRows: "min-content", gap: 1.5 }}
            >
              {GENDER_OPTIONS.map((g) => (
                <FormControlLabel
                  key={g}
                  value={g}
                  control={<Radio />}
                  label={g}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 5,
                    px: 1.5,
                    width: 250,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    bgcolor: "background.paper",
                    m: 0,
                  }}
                />
              ))}
            </RadioGroup>
            <Typography
              variant="caption"
              color={
                errors.gender && touched.gender ? "error" : "text.disabled"
              }
            >
              {helper("gender")}
            </Typography>
          </Grid>

          {/* Relation */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Input Relation
            </Typography>
            <RadioGroup
              value={values.relation}
              onChange={(e) => setFieldValue("relation", e.target.value)}
              name="relation"
              sx={{ display: "grid", gridAutoRows: "min-content", gap: 1.5 }}
            >
              <Grid container spacing={1}>
                {RELATION_OPTIONS.map((r) => (
                  <Grid item key={r}>
                    <FormControlLabel
                      value={r}
                      control={<Radio />}
                      label={r}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 5,
                        px: 1.5,
                        width: 250,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        bgcolor: "background.paper",
                        m: 0,
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
            <Typography
              variant="caption"
              color={
                errors.relation && touched.relation ? "error" : "text.disabled"
              }
            >
              {helper("relation")}
            </Typography>
          </Grid>

          {/* Age slider */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Age
            </Typography>
            <Stack alignItems="center" spacing={1.5}>
              <Slider
                value={values.age}
                onChange={(_, v) => setFieldValue("age", v)}
                valueLabelDisplay="auto"
                min={3}
                max={30}
                step={1}
                sx={{
                  maxWidth: 520,
                  "& .MuiSlider-thumb": {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  },
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: "primary.50",
                  color: "primary.main",
                }}
              >
                {values.age}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              color={errors.age && touched.age ? "error" : "text.disabled"}
            >
              {helper("age")}
            </Typography>
          </Grid>

          {/* School details */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Enter School Details
            </Typography>
            <RadioGroup
              value={values.schoolDetail}
              onChange={(e) => setFieldValue("schoolDetail", e.target.value)}
              name="schoolDetail"
              sx={{ display: "grid", gridAutoRows: "min-content", gap: 1.5 }}
            >
              {SCHOOL_OPTIONS.map((s) => (
                <FormControlLabel
                  key={s}
                  value={s}
                  control={<Radio />}
                  label={s}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 5,
                    px: 1.5,
                    width: 250,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    bgcolor: "background.paper",
                    m: 0,
                  }}
                />
              ))}
            </RadioGroup>
            <Typography
              variant="caption"
              color={
                errors.schoolDetail && touched.schoolDetail
                  ? "error"
                  : "text.disabled"
              }
            >
              {helper("schoolDetail")}
            </Typography>
          </Grid>

          {/* Therapy chips */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Enter Therapy Details
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              {THERAPY_SUGGESTIONS.map((s) => {
                const active = values.therapies.includes(s);
                return (
                  <Chip
                    key={s}
                    label={s}
                    variant={active ? "filled" : "outlined"}
                    color="secondary"
                    onClick={() => {
                      const exists = active;
                      setFieldValue(
                        "therapies",
                        exists
                          ? values.therapies.filter((x) => x !== s)
                          : [...values.therapies, s]
                      );
                    }}
                    sx={{ mr: 1, mb: 1 }}
                  />
                );
              })}
            </Stack>
            <Typography
              variant="caption"
              color={
                errors.therapies && touched.therapies
                  ? "error"
                  : "text.disabled"
              }
            >
              {helper("therapies")}
            </Typography>
          </Grid>

          {/* Interests chips */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Choose the Child Interests
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              {INTEREST_SUGGESTIONS.map((s) => {
                const active = values.interests.includes(s);
                return (
                  <Chip
                    key={s}
                    label={s}
                    variant={active ? "filled" : "outlined"}
                    color="primary"
                    onClick={() => {
                      const exists = active;
                      setFieldValue(
                        "interests",
                        exists
                          ? values.interests.filter((x) => x !== s)
                          : [...values.interests, s]
                      );
                    }}
                    sx={{ mr: 1, mb: 1 }}
                  />
                );
              })}
            </Stack>
            <Typography
              variant="caption"
              color={
                errors.interests && touched.interests
                  ? "error"
                  : "text.disabled"
              }
            >
              {helper("interests")}
            </Typography>
          </Grid>

          {/* Free text areas */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Special Talents
            </Typography>
            <TextField
              placeholder="Type here"
              multiline
              minRows={3}
              fullWidth
              value={values.specialTalents}
              onChange={(e) => setFieldValue("specialTalents", e.target.value)}
              error={Boolean(touched.specialTalents && errors.specialTalents)}
              helperText={
                touched.specialTalents && errors.specialTalents
                  ? errors.specialTalents
                  : " "
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Difficulties
            </Typography>
            <TextField
              placeholder="Type here"
              multiline
              minRows={3}
              fullWidth
              value={values.difficulties}
              onChange={(e) => setFieldValue("difficulties", e.target.value)}
              error={Boolean(touched.difficulties && errors.difficulties)}
              helperText={
                touched.difficulties && errors.difficulties
                  ? errors.difficulties
                  : " "
              }
            />
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              justifyContent="flex-end"
            >
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
            </Stack>
          </Grid>
        </Grid>
      </Paper>

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

export default ChildDetails;
