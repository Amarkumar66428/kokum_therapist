import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Divider,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import therapistService from "../../services/therapistService";
import useAuth from "../../hooks/useAuth";

const MyProfile = () => {
  const therapistId = useAuth()?.id;

  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTherapist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const id = therapistId;
      if (!id) {
        setError("No therapist ID provided in route.");
        setLoading(false);
        return;
      }

      const res = await therapistService.getTherapistDetails(id);
      if (res && res.therapist) {
        setTherapist(res.therapist);
      } else {
        setError("Therapist data not found.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load therapist data");
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    fetchTherapist();
  }, [fetchTherapist]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper
          sx={{
            maxWidth: 600,
            mx: "auto",
            p: 4,
            textAlign: "center",
            border: "1px solid",
            borderColor: "error.light",
            bgcolor: "error.lighter",
          }}
        >
          <Typography color="error.main" variant="h6" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchTherapist}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!therapist) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>No therapist data available.</Typography>
      </Box>
    );
  }

  const fields = {
    _id: therapist._id,
    name: therapist.name,
    email: therapist.email,
    role: therapist.role,
    createdBy: therapist.createdBy,
    clinicName: therapist.clinicName,
    phone: therapist.phone,
    address: therapist.address,
    city: therapist.city,
    state: therapist.state,
    pincode: therapist.pincode,
    others: therapist.others,
    createdAt: therapist.createdAt,
    updatedAt: therapist.updatedAt,
  };

  const renderRow = (label, value) => (
    <Grid
      container
      spacing={1}
      sx={{
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Grid item xs={5} sm={4} md={3}>
        <Typography color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={7} sm={8} md={9}>
        <Typography>{value || "-"}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ minHeight: "100vh", p: 1 }}>
      <Typography variant="h6">Therapist Profile</Typography>

      <Box sx={{ px: { xs: 1 }, mt: 2 }}>
        {/* Profile Card */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: 3,
            backgroundColor: "#EFF9FD",
          }}
        >
          <Avatar
            sx={{
              width: 70,
              height: 70,
              bgcolor: "#042F8A",
            }}
          >
            <PersonIcon fontSize="large" />
          </Avatar>

          <Box>
            <Typography variant="h6" fontWeight={700} color="#042F8A">
              {fields.name}
            </Typography>
            <Typography variant="body2" color="#042F8A">
              {fields.clinicName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fields.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fields.phone}
            </Typography>
          </Box>
        </Paper>

        {/* Contact & Clinic Info */}
        <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="#042F8A"
            gutterBottom
          >
            Contact & Clinic
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {renderRow("Clinic", fields.clinicName)}
          {renderRow("Phone", fields.phone)}
          {renderRow("Email", fields.email)}
          {renderRow("Address", fields.address)}
          {renderRow("City", fields.city)}
          {renderRow("State", fields.state)}
          {renderRow("Pincode", fields.pincode)}
          {renderRow("Other Info", fields.others)}
        </Paper>

        {/* Metadata */}
        <Paper sx={{ p: 3, mt: 3, borderRadius: 3, mb: 6 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="#042F8A"
            gutterBottom
          >
            Metadata
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {renderRow("ID", fields._id)}
          {renderRow("Role", fields.role)}
          {renderRow("Created By", fields.createdBy)}
          {renderRow(
            "Created At",
            fields.createdAt ? new Date(fields.createdAt).toLocaleString() : "-"
          )}
          {renderRow(
            "Updated At",
            fields.updatedAt ? new Date(fields.updatedAt).toLocaleString() : "-"
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default MyProfile;
