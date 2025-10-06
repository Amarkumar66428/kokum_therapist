import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Divider,
  Stack,
  Collapse,
  alpha,
} from "@mui/material";
import { Leaderboard } from "@mui/icons-material";
import PolarChart from "./polarChart";
import { FontSize } from "../constant/lookUpConstant";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCareTaker } from "../reducer/careTakerSlice";

const ACTIVITY_COLORS = [
  "#ef8548",
  "#667da6",
  "#8de4ff",
  "#3883f5",
  "#5D6BC3",
  "#667DA6",
  "#edb578",
  "#b1d59d",
  "#cfb6e8",
  "#e6b7b8",
];

const PatientCard = ({ patient }) => {
  console.log("patient: ", patient);
  const navigate = useNavigate();
  const [expand, setExpand] = useState(false);
  const dispatch = useDispatch();

  const {
    patientId = "",
    caretakerId = "",
    patientName = "",
    patientAge = null,
    patientGender = "",
    caretakerName = "",
    caretakerEmail = "",
    diagnosis = "",
    journeyEntries = [],
    DailyActivities = [],
    activity = "",
    interest = "",
    aggressionValue = "",
    aggression = "",
  } = (() => {
    const bd = patient?.basicDetails ?? {};
    const cd = patient?.childDetails ?? {};
    const ct = patient?.caretaker ?? {};

    // Fix: journeyEntries should be an array of values if journeyEntries[0] exists
    let journey = [];
    if (
      Array.isArray(patient?.journeyEntries) &&
      patient.journeyEntries.length > 0 &&
      typeof patient.journeyEntries[0] === "object"
    ) {
      journey = Object.values(patient.journeyEntries[0]);
    }

    // Fix: activities should be an array of strings
    const firstActivities =
      Array.isArray(patient.activities) && patient.activities.length > 0
        ? patient.activities.slice(0, 3).map((a) => a?.name ?? "")
        : [];

    const activity = patient?.preferred[0]?.activities?.join(", ") ?? "--";
    const interest = patient?.preferred[0]?.interests?.join(", ") ?? "--";

    return {
      patientId: bd._id ?? "",
      caretakerId: ct._id ?? "",
      patientName: bd.patientName ?? "",
      patientAge: cd.age ?? null,
      patientGender: cd.gender ? cd.gender.charAt(0).toUpperCase() : "",
      caretakerName: ct.name ?? "",
      caretakerEmail: ct.email ?? "",
      diagnosis: Array.isArray(cd.therapyDetails)
        ? cd.therapyDetails.join(", ")
        : "",
      journeyEntries: journey,
      DailyActivities: firstActivities,
      activity,
      interest,
      aggressionValue: cd.aggressionValue ?? "",
      aggression: cd.aggression ?? "",
    };
  })();

  const handleExplore = () => {
    const patientData = {
      patientId,
      patientName,
      patientAge,
      patientGender,
      caretakerName,
      caretakerEmail,
      caretakerId,
    };

    dispatch(setCareTaker({ patientData, patientId, caretakerId }));
    navigate(`/patientDetails/${patientId}/${caretakerId}`);
  };

  return (
    <Card
      onClick={() => setExpand((prev) => !prev)}
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 5,
        boxShadow: 3,
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight={700}>{patientName}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography fontSize={14} color="text.secondary">
            {patientAge} yr / {patientGender}
          </Typography>
        </Box>
      </Box>

      <Divider
        sx={{
          my: 1,
          height: 3,
          mx: -2,
          backgroundColor: "primary.main",
        }}
      />

      <Typography fontSize={14} color="success.main" fontWeight={600}>
        {diagnosis}
      </Typography>
      <Collapse in={expand} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <PolarChart size={250} values={journeyEntries} />

            <Stack spacing={0.7}>
              <Typography
                fontSize={"1em"}
                color="secondary.sub"
                fontWeight={600}
              >
                Daily Activity
              </Typography>
              {DailyActivities?.length <= 0 ? (
                <Typography fontSize={14} color="text.secondary">
                  No activity
                </Typography>
              ) : (
                DailyActivities.map((act, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 10,
                        bgcolor: alpha(ACTIVITY_COLORS[index], 0.5),
                        borderRadius: 5,
                      }}
                    />
                    <Typography fontSize={14} color="text.secondary">
                      {act}
                    </Typography>
                  </Box>
                ))
              )}
            </Stack>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Typography fontWeight={600}>Activity:</Typography>
            <Typography fontSize={14} color="text.secondary">
              {activity}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Typography fontWeight={600}>Interest:</Typography>
            <Typography fontSize={14} color="text.secondary">
              {interest}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "start",
          }}
        >
          <Button
            size="large"
            variant="outlined"
            sx={{
              px: 5,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 5,
              color: "#0b726e",
              borderColor: "#0b726e",
              background: alpha("#0b726e", 0.1),
            }}
            onClick={handleExplore}
          >
            Explore More
          </Button>
          <Button sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <img src="/src/assets/svg/diagnosis.svg" alt="diagnosisIcon" />
            <Typography fontSize={8}>
              Diagnosis <br /> Report
            </Typography>
          </Button>
          <Button sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <img src="/src/assets/svg/progress-report.svg" alt="progressIcon" />
            <Typography fontSize={8}>
              Progress <br />
              Report
            </Typography>
          </Button>
        </Box>
      </Collapse>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Leaderboard color="secondary" fontSize="large" />
        <Typography fontWeight={600}>{aggressionValue || "0"}%</Typography>
        <Typography fontSize={FontSize.SUB_TITLE} color="black">
          {aggression || "No Aggression"}
        </Typography>
      </Box>
    </Card>
  );
};

export default PatientCard;
