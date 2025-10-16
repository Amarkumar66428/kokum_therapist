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
import SemiBoldText from "../../components/typography/semiBoldText";
import RoundedButton from "../../components/button/roundedButton";
import NormalInput from "../../components/input/normalInput";

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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card variant="outlined" sx={{ borderRadius: 2, mt: 4 }}>
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
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SemiBoldText>Patient Name</SemiBoldText>
                <Autocomplete
                  options={patientList}
                  value={patientValue}
                  onChange={(_, newVal) =>
                    onSelectCaretaker(newVal?.value || "")
                  }
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  getOptionLabel={(o) => o?.label || ""}
                  renderInput={(params) => (
                    <NormalInput {...params} placeholder="Select Patient" />
                  )}
                  disableClearable={false}
                />
              </Grid>

              {/* Patient ID (readonly) */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <SemiBoldText>Patient ID</SemiBoldText>
                <NormalInput
                  fullWidth
                  value={patientProfile.id}
                  placeholder="Patient id"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              {/* Caretaker Name (readonly) */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <SemiBoldText>Caretaker Name</SemiBoldText>
                <NormalInput
                  fullWidth
                  value={patientProfile.caretakerName}
                  placeholder="Enter Name"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              {/* Date and Time */}

              <Grid size={{ xs: 12, sm: 3 }}>
                <Stack spacing={1}>
                  <SemiBoldText>
                    Date <span style={{ color: "#6B7280" }}>(DD/MM/YYYY)</span>
                  </SemiBoldText>
                  <DatePicker
                    value={selectedDate}
                    onChange={(v) => v && setSelectedDate(v)}
                    format="D MM, YYYY"
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Stack spacing={1}>
                  <SemiBoldText>
                    Time{" "}
                    <span style={{ color: "#6B7280" }}>(hours/minutes)</span>
                  </SemiBoldText>
                  <TimePicker
                    value={startTime}
                    onChange={(v) => v && setStartTime(v)}
                    ampm
                    minutesStep={1}
                    format="hh:mm A"
                  />
                </Stack>
              </Grid>

              {/* Notes with Clear */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <SemiBoldText>Add Notes</SemiBoldText>
                  <Button
                    color="error"
                    onClick={() => setNotes("")}
                    size="small"
                  >
                    Clear
                  </Button>
                </Stack>
                <NormalInput
                  fullWidth
                  placeholder="Add Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  minRows={4}
                />
              </Grid>

              {/* CTA */}
              <Grid size={{ xs: 12 }} textAlign="right">
                <RoundedButton
                  sx={{ width: "30em" }}
                  onClick={() => {
                    if (createLoading) return;
                    onSchedule();
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
                </RoundedButton>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}
