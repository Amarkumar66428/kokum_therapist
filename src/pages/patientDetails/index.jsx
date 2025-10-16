import React, { useEffect, useState } from "react";
import {
  alpha,
  Box,
  Card,
  Container,
  Grid,
  Stack,
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
import SkeletonBlock from "../../components/skeleton";
import SemiBoldText from "../../components/typography/semiBoldText";
import RegularText from "../../components/typography/regularText";
import { AppColors, ChartColors } from "../../constant/appColors";
import { formatTo12Hour } from "../../utils/helper";
import DailyActivities from "../../components/activityCard";
import {
  BORDER_RADIUS,
  ELEVATION,
  SPACING,
} from "../../constant/lookUpConstant";

const formatDDMMYY = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);

  return (
    <span
      style={{
        color: AppColors.ERR_MAIN,
      }}
    >
      {`${dd}/${mm}/${yy}`}
      <span
        style={{
          color: AppColors.TXT_MAIN,
        }}
      >
        {" "}
        at{" "}
      </span>
      {formatTo12Hour(d)}
    </span>
  );
};

const daysUntil = (iso) => {
  if (!iso) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
};

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
  }, [selectedDate]);

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
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChildDetailCard
            childData={{
              name: patient?.patientName,
              age: patient?.patientAge,
              gender: patient?.patientGender,
              caretakerName: patient?.caretakerName,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box>
            <SemiBoldText>Therapy Type</SemiBoldText>
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
              <RegularText color={theme.palette.primary.success}>
                {patient?.therapyType || "N/A"}
              </RegularText>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ParallelCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SemiBoldText
            sx={{
              mb: SPACING.XXS,
            }}
          >
            Journey Overview
          </SemiBoldText>
          <Card
            elevation={ELEVATION.LOW}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 2,
              borderRadius: BORDER_RADIUS.SM,
            }}
          >
            <Box>
              {loading ? (
                <SkeletonBlock
                  variant="rectangular"
                  width="100%"
                  height={200}
                  borderRadius={4}
                />
              ) : (
                <BarChart realChartData={barChartData} />
              )}
            </Box>
            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent="flex-start"
              gap={1.5}
              mt={2.5}
              px={0.5}
            >
              {[
                "Poor Eye Contact",
                "Abnormal Flat Speech",
                "Anxiety",
                "Aggression",
                "Noise Sensitivity",
                "Fixations",
                "Social Difficulty",
                "Depression",
                "Tics and Fidgets",
                "Abnormal Postures",
              ].map((item, i) => (
                <Stack
                  key={i}
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                  sx={{ mr: 1.5, mb: 1 }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: ChartColors[i % ChartColors.length],
                    }}
                  />
                  <RegularText>{item}</RegularText>
                </Stack>
              ))}
            </Box>
          </Card>

          <Box sx={{ mt: SPACING.XXS }}>
            <SemiBoldText
              sx={{
                mb: SPACING.XXS,
              }}
            >
              Daily Activity
            </SemiBoldText>
            <DailyActivities dailyActivities={dailyActivities} />
          </Box>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <SemiBoldText
                sx={{
                  mb: SPACING.XXS,
                }}
              >
                Routine & Activity
              </SemiBoldText>
              <TimelineCalendar events={handleTimeLineData() ?? []} />
            </Box>
          </Box>
          <Box
            sx={{ cursor: "pointer", mt: SPACING.XXS }}
            onClick={() =>
              navigate(`/appointments/schedule/?id=${caretakerId}`)
            }
          >
            <Box
              sx={{ display: "flex", alignItems: "center", mb: SPACING.XXS }}
            >
              <SemiBoldText>Next Appointment</SemiBoldText>
              <IoIosArrowRoundForward size={22} style={{ marginLeft: 4 }} />
            </Box>
            {appointments?.date ? (
              <RegularText>
                Your next Appointment date{" "}
                {formatDDMMYY(appointments?.appointmentAt)}
                <br />({daysUntil(appointments?.appointmentAt)} day
                {daysUntil(appointments?.appointmentAt) !== 1 ? "s" : ""} left)
              </RegularText>
            ) : (
              <RegularText>No upcoming appointment.</RegularText>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientDetails;
