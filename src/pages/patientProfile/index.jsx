import React, { useEffect, useRef, useState } from "react";
import { Box, Chip, Stack, Grid } from "@mui/material";
import PatientCard from "../../components/patientCards";
import patientService from "../../services/patientService";
import SkeletonBlock from "../../components/skeleton";
import { useSelector } from "react-redux";

const bubbleFilters = ["Autism", "Cerebral Palsy", "ADHD", "Dyslexia"];

const PatientProfile = () => {
  const debounceRef = useRef(null);
  const searchedPatient = useSelector((state) => state?.patient?.searchPatient);
  const [patientList, setPatientList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPatientList = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAllPatients(searchedPatient);
      if (response?.success) {
        setPatientList(response?.data);
      }
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchPatientList(searchedPatient);
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [searchedPatient]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 3, overflowX: "auto", pb: 1 }}
      >
        {bubbleFilters.map((filter) => (
          <Chip
            key={filter}
            label={filter}
            clickable
            sx={{ bgcolor: "#EDF2FA", color: "#222" }}
          />
        ))}
      </Stack>
      <Grid container spacing={3}>
        {loading ? (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SkeletonBlock
                variant="rectangular"
                width="450"
                height={200}
                borderRadius={5}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SkeletonBlock
                variant="rectangular"
                width="450"
                height={200}
                borderRadius={10}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SkeletonBlock
                variant="rectangular"
                width="450"
                height={200}
                borderRadius={10}
              />
            </Grid>
          </>
        ) : (
          patientList.map((patient, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box sx={{ width: 450, maxWidth: "100%" }}>
                <PatientCard patient={patient} />
              </Box>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default PatientProfile;
