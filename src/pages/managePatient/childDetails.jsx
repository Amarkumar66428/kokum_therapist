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
  AppBar,
  Toolbar,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import therapistService from "../../services/therapistService";
import RoundedButton from "../../components/button/roundedButton";

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

        const resr = await therapistService.createChildDetails(payload);
        console.log("resr: ", resr);
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
        console.log("child-details error:", err?.response || err);
      }
    },
  });

  const { values, errors, touched, setFieldValue, handleSubmit, setValues } =
    formik;

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      setPrefilling(true);

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
  }, [isEdit, routeState?.patientId, routeState?.bundle]);

  const helper = (name) => (touched[name] && errors[name] ? errors[name] : " ");

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
            {isEdit ? "Edit Child Details" : "Child Profile"}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {prefilling && <LinearProgress sx={{ mb: 1 }} />}

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 4,
            bgcolor: "background.paper",
          }}
        >
          <Grid container spacing={4}>
            {/* Gender & Age Section */}
            <Grid container spacing={3} size={{ xs: 12, md: 6 }}>
              {/* Gender */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1.5, fontWeight: 600 }}
                >
                  Gender
                </Typography>
                <RadioGroup
                  value={values.gender}
                  onChange={(e) => setFieldValue("gender", e.target.value)}
                  name="gender"
                  sx={{ display: "flex", flexDirection: "column", gap: 1 }}
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
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        bgcolor: "background.default",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    />
                  ))}
                </RadioGroup>
                <Typography
                  variant="caption"
                  color={
                    errors.gender && touched.gender ? "error" : "text.secondary"
                  }
                >
                  {helper("gender")}
                </Typography>
              </Grid>

              {/* Age */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1.5, fontWeight: 600 }}
                >
                  Age
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    maxHeight: 180,
                    overflowY: "auto",
                    textAlign: "center",
                    p: 1,
                    borderRadius: 2,
                    bgcolor: "background.default",
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "grey.400",
                      borderRadius: 3,
                    },
                  }}
                >
                  {[...Array(30)].map((_, i) => {
                    const age = i + 1;
                    const selected = values.age === age;
                    return (
                      <Box
                        key={age}
                        onClick={() => setFieldValue("age", age)}
                        sx={{
                          border: selected
                            ? "2px solid"
                            : "1px solid transparent",
                          borderColor: selected
                            ? "primary.main"
                            : "transparent",
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          cursor: "pointer",
                          bgcolor: selected ? "action.selected" : "transparent",
                          fontWeight: selected ? 600 : 400,
                          transition: "all 0.2s ease",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <Typography sx={{ fontSize: 18 }}>{age}</Typography>
                      </Box>
                    );
                  })}
                </Box>
                <Typography
                  variant="caption"
                  color={errors.age && touched.age ? "error" : "text.secondary"}
                >
                  {helper("age")}
                </Typography>
              </Grid>
            </Grid>

            {/* Relation */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Relation
              </Typography>
              <RadioGroup
                value={values.relation}
                onChange={(e) => setFieldValue("relation", e.target.value)}
                name="relation"
              >
                <Grid container spacing={1.2}>
                  {RELATION_OPTIONS.map((r) => (
                    <Grid size={{ xs: 12, md: 6 }} key={r}>
                      <FormControlLabel
                        value={r}
                        control={<Radio />}
                        label={r}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          bgcolor: "background.default",
                          transition: "all 0.2s ease",
                          "&:hover": { bgcolor: "action.hover" },
                          width: "100%",
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
              <Typography
                variant="caption"
                color={
                  errors.relation && touched.relation
                    ? "error"
                    : "text.secondary"
                }
              >
                {helper("relation")}
              </Typography>
            </Grid>

            {/* School Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                School Details
              </Typography>
              <RadioGroup
                value={values.schoolDetail}
                onChange={(e) => setFieldValue("schoolDetail", e.target.value)}
                name="schoolDetail"
                sx={{ display: "flex", flexDirection: "column", gap: 1 }}
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
                      borderRadius: 2,
                      px: 2,
                      py: 0.5,
                      bgcolor: "background.default",
                      transition: "all 0.2s ease",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  />
                ))}
              </RadioGroup>
              <Typography
                variant="caption"
                color={
                  errors.schoolDetail && touched.schoolDetail
                    ? "error"
                    : "text.secondary"
                }
              >
                {helper("schoolDetail")}
              </Typography>
            </Grid>

            {/* Therapy & Interests */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Therapy Details
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {THERAPY_SUGGESTIONS.map((s) => {
                  const active = values.therapies.includes(s);
                  return (
                    <Chip
                      key={s}
                      label={s}
                      color="secondary.error"
                      variant={active ? "filled" : "outlined"}
                      onClick={() =>
                        setFieldValue(
                          "therapies",
                          active
                            ? values.therapies.filter((x) => x !== s)
                            : [...values.therapies, s]
                        )
                      }
                      sx={{
                        mb: 1,
                        cursor: "pointer",
                        "&:hover": { opacity: 0.8 },
                      }}
                    />
                  );
                })}
              </Stack>
              <Typography
                variant="caption"
                color={
                  errors.therapies && touched.therapies
                    ? "error"
                    : "text.secondary"
                }
              >
                {helper("therapies")}
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{ mt: 3, mb: 1.5, fontWeight: 600 }}
              >
                Child Interests
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {INTEREST_SUGGESTIONS.map((s) => {
                  const active = values.interests.includes(s);
                  return (
                    <Chip
                      key={s}
                      label={s}
                      color="primary.label"
                      variant={active ? "filled" : "outlined"}
                      onClick={() =>
                        setFieldValue(
                          "interests",
                          active
                            ? values.interests.filter((x) => x !== s)
                            : [...values.interests, s]
                        )
                      }
                      sx={{
                        mb: 1,
                        cursor: "pointer",
                        "&:hover": { opacity: 0.8 },
                      }}
                    />
                  );
                })}
              </Stack>
              <Typography
                variant="caption"
                color={
                  errors.interests && touched.interests
                    ? "error"
                    : "text.secondary"
                }
              >
                {helper("interests")}
              </Typography>
            </Grid>

            {/* Special Talents */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Special Talents
              </Typography>
              <TextField
                multiline
                minRows={3}
                fullWidth
                placeholder="Type here..."
                value={values.specialTalents}
                onChange={(e) =>
                  setFieldValue("specialTalents", e.target.value)
                }
                error={Boolean(touched.specialTalents && errors.specialTalents)}
                helperText={
                  touched.specialTalents && errors.specialTalents
                    ? errors.specialTalents
                    : " "
                }
              />
            </Grid>

            {/* Difficulties */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Difficulties
              </Typography>
              <TextField
                multiline
                minRows={3}
                fullWidth
                placeholder="Type here..."
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
                  Save & Next
                </RoundedButton>
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
    </Box>
  );
}

export default ChildDetails;
