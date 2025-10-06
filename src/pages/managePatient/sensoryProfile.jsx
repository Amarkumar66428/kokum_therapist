// SensesForm.jsx
import React from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Slider,
  Stack,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

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

const initialValues = SENSE_FIELDS.reduce((acc, key) => {
  acc[key] = 50; // default midpoint; set to 100 if needed
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
      <Slider
        value={value}
        onChange={(_, v) => onChange(Number(v))}
        step={1}
        min={0}
        max={100}
        aria-label={`${label} percentage`}
        sx={{
          "& .MuiSlider-thumb": { boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },
        }}
      />
    </Paper>
  );
}

function SensesProfile({ onSubmit }) {
  const formik = useFormik({
    initialValues,
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => onSubmit?.(values),
  });

  const { values, setFieldValue, handleSubmit } = formik;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ bgcolor: "#f9fafc", py: { xs: 2, md: 4 } }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Where does the subject lie with respect to each of the senses?
      </Typography>
      <Box
        sx={{
          mx: "auto",
        }}
      >
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

          <Grid item xs={12}>
            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              justifyContent="flex-end"
              sx={{ mt: 1 }}
            >
              <Button
                type="submit"
                variant="outlined"
                size="large"
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
                Submit
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default SensesProfile;
