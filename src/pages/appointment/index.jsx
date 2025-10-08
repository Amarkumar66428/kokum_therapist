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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useNavigate } from "react-router-dom";
import therapistService from "../../services/therapistService";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");

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
        color="inherit"
        elevation={0}
        sx={{
          boxShadow: "none",
          borderRadius: 2,
        }}
      >
        <Toolbar sx={{ px: 2 }}>
          <Typography>Appointments</Typography>
        </Toolbar>
      </AppBar>

      {/* Tabs + Calendar */}
      <Box sx={{ display: "flex" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: 16,
              color: "#7d7d7e",
            },
            "& .Mui-selected": {
              color: "#0A0A0A",
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab label="Upcoming" value="upcoming" />
          <Tab label="Previous" value="previous" />
        </Tabs>
        <Box sx={{ ml: "auto" }}>
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
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
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
            <Typography sx={{ mt: 2 }}>Loading appointments...</Typography>
          </Box>
        ) : appointments.length === 0 ? (
          <Box
            sx={{
              py: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary">
              {activeTab === "upcoming"
                ? "No upcoming appointments."
                : "No previous appointments."}
            </Typography>
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
                  <Typography variant="body2" color="#0F2851" fontWeight={800}>
                    Date
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDisplayDate(item.appointmentAt)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="body2" color="#898D9E" fontWeight={600}>
                    Time
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDisplayTime(item.time)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2" color="#002F8D" fontWeight={700}>
                    Patient Name
                  </Typography>
                  <Typography variant="body2">{item.patientName}</Typography>
                </Grid>
              </Grid>
            </Paper>
          ))
        )}

        <Box sx={{ textAlign: "center" }}>
          <Button
            onClick={() => navigate("/appointments/schedule")}
            variant="outlined"
            sx={{
              borderRadius: 45,
              borderColor: "#CFEAE0",
              backgroundColor: "#F2FBF8",
              color: "#0B726E",
              fontWeight: 700,
              fontSize: 15,
              py: 1.4,
              px: 10,
              textTransform: "none",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              "&:hover": {
                backgroundColor: "#E6F7F0",
                borderColor: "#A8D9C8",
              },
            }}
            startIcon={<AddCircleOutlineIcon />}
          >
            Schedule a New Appointment
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentsPage;
