// pages/TherapyHistoryPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  AppBar,
  Container,
  Box,
  Stack,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import patientService from "../../services/patientService";
import usePatient from "../../hooks/usePatient";
import ChildDetailCard from "../../components/childDetailCard";
import { useNavigate } from "react-router-dom";
import RegularText from "../../components/typography/regularText";
import SemiBoldText from "../../components/typography/semiBoldText";
import RoundedButton from "../../components/button/roundedButton";

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

  const patientId = patient?.patientCode;

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
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
    }
  }, [patientId]);

  useEffect(() => {
    fetchPlans();
  }, [patientId, fetchPlans]);

  const [_, ...rest] = sessions;

  return (
    <Container maxWidth="lg">
      <AppBar position="static" color="transparent" elevation={0}>
        <Box sx={{ width: "50%", mx: "auto" }}>
          <ChildDetailCard
            childData={{
              name: patient?.patientName,
              age: patient?.patientAge,
              gender: patient?.patientGender,
              caretakerName: patient?.caretakerName,
            }}
          />
        </Box>
      </AppBar>

      {loading ? (
        <Stack alignItems="center" sx={{ pt: 5 }}>
          <CircularProgress size={36} sx={{ color: "#000" }} />
          <RegularText>Loading…</RegularText>
        </Stack>
      ) : rest.length === 0 ? (
        <Box sx={{ pt: 5, textAlign: "center" }}>
          <RegularText>No therapy plan found for this child.</RegularText>
          {!!errorMsg && (
            <RegularText sx={{ mt: 0.75, color: "#CC3344" }}>
              {errorMsg}
            </RegularText>
          )}
        </Box>
      ) : (
        rest.map((s) => (
          <Card
            fullWidth
            key={s.id}
            variant="outlined"
            sx={{
              mt: 2.25,
              borderRadius: 2,
              borderColor: "#EEF2FF",
              bgcolor: "#FFFFFF",
              boxShadow: { xs: "0px 6px 10px rgba(0,0,0,0.06)" },
            }}
          >
            <CardContent sx={{ p: 2.25, pr: 2 }}>
              <Stack direction="row" alignItems="flex-start">
                <Box sx={{ flex: 1, pr: 1.5 }}>
                  <SemiBoldText
                    sx={{
                      mb: 0.75,
                    }}
                  >
                    {formatLongDate(s.dateISO)}
                  </SemiBoldText>
                  <RegularText sx={{ mb: 1.25 }}>
                    {s.start} – {s.end}
                  </RegularText>
                  {/* <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#FF5A82" }}>
                      {s.type}
                    </Typography> */}
                </Box>

                <RoundedButton
                  onClick={() =>
                    navigate("/therapyPlans", { state: { planId: s.id } })
                  }
                  sx={{ width: "fit-content", padding: 0, height: 32 }}
                >
                  View
                </RoundedButton>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}

      <Box sx={{ height: 12 }} />
    </Container>
  );
}
