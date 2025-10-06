import React, { useEffect, useState } from "react";
import { Container } from "@mui/material";
import ParallelCalendar from "../../components/parallelCalendar";
import patientService from "../../services/patientService";
import BlockBarChart from "../../components/blockBarChart";
import { useParams } from "react-router-dom";
import TimelineChart from "../../components/timeLinechart";
import ChildDetailCard from "../../components/childDetailCard";

const buildWeekAround = (iso) => {
  const base = new Date(iso);
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay()); // go to Sunday of that week

  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: toISODate(d), // keep ISO here
      values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10 metrics as before
    });
  }
  return out;
};

const toISODate = (d) => {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${da}`;
};

const PatientDetails = () => {
  const patientId = useParams().patientId;
  const caretakerId = useParams().caretakerId;
  const [loading, setLoading] = useState(false);
  const [barChartData, setBarChartData] = useState([]);
  const [dailyActivities, setDailyActivities] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const formatActivityForFrontend = (backendActivity) => {
    return {
      id: backendActivity._id,
      label: backendActivity.customName || backendActivity.name,
      timeOfDay: backendActivity.timeOfDay === "AM" ? "Morning" : "Evening",
      startTime: backendActivity.startTime,
      endTime: backendActivity.endTime,
      customName: backendActivity.customName,
      progress: backendActivity.progress, // Use the calculated progress from backend
      status: backendActivity.status,
      timeRemaining: backendActivity.timeRemaining,
      date: new Date(backendActivity.date),
    };
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const [journeyEntries, dailyActivities, routines, appointments] =
        await Promise.all([
          patientService.getJourneyEntries(caretakerId),
          patientService.getActivitiesByDate(caretakerId),
          patientService.getRoutines(caretakerId),
          patientService.getAppointmentsByPatient(patientId),
        ]);

      if (Array.isArray(journeyEntries)) {
        const week = buildWeekAround(selectedDate); // 7 days with ISO
        if (journeyEntries && Array.isArray(journeyEntries)) {
          const processed = week.map((d) => {
            const found = journeyEntries.find((entry) => {
              const entryISO = toISODate(new Date(entry.date));
              return entryISO === d.date;
            });
            return found
              ? {
                  day: d.day,
                  date: d.date,
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
          setBarChartData(week); // show empty week if nothing returned
        }
      }
      if (dailyActivities?.success) {
        const formatted = dailyActivities.activities.map(
          formatActivityForFrontend
        );
        setDailyActivities(formatted);
      }
      if (routines?.success && Array.isArray(routines?.routines)) {
        setRoutines(routines?.routines || []);
      }
      if (appointments?.success) {
        setAppointments(appointments?.upcoming[0] || []);
      }
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <Container maxWidth={false}>
      <ChildDetailCard />
      <ParallelCalendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      {/* <BlockBarChart /> */}
      <TimelineChart events={barChartData} />
    </Container>
  );
};

export default PatientDetails;
