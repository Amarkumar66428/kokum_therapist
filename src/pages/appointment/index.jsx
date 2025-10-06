import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
} from "@mui/material";

// Helper TabPanel component
const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const Appointment = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Dummy data
  const upcomingAppointments = [
    { id: 1, doctor: "Dr. Sharma", date: "2025-10-10", time: "10:30 AM" },
    { id: 2, doctor: "Dr. Patel", date: "2025-10-15", time: "2:00 PM" },
  ];

  const previousAppointments = [
    { id: 3, doctor: "Dr. Mehta", date: "2025-09-20", time: "11:00 AM" },
    { id: 4, doctor: "Dr. Gupta", date: "2025-08-05", time: "4:00 PM" },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tabValue} onChange={handleTabChange} >
        <Tab label="Upcoming" />
        <Tab label="Previous" />
      </Tabs>

      {/* Upcoming Tab */}
      <TabPanel value={tabValue} index={0}>
        <Stack spacing={2}>
          {upcomingAppointments.map((appt) => (
            <Card key={appt.id} sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6">{appt.doctor}</Typography>
                <Typography color="text.secondary">
                  {appt.date} • {appt.time}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="contained" color="primary">
                  Join
                </Button>
                <Button size="small" variant="outlined" color="error">
                  Cancel
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </TabPanel>

      {/* Previous Tab */}
      <TabPanel value={tabValue} index={1}>
        <Stack spacing={2}>
          {previousAppointments.map((appt) => (
            <Card key={appt.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6">{appt.doctor}</Typography>
                <Typography color="text.secondary">
                  {appt.date} • {appt.time}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="outlined">
                  View Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </TabPanel>
    </Box>
  );
};

export default Appointment;
