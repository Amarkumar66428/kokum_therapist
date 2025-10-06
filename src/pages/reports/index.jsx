// ReportRequestScreen.jsx
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";

const schema = Yup.object({
  from: Yup.date().typeError("Invalid date").required("Select start date"),
  to: Yup.date()
    .typeError("Invalid date")
    .required("Select end date")
    .min(Yup.ref("from"), "End date must be after start date"),
});

function Reports({
  childName = "Shreya",
  initialRows = [
    {
      id: "1",
      childName: "Shreya",
      period: { from: "2024-05-10", to: "2024-08-20" },
      status: "Ready to Download",
      downloadUrl: "#",
    },
  ],
  onRequest,
  onDownload,
}) {
  const formik = useFormik({
    initialValues: { from: null, to: null },
    validationSchema: schema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (vals) => {
      const payload = {
        from: vals.from?.toISOString().slice(0, 10),
        to: vals.to?.toISOString().slice(0, 10),
      };
      onRequest?.(payload);
    },
  });

  const { values, errors, touched, setFieldValue, handleSubmit, isSubmitting } =
    formik;

  const disableRequest =
    !values.from || !values.to || Boolean(errors.from || errors.to);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Basic Details
        </Typography>
        <Box
          sx={{
            mx: "auto",
          }}
        >
          <Grid container spacing={2.5} alignItems="center">
            <Grid size={{ xs: 12 }} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Child Name
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                {childName}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }} sx={{ mt: { xs: 1.5, md: 0 } }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Select Period
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DesktopDatePicker
                    label={null}
                    value={values.from}
                    onChange={(v) => setFieldValue("from", v)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        placeholder: "From",
                        error: Boolean(touched.from && errors.from),
                        helperText:
                          touched.from && errors.from ? errors.from : " ",
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DesktopDatePicker
                    label={null}
                    value={values.to}
                    minDate={values.from || undefined}
                    onChange={(v) => setFieldValue("to", v)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        placeholder: "To",
                        error: Boolean(touched.to && errors.to),
                        helperText: touched.to && errors.to ? errors.to : " ",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                disabled={disableRequest || isSubmitting}
                sx={{
                  mt: 1,
                  py: 2,
                  px: 6,
                  borderRadius: 999,
                  fontSize: 18,
                  fontWeight: 800,
                  textTransform: "none",
                  color: "#0b2a6f",
                  background: "linear-gradient(90deg, #eef5ff, #e8f3ff)",
                  boxShadow: "0 4px 14px rgba(11,42,111,0.12)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #e3edff, #e1efff)",
                  },
                }}
              >
                Request Report →
              </Button>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>
            View Requested Download
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2, overflowX: "auto" }}
          >
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Child Name</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {initialRows.map((row) => {
                  const periodText = `${new Date(
                    row.period.from
                  ).toLocaleDateString("en-GB")} to ${new Date(
                    row.period.to
                  ).toLocaleDateString("en-GB")}`;
                  const ready = /ready/i.test(row.status);
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.childName}</TableCell>
                      <TableCell>{periodText}</TableCell>
                      <TableCell>
                        <Grid
                          container
                          spacing={1}
                          alignItems="center"
                          wrap="nowrap"
                        >
                          <Grid item>
                            <Chip
                              size="small"
                              label={row.status}
                              color={ready ? "success" : "default"}
                              variant={ready ? "filled" : "outlined"}
                            />
                          </Grid>
                          {ready && (
                            <Grid item>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => onDownload?.(row)}
                                sx={{ textTransform: "none" }}
                              >
                                Download
                              </Button>
                            </Grid>
                          )}
                        </Grid>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default Reports;
