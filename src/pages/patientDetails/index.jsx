import React, { useEffect, useState } from "react";
import {
  alpha,
  Box,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import ParallelCalendar from "../../components/parallelCalendar";
import patientService from "../../services/patientService";
import ChildDetailCard from "../../components/childDetailCard";
import usePatient from "../../hooks/usePatient";
import TimelineCalendar from "../../components/timeLinechart";
import BarChart from "../../components/barChart";
import { IoIosArrowRoundForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const toISODate = (d) => {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${da}`;
};

const buildWeekAround = (iso) => {
  const base = new Date(iso);
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay()); // Go to Sunday

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: toISODate(d),
      values: Array(10).fill(0),
    };
  });
};

const PatientDetails = () => {
  const navigate = useNavigate();
  const { patient } = usePatient();
  const theme = useTheme();

  const caretakerId = patient?.caretakerId;
  const patientId = patient?.patientId;

  const [loading, setLoading] = useState(false);
  const [barChartData, setBarChartData] = useState([]);
  const [dailyActivities, setDailyActivities] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const formatActivityForFrontend = (backendActivity) => ({
    id: backendActivity._id,
    label: backendActivity.customName || backendActivity.name,
    timeOfDay: backendActivity.timeOfDay === "AM" ? "Morning" : "Evening",
    startTime: backendActivity.startTime,
    endTime: backendActivity.endTime,
    progress: backendActivity.progress,
    status: backendActivity.status,
    timeRemaining: backendActivity.timeRemaining,
    date: new Date(backendActivity.date),
  });

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const [journeyEntries, dailyActivitiesRes, routinesRes, appointmentsRes] =
        await Promise.all([
          patientService.getJourneyEntries(caretakerId),
          patientService.getActivitiesByDate(caretakerId, selectedDate),
          patientService.getRoutines(caretakerId),
          patientService.getAppointmentsByPatient(patientId),
        ]);

      const week = buildWeekAround(selectedDate);
      if (Array.isArray(journeyEntries)) {
        const processed = week.map((d) => {
          const found = journeyEntries.find(
            (entry) => toISODate(new Date(entry.date)) === d.date
          );
          return found
            ? {
                ...d,
                values: [
                  found?.metrics?.poorEyeContact ?? 0,
                  found?.metrics?.abnormalFlatSpeech ?? 0,
                  found?.metrics?.anxiety ?? 0,
                  found?.metrics?.aggression ?? 0,
                  found?.metrics?.noiseSensitivity ?? 0,
                  found?.metrics?.fixations ?? 0,
                  found?.metrics?.socialDifficulty ?? 0,
                  found?.metrics?.depression ?? 0,
                  found?.metrics?.ticsAndFidgets ?? 0,
                  found?.metrics?.abnormalPostures ?? 0,
                ],
              }
            : d;
        });
        setBarChartData(processed);
      } else {
        setBarChartData(week);
      }

      if (dailyActivitiesRes?.success) {
        setDailyActivities(
          dailyActivitiesRes.activities.map(formatActivityForFrontend)
        );
      }

      if (routinesRes?.success && Array.isArray(routinesRes?.routines)) {
        setRoutines(routinesRes.routines);
      }

      if (appointmentsRes?.success) {
        setAppointments(appointmentsRes.upcoming[0] || []);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleTimeLineData = () => {
    const mergedData = [];

    const convertToISO = (date, timeStr) => {
      const d = new Date(date);
      let [t, m] = timeStr.split(" ");
      let [h, min] = t.split(":").map(Number);
      if (m === "PM" && h !== 12) h += 12;
      if (m === "AM" && h === 12) h = 0;
      d.setHours(h, min, 0, 0);
      return d.toISOString();
    };

    routines.forEach((routine) => {
      mergedData.push({
        _id: routine._id,
        key: routine.customName || routine.name,
        startTime: routine.startTime,
        endTime: routine.endTime,
        name: routine.customName || routine.name,
        type: "routine",
      });
    });

    dailyActivities.forEach((activity) => {
      mergedData.push({
        _id: activity.id,
        key: activity.label || activity.customName,
        startTime: convertToISO(activity.date, activity.startTime),
        endTime: convertToISO(activity.date, activity.endTime),
        name: activity.label || activity.customName,
        type: "activity",
      });
    });

    return mergedData.sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress color="inherit" size={40} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* LEFT COLUMN */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <ChildDetailCard
                childData={{
                  name: patient?.patientName,
                  age: patient?.patientAge,
                  gender: patient?.patientGender,
                  caretakerName: patient?.caretakerName,
                }}
              />

              <ParallelCalendar
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    mb: 1,
                    color: theme.palette.text.primary,
                  }}
                >
                  Therapy Type
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    border: `1px solid ${theme.palette.primary.success}`,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.success, 0.1),
                  }}
                >
                  <Typography variant="body2" color="primary.success">
                    {patient?.therapyType || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                  }}
                >
                  Journey Overview
                </Typography>
                <BarChart realChartData={barChartData} />
              </Box>
            </Box>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                  }}
                >
                  Routine & Activity
                </Typography>
                <TimelineCalendar events={handleTimeLineData() ?? []} />
              </Box>

              <Box
                sx={{ py: 2 }}
                onClick={() =>
                  navigate(`/appointments/schedule/?id=${caretakerId}`)
                }
              >
                <Typography
                  variant="body1"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                    color: "primary.success",
                  }}
                >
                  Next Appointment
                  <IoIosArrowRoundForward size={22} style={{ marginLeft: 4 }} />
                </Typography>
                {appointments?.date ? (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "primary.success" }}
                  >
                    {`${appointments.date} - ${appointments.time} with ${appointments.doctor}`}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "primary.success" }}
                  >
                    No upcoming appointment.
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default PatientDetails;
