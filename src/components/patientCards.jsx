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
  Modal,
  Paper,
} from "@mui/material";
import { Leaderboard } from "@mui/icons-material";
import { FontSize } from "../constant/lookUpConstant";
import { useNavigate } from "react-router-dom";
import usePatient from "../hooks/usePatient";
import PolarChart from "./polarChart";

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
  const navigate = useNavigate();
  const { setPatient } = usePatient();

  const [expand, setExpand] = useState(false);
  const [diagnosisModalVisible, setDiagnosisModalVisible] = useState(false);
  const [diagnosisContent, setDiagnosisContent] = useState({
    text: "",
    fileUrl: "",
  });

  const {
    patientId = "",
    caretakerId = "",
    patientName = "",
    patientAge = null,
    patientGender = "",
    caretakerName = "",
    caretakerEmail = "",
    diagnosis = "",
    DailyActivities = [],
    activity = "",
    interest = "",
    aggressionValue = "",
    aggression = "",
    diagnosisReport,
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

    const dReport = {
      text: bd?.diagnosisReportText ?? "",
      fileUrl: bd?.diagnosisReportFile?.fileUrl ?? "",
    };

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
      diagnosisReport: dReport,
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

    setPatient(patientData);
    navigate(`/patientDetails`);
  };

  const openDiagnosisModal = (diagnosisReport = {}) => {
    const text = diagnosisReport?.text || "No diagnosis text available.";
    const fileUrl = diagnosisReport?.fileUrl || "";
    setDiagnosisContent({ text, fileUrl });
    setDiagnosisModalVisible(true);
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
        {diagnosis || "No Diagnosis"}
      </Typography>
      <Collapse in={expand} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <PolarChart />
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
          <Button
            sx={{ p: 0, display: "flex", flexDirection: "column", gap: 1 }}
            onClick={() => openDiagnosisModal(diagnosisReport || {})}
          >
            <img src="/src/assets/svg/diagnosis.svg" alt="diagnosisIcon" />
            <Typography fontSize={8}>
              Diagnosis <br /> Report
            </Typography>
          </Button>
          <Button
            sx={{ p: 0, display: "flex", flexDirection: "column", gap: 1 }}
            onClick={() => navigate(`/reports/?id=${caretakerId}`)}
          >
            <img src="/src/assets/svg/progress-report.svg" alt="progressIcon" />
            <Typography fontSize={8}>
              Progress <br />
              Report
            </Typography>
          </Button>
        </Box>
      </Collapse>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
        <Leaderboard color="secondary" fontSize="large" />
        <Typography fontWeight={600}>{aggressionValue || "0"}%</Typography>
        <Typography fontSize={FontSize.SUB_TITLE} color="black">
          {aggression || "No Aggression"}
        </Typography>
      </Box>
      <Modal
        open={diagnosisModalVisible}
        onClose={() => setDiagnosisModalVisible(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "rgba(0, 0, 0, 0.07)",
          p: 2,
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: 640,
            bgcolor: "#fff",
            borderRadius: 2,
            p: 3,
            boxShadow: 5,
            outline: "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Diagnosis Report
          </Typography>

          <Box
            sx={{
              maxHeight: 300,
              overflowY: "auto",
              mb: 2,
            }}
          >
            <Typography sx={{ color: "#333", lineHeight: 1.6 }}>
              {diagnosisContent.text || "No diagnosis text available."}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setDiagnosisModalVisible(false)}
              sx={{
                borderColor: "#E6E6E6",
                color: "#0B726E",
                "&:hover": {
                  borderColor: "#0B726E",
                  bgcolor: "#f9f9f9",
                },
              }}
            >
              Close
            </Button>
            {diagnosisContent.fileUrl && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => window.open(diagnosisContent.fileUrl, "_blank")}
              >
                Open Report File
              </Button>
            )}
          </Box>
        </Paper>
      </Modal>
    </Card>
  );
};

export default PatientCard;
