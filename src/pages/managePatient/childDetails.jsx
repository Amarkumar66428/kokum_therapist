// ChildProfileForm.jsx
import React, { useState } from "react";
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
  Divider,
  Autocomplete,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

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

function ChildDetails({ onNext }) {
  const navigate = useNavigate();
  const [therapyInput, setTherapyInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const formik = useFormik({
    initialValues,
    validationSchema: schema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      onNext?.(values);
      navigate("/managePatient/sensoryProfile");
    },
  });

  const { values, errors, touched, setFieldValue, handleSubmit } = formik;

  const helper = (name) => (touched[name] && errors[name] ? errors[name] : " ");

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Child Profile
      </Typography>
      <Box
        elevation={0}
        sx={{
          mx: "auto",
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Gender
            </Typography>
            <Box>
              <RadioGroup
                row
                value={values.gender}
                onChange={(e) => setFieldValue("gender", e.target.value)}
                name="gender"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 2,
                }}
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
                      py: 0,
                      px: 1.5,
                      width: 250,
                      boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
                      backgroundColor: "background.paper",
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
            </Box>
          </Grid>

          {/* Relation */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Input Relation
            </Typography>
            <Box sx={{ p: 1.5, borderRadius: 2 }}>
              <RadioGroup
                value={values.relation}
                onChange={(e) => setFieldValue("relation", e.target.value)}
                name="relation"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Grid container spacing={1}>
                  {RELATION_OPTIONS.map((r) => (
                    <FormControlLabel
                      key={r}
                      value={r}
                      control={<Radio />}
                      label={r}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 5,
                        py: 0,
                        px: 1.5,
                        width: 250,
                        boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
                        backgroundColor: "background.paper",
                      }}
                    />
                  ))}
                </Grid>
              </RadioGroup>
              <Typography
                variant="caption"
                color={
                  errors.relation && touched.relation
                    ? "error"
                    : "text.disabled"
                }
              >
                {helper("relation")}
              </Typography>
            </Box>
          </Grid>

          {/* Age slider (full width) */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Age
            </Typography>
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                display: "grid",
                gap: 1,
              }}
            >
              <Stack alignItems="center" spacing={1}>
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
            </Box>
          </Grid>

          {/* School details */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Enter School Details
            </Typography>
            <Box sx={{ p: 1.5, borderRadius: 2 }}>
              <RadioGroup
                value={values.schoolDetail}
                onChange={(e) => setFieldValue("schoolDetail", e.target.value)}
                name="schoolDetail"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 2,
                }}
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
                      py: 0,
                      px: 1.5,
                      width: 250,
                      boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
                      backgroundColor: "background.paper",
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
            </Box>
          </Grid>

          {/* Therapy details chips */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Enter Therapy Details
            </Typography>
            <Box sx={{ p: 1.5, borderRadius: 2 }}>
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
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1, flexWrap: "wrap" }}
              >
                {THERAPY_SUGGESTIONS.slice(0, 5).map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    variant={
                      values.therapies.includes(s) ? "filled" : "outlined"
                    }
                    color="secondary"
                    onClick={() => {
                      const exists = values.therapies.includes(s);
                      setFieldValue(
                        "therapies",
                        exists
                          ? values.therapies.filter((x) => x !== s)
                          : [...values.therapies, s]
                      );
                    }}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Interests chips (full width for room) */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Choose the Child Interests
            </Typography>
            <Box sx={{ p: 1.5, borderRadius: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1, flexWrap: "wrap" }}
              >
                {INTEREST_SUGGESTIONS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    variant={
                      values.interests.includes(s) ? "filled" : "outlined"
                    }
                    color="primary"
                    onClick={() => {
                      const exists = values.interests.includes(s);
                      setFieldValue(
                        "interests",
                        exists
                          ? values.interests.filter((x) => x !== s)
                          : [...values.interests, s]
                      );
                    }}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
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
            </Box>
          </Grid>

          {/* Free text areas */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
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
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
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
      </Box>
    </Box>
  );
}

export default ChildDetails;
