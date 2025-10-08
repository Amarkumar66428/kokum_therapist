// pages/AppointmentSchedulePage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Stack,
  Skeleton,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import therapistService from "../../services/therapistService";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowBackIosNewOutlined } from "@mui/icons-material";

const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");
const to24Hour = (dateObj) => dayjs(dateObj).format("HH:mm");

export default function AppointmentSchedulePage() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const sltCaretakerId = query.get("id");
  const navigate = useNavigate();

  const [caretaker, setCaretaker] = useState(sltCaretakerId || "");
  const [patientList, setPatientList] = useState([]); // [{label, value}]
  const [patientData, setPatientData] = useState(null); // raw API caretakers
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [startTime, setStartTime] = useState(dayjs());

  const [patientProfile, setPatientProfile] = useState({
    id: "",
    caretakerName: "",
  });

  const [error, setError] = useState(null);

  const fetchCaretaker = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await therapistService.getTherapistPatients();
      if (response?.success && Array.isArray(response.caretakerProfiles)) {
        const caretakers = response.caretakerProfiles
          .map((c) => ({
            label: c?.basicDetails?.patientName,
            value: c?._id,
          }))
          .filter(Boolean);
        setPatientData(response.caretakerProfiles);
        setPatientList(caretakers);

        if (sltCaretakerId) {
          const found = response.caretakerProfiles?.find(
            (c) => c?._id === sltCaretakerId
          );
          const { basicDetails, name } = found || {};
          if (basicDetails)
            setPatientProfile({
              id: basicDetails.patientId,
              caretakerName: name,
            });
        }
      } else {
        setPatientList([]);
      }
    } catch (err) {
      console.log("err: ", err);
      setError("Failed to load patients");
      setPatientList([]);
    } finally {
      setLoading(false);
    }
  }, [sltCaretakerId]);

  useEffect(() => {
    fetchCaretaker();
  }, [fetchCaretaker]);

  const onSelectCaretaker = (caretakerId) => {
    setCaretaker(caretakerId);
    const found = patientData?.find((c) => c?._id === caretakerId) || {};
    const { basicDetails, name } = found;
    if (basicDetails)
      setPatientProfile({ id: basicDetails.patientId, caretakerName: name });
  };

  const onSchedule = async () => {
    if (!caretaker) {
      window.alert("Please select a caretaker.");
      return;
    }
    if (!notes) {
      window.alert("Please add notes.");
      return;
    }
    if (notes.length > 500) {
      window.alert("Notes cannot exceed 500 characters.");
      return;
    }

    try {
      setCreateLoading(true);
      const found = patientData?.find((p) => p._id === caretaker);
      const payload = {
        caretakerName: patientProfile.caretakerName,
        patientId: found?.basicDetails?._id,
        patientName: patientList.find((c) => c.value === caretaker)?.label,
        patientEmail: found?.email,
        date: selectedDate.toDate(),
        time: to24Hour(startTime.toDate()),
        notes,
      };

      const appointment = await therapistService.createAppointment(payload);
      if (appointment?.success) {
        window.alert("Appointment scheduled successfully!");
        if (typeof navigate === "function") navigate("/appointments");
      }
    } catch (err) {
      console.log("err: ", err);
      // Log or show error UI
    } finally {
      setCreateLoading(false);
    }
  };

  const patientValue = useMemo(
    () => patientList.find((o) => o.value === caretaker) || null,
    [patientList, caretaker]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNewOutlined />
          </IconButton>
          <Typography>Appointment Schedule</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            {loading ? (
              <Stack spacing={2}>
                <Skeleton variant="text" width={120} height={24} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="text" width={90} height={24} />
                <Skeleton variant="rounded" height={100} />
                <Skeleton variant="text" width={90} height={24} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="text" width={90} height={24} />
                <Skeleton variant="rounded" height={150} />
              </Stack>
            ) : (
              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 500, color: "#242E49" }}>
                    Patient Name
                  </Typography>
                  <Autocomplete
                    options={patientList}
                    value={patientValue}
                    onChange={(_, newVal) =>
                      onSelectCaretaker(newVal?.value || "")
                    }
                    isOptionEqualToValue={(o, v) => o.value === v.value}
                    getOptionLabel={(o) => o?.label || ""}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select Patient" />
                    )}
                    disableClearable={false}
                  />
                </Stack>

                {/* Patient ID (readonly) */}
                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 500, color: "#242E49" }}>
                    Patient ID
                  </Typography>
                  <TextField
                    value={patientProfile.id}
                    placeholder="Patient id"
                    InputProps={{ readOnly: true }}
                  />
                </Stack>

                {/* Caretaker Name (readonly) */}
                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 500, color: "#242E49" }}>
                    Caretaker Name
                  </Typography>
                  <TextField
                    value={patientProfile.caretakerName}
                    placeholder="Enter Name"
                    InputProps={{ readOnly: true }}
                  />
                </Stack>

                {/* Date and Time */}
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1}>
                      <Typography sx={{ fontWeight: 500, color: "#242E49" }}>
                        Date{" "}
                        <span style={{ color: "#6B7280" }}>(DD/MM/YYYY)</span>
                      </Typography>
                      <DatePicker
                        value={selectedDate}
                        onChange={(v) => v && setSelectedDate(v)}
                        format="DD/MM/YYYY"
                        slots={{
                          openPickerIcon: CalendarMonthIcon,
                        }}
                        slotProps={{
                          textField: {
                            placeholder: formatDate(selectedDate),
                          },
                        }}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1}>
                      <Typography sx={{ fontWeight: 500, color: "#242E49" }}>
                        Time{" "}
                        <span style={{ color: "#6B7280" }}>
                          (hours/minutes)
                        </span>
                      </Typography>
                      <TimePicker
                        value={startTime}
                        onChange={(v) => v && setStartTime(v)}
                        ampm
                        minutesStep={1}
                        // Display the same 12-hour text in the input
                        format="hh:mm A"
                      />
                    </Stack>
                  </Grid>
                </Grid>

                {/* Notes with Clear */}
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      sx={{ fontWeight: 500, color: "#242E49", fontSize: 14 }}
                    >
                      Add Notes
                    </Typography>
                    <Button
                      color="error"
                      onClick={() => setNotes("")}
                      size="small"
                    >
                      Clear
                    </Button>
                  </Stack>
                  <TextField
                    placeholder="Add Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    minRows={4}
                  />
                </Stack>

                {/* CTA */}
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (createLoading) return;
                    onSchedule();
                  }}
                  sx={{
                    borderRadius: 999,
                    py: 1.25,
                    bgcolor: "#F2FBF8",
                    borderColor: "#CFEAE0",
                    color: "#0B726E",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#EAF7F2", borderColor: "#BDE1D5" },
                  }}
                >
                  {createLoading ? (
                    <Stack direction="row" gap={1} alignItems="center">
                      <CircularProgress size={18} sx={{ color: "#0B726E" }} />
                      <span>Scheduling...</span>
                    </Stack>
                  ) : (
                    "Schedule Appointment"
                  )}
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </LocalizationProvider>
  );
}
