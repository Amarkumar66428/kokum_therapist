// pages/TherapyHistoryPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Box,
  Stack,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";
import patientService from "../../services/patientService";
import usePatient from "../../hooks/usePatient";
import ChildDetailCard from "../../components/childDetailCard";
import { ArrowBackIosNewOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const formatLongDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
  });

const to12hr = (hhmm) => {
  try {
    if (!hhmm) return "—";
    const [hStr, mStr = "00"] = String(hhmm).split(":");
    let h = parseInt(hStr, 10);
    const m = mStr.padStart(2, "0");
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  } catch {
    return "—";
  }
};

export default function TherapyHistoryPage() {
  const navigate = useNavigate();
  const { patient } = usePatient();

  const patientId = patient?.patientId;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPlans = useCallback(
    async (isRefresh = false) => {
      try {
        setLoading(true);
        if (isRefresh) setRefreshing(true);
        setErrorMsg("");

        if (!patientId) {
          setSessions([]);
          setErrorMsg("No patient selected.");
          return;
        }

        const res = await patientService.getTherapyPlanById(patientId, {
          all: true,
        });

        const raw = Array.isArray(res?.therapyPlans) ? res?.therapyPlans : [];

        const mapped = raw
          .map((p) => ({
            id: String(p._id || `${p.planDate}-${p.startTime}`),
            dateISO:
              p.planDate ||
              p.createdAt ||
              p.updatedAt ||
              new Date().toISOString(),
            start: to12hr(p.startTime),
            end: to12hr(p.endTime),
            type: p?.homeCarePlans?.[0]?.assignedCategory || "Therapy",
          }))
          .sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));

        setSessions(mapped);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to fetch therapy plans.";
        setSessions([]);
        setErrorMsg(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [patientId]
  );

  useEffect(() => {
    fetchPlans();
  }, [patientId, fetchPlans]);

  const handleRefresh = () => fetchPlans(true);

  const [, ...rest] = sessions;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F7F8FC" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          boxShadow: "none",
          borderRadius: 2,
        }}
      >
        <Toolbar disableGutters sx={{ px: 2, gap: 1 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNewOutlined />
          </IconButton>
          <Typography>Sessions History</Typography>
          <Box sx={{ ml: "auto" }} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2.5 }}>
        <ChildDetailCard
          childData={{
            name: patient?.patientName,
            age: patient?.patientAge,
            gender: patient?.patientGender,
            caretakerName: patient?.caretakerName,
          }}
        />

        {/* Refresh control alternative */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
          <Button
            variant="text"
            size="small"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ pt: 5 }}>
            <CircularProgress size={36} sx={{ color: "#082878" }} />
            <Typography sx={{ mt: 1, color: "#082878" }}>Loading…</Typography>
          </Stack>
        ) : rest.length === 0 ? (
          <Box sx={{ pt: 5, textAlign: "center" }}>
            <Typography
              sx={{ color: "#0A1F44", fontSize: 16, fontWeight: 600 }}
            >
              No therapy plan found for this child.
            </Typography>
            {!!errorMsg && (
              <Typography sx={{ mt: 0.75, color: "#CC3344" }}>
                {errorMsg}
              </Typography>
            )}
          </Box>
        ) : (
          rest.map((s) => (
            <Card
              key={s.id}
              variant="outlined"
              sx={{
                mt: 2.25,
                borderRadius: 2,
                borderColor: "#EEF2FF",
                bgcolor: "#FFFFFF",
                // subtle elevation parity
                boxShadow: { xs: "0px 6px 10px rgba(0,0,0,0.06)" },
              }}
            >
              <CardContent sx={{ p: 2.25, pr: 2 }}>
                <Stack direction="row" alignItems="flex-start">
                  <Box sx={{ flex: 1, pr: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#0A1F44",
                        mb: 0.75,
                      }}
                    >
                      {formatLongDate(s.dateISO)}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 14, color: "#0A1F44", mb: 1.25 }}
                    >
                      {s.start} – {s.end}
                    </Typography>
                    {/* <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#FF5A82" }}>
                      {s.type}
                    </Typography> */}
                  </Box>

                  <Button
                    variant="contained"
                    disableElevation
                    onClick={() =>
                      navigate && navigate("TherapyPlanView", { planId: s.id })
                    }
                    sx={{
                      textTransform: "none",
                      borderRadius: 14,
                      py: 1,
                      px: 2.25,
                      bgcolor: "#EEF4FF",
                      color: "#0A1F44",
                      fontWeight: 800,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#E2EBFF", boxShadow: "none" },
                    }}
                  >
                    View
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}

        <Box sx={{ height: 12 }} />
      </Container>
    </Box>
  );
}
