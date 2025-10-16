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
import { useNavigate } from "react-router-dom";
import usePatient from "../hooks/usePatient";
import PolarChart from "./polarChart";
import RegularText from "./typography/regularText";
import { ICON_SIZE } from "../constant/lookUpConstant";
import SemiBoldText from "./typography/semiBoldText";
import RoundedButton from "./button/roundedButton";

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
    patientCode = "",
    caretakerId = "",
    patientName = "",
    patientAge = null,
    patientGender = "",
    caretakerName = "",
    caretakerEmail = "",
    therapyType = "",
    DailyActivities = [],
    journeyEntries = [],
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
    if (Array.isArray(patient?.journeyEntries) && patient.journeyEntries[0]) {
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
      patientCode: bd.patientId ?? "",
      caretakerId: ct._id ?? "",
      patientName: bd.patientName ?? "",
      patientAge: cd.age ?? null,
      patientGender: cd.gender ? cd.gender.charAt(0).toUpperCase() : "",
      caretakerName: ct.name ?? "",
      caretakerEmail: ct.email ?? "",
      therapyType: Array.isArray(cd.therapyDetails)
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
      therapyType,
      patientCode,
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
        <SemiBoldText>{patientName}</SemiBoldText>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RegularText>
            {patientAge || "--"} yr / {patientGender || "--"}
          </RegularText>
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

      <RegularText color="primary.success">
        {therapyType || "No Diagnosis"}
      </RegularText>
      <Collapse in={expand} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <PolarChart
              values={journeyEntries?.length > 0 ? journeyEntries : null}
            />
            <Stack spacing={0.7}>
              <SemiBoldText>Daily Activity</SemiBoldText>
              {DailyActivities?.length <= 0 ? (
                <RegularText color="text.secondary">No activity</RegularText>
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
                    <RegularText>{act}</RegularText>
                  </Box>
                ))
              )}
            </Stack>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <SemiBoldText>Activity:</SemiBoldText>
            <RegularText>{activity}</RegularText>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <SemiBoldText>Interest:</SemiBoldText>
            <RegularText>{interest}</RegularText>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "start",
          }}
        >
          <RoundedButton sx={{ width: 200 }} onClick={handleExplore}>
            Explore More
          </RoundedButton>
          <Button
            sx={{ p: 0, display: "flex", flexDirection: "column", gap: 1 }}
            onClick={() => openDiagnosisModal(diagnosisReport || {})}
          >
            <img src="/src/assets/svg/diagnosis.svg" alt="diagnosisIcon" />
            <Typography fontSize={10} fontFamily={"regular"}>
              Diagnosis <br /> Report
            </Typography>
          </Button>
          <Button
            sx={{ p: 0, display: "flex", flexDirection: "column", gap: 1 }}
            onClick={() => navigate(`/reports/?id=${caretakerId}`)}
          >
            <img src="/src/assets/svg/progress-report.svg" alt="progressIcon" />
            <Typography fontSize={10} fontFamily={"regular"}>
              Progress <br />
              Report
            </Typography>
          </Button>
        </Box>
      </Collapse>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
        <Leaderboard sx={{ color: "primary.icon", fontSize: ICON_SIZE.MD }} />
        <SemiBoldText>{aggressionValue || "0"}%</SemiBoldText>
        <RegularText>{aggression || "No Aggression"}</RegularText>
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
          <SemiBoldText>Diagnosis Report</SemiBoldText>

          <Box
            sx={{
              maxHeight: 300,
              overflowY: "auto",
              mb: 2,
            }}
          >
            <RegularText>
              {diagnosisContent.text || "No diagnosis text available."}
            </RegularText>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setDiagnosisModalVisible(false)}
              sx={{
                borderColor: "#E6E6E6",
                color: "primary.main",
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
                sx={{ backgroundColor: "primary.label", color: "secondary" }}
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
