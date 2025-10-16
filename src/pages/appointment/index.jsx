import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  Grid,
  AppBar,
  Toolbar,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useNavigate } from "react-router-dom";
import therapistService from "../../services/therapistService";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import SemiBoldText from "../../components/typography/semiBoldText";
import RegularText from "../../components/typography/regularText";
import RoundedButton from "../../components/button/roundedButton";

const formatDisplayDate = (isoDate) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDisplayTime = (hhmm) => {
  const [h, m] = hhmm.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointmentsAll, setAppointmentsAll] = useState({
    upcoming: [],
    previous: [],
  });
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await therapistService.getAppointments();
      if (data?.success) {
        setAppointmentsAll({
          upcoming: data.upcoming || [],
          previous: data.previous || [],
        });
        setAppointments(data.upcoming || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setAppointments(appointmentsAll[newValue] || []);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppBar
        position="sticky"
        color="background.default"
        elevation={0}
        sx={{
          boxShadow: "none",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: "1px solid #e0e0e0",
              "& .MuiTab-root": {
                textTransform: "none",
                fontFamily: "regular",
              },
              "& .Mui-selected": { fontFamily: "semibold" },
            }}
          >
            <Tab label="Upcoming" value="upcoming" />
            <Tab label="Previous" value="previous" />
          </Tabs>
          <Box sx={{ ml: "auto" }}>
            <DatePicker
              value={selectedDate}
              onChange={(v) => v && setSelectedDate(v)}
              format="D MM, YYYY"
              sx={{
                fontSize: 12,
                "& .MuiPickersInputBase-sectionsContainer": {
                  padding: 1.5,
                },
              }}
            />
          </Box>
        </Box>
      </AppBar>

      {/* Tabs + Calendar */}

      {/* Content */}
      <Box
        sx={{
          mt: 2,
          px: { xs: 2, md: 4 },
          pb: 6,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {loading ? (
          <Box
            sx={{
              py: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress color="primary" />
            <SemiBoldText sx={{ mt: 2 }}>Loading appointments...</SemiBoldText>
          </Box>
        ) : appointments.length === 0 ? (
          <Box
            sx={{
              mt: 2,
              py: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SemiBoldText color="text.secondary">
              {activeTab === "upcoming"
                ? "No upcoming appointments."
                : "No previous appointments."}
            </SemiBoldText>
          </Box>
        ) : (
          appointments.map((item) => (
            <Paper
              key={item._id}
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(44,127,255,0.08)",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, md: 4 }}>
                  <SemiBoldText>Date</SemiBoldText>
                  <RegularText>
                    {formatDisplayDate(item.appointmentAt)}
                  </RegularText>
                </Grid>

                <Grid size={{ xs: 6, md: 4 }}>
                  <SemiBoldText>Time</SemiBoldText>
                  <RegularText>{formatDisplayTime(item.time)}</RegularText>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <SemiBoldText>Patient Name</SemiBoldText>
                  <RegularText>{item.patientName}</RegularText>
                </Grid>
              </Grid>
            </Paper>
          ))
        )}

        <Box sx={{ textAlign: "center" }}>
          <RoundedButton
            onClick={() => navigate("/appointments/schedule")}
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              width: "30em",
            }}
          >
            Schedule a New Appointment
          </RoundedButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentsPage;
