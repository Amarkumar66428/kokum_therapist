// pages/TherapyPlanViewPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Box,
  Stack,
  Button,
  Skeleton,
  Alert,
} from "@mui/material";
import AddTaskIcon from "@mui/icons-material/PlaylistAdd";
import HistoryIcon from "@mui/icons-material/History";
import usePatient from "../../hooks/usePatient";
import patientService from "../../services/patientService";
import ChildDetailCard from "../../components/childDetailCard";
import { useLocation, useNavigate } from "react-router-dom";
import SemiBoldText from "../../components/typography/semiBoldText";
import RegularText from "../../components/typography/regularText";
import { AttachFile } from "@mui/icons-material";

const formatLongDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "—";

export default function TherapyPlanViewPage() {
  const location = useLocation();
  const planId = location.state?.planId;
  const navigate = useNavigate();
  const { patient } = usePatient();

  const patientId = patient?.patientCode;

  const [plan, setPlan] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLatestPlan = useCallback(async () => {
    try {
      if (!patientId) return;
      setLoading(true);
      setError(null);

      const res = await patientService.getTherapyPlanById(patientId, {
        planId,
      });
      const plans = res?.therapyPlans;
      setPlan(plans || null);
    } catch (e) {
      console.log("e: ", e);
      setError("Failed to load therapy plan");
    } finally {
      setLoading(false);
    }
  }, [patientId, planId]);

  useEffect(() => {
    fetchLatestPlan(false);
  }, [patientId, fetchLatestPlan]);

  const planDate = plan?.planDate
    ? formatLongDate(plan.planDate)
    : plan?.createdAt
    ? formatLongDate(plan.createdAt)
    : "—";

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

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <IconButton
              aria-label="create new therapy plan"
              onClick={() => navigate("/therapyPlans/last")}
              color="primary"
            >
              <AddTaskIcon sx={{ color: "primary.icon" }} />
            </IconButton>
            <IconButton
              aria-label="open therapy history"
              onClick={() => navigate("/therapyPlans/history")}
              color="primary"
            >
              <HistoryIcon sx={{ color: "primary.icon" }} />
            </IconButton>
          </Box>
        </Box>
      </AppBar>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack spacing={2}>
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="rounded" height={100} />
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="rounded" height={150} />
        </Stack>
      ) : !plan ? (
        <Box
          sx={{
            p: 2.5,
            textAlign: "center",
          }}
        >
          <SemiBoldText>No last therapy plan found</SemiBoldText>
          <Button
            variant="text"
            onClick={() => navigate("/therapyPlans/last")}
            startIcon={<AddTaskIcon sx={{ color: "#032E8A" }} />}
            sx={{ color: "#000", fontWeight: 500 }}
          >
            Add New Therapy Plan
          </Button>
        </Box>
      ) : (
        <Stack spacing={2.5}>
          {/* Date & Time */}
          <Stack spacing={1}>
            <SemiBoldText>Date & Time</SemiBoldText>
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 1.5,
                p: 1.25,
                border: "1px solid #EEF2FF",
              }}
            >
              <RegularText color="text.secondary">{planDate}</RegularText>
              <RegularText color="text.secondary">
                {(plan?.startTime || "—") + " - " + (plan?.endTime || "—")}
              </RegularText>
            </Box>
          </Stack>

          {/* Therapy Notes */}
          <Stack spacing={1}>
            <SemiBoldText>Therapy Notes</SemiBoldText>
            <Box
              sx={{
                minHeight: 100,
                bgcolor: "#fff",
                borderRadius: 1.5,
                p: 1.25,
                border: "1px solid #EEF2FF",
              }}
            >
              <RegularText color="text.secondary">
                {plan?.therapyNotes || "—"}
              </RegularText>
            </Box>
          </Stack>

          {/* Short-term goals */}
          <SemiBoldText>Gaols</SemiBoldText>
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 1.5,
              p: 1.75,
              border: "1px solid #EEF2FF",
            }}
          >
            <SemiBoldText>Short- Term Goals</SemiBoldText>
            <RegularText
              color="text.secondary"
              sx={{ backgroundColor: "#fafafa", p: 1, borderRadius: 1 }}
            >
              {plan?.shortTermGoals || "—"}
            </RegularText>

            <SemiBoldText>Comment</SemiBoldText>

            <RegularText
              color="text.secondary"
              sx={{ backgroundColor: "#fafafa", p: 1, borderRadius: 1 }}
            >
              {plan?.shortTermComments || "—"}
            </RegularText>
          </Box>

          {/* Long-term goals */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 1.5,
              p: 1.75,
              border: "1px solid #EEF2FF",
            }}
          >
            <SemiBoldText>Long- Term Goals</SemiBoldText>

            <RegularText
              color="text.secondary"
              sx={{ backgroundColor: "#fafafa", p: 1, borderRadius: 1 }}
            >
              {plan?.longTermGoals || "—"}
            </RegularText>
            <SemiBoldText>Show Comment</SemiBoldText>
            <RegularText
              color="text.secondary"
              sx={{ backgroundColor: "#fafafa", p: 1, borderRadius: 1 }}
            >
              {plan?.longTermComments || "—"}
            </RegularText>
          </Box>

          {/* Home Care Plan list */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <SemiBoldText>Home Care Plan</SemiBoldText>
          </Stack>

          {(plan?.homeCarePlans || []).map((hp, idx) => (
            <Box
              key={idx}
              sx={{
                p: 1.75,
                bgcolor: "#F6F9FF",
                borderRadius: 1.5,
                border: "1px solid #EEF2FF",
              }}
            >
              <SemiBoldText>Title</SemiBoldText>
              <RegularText
                color="text.secondary"
                sx={{ backgroundColor: "#fafafa", p: 1, borderRadius: 1 }}
              >
                {hp.title || "—"}
              </RegularText>

              <SemiBoldText>Assigned Category</SemiBoldText>
              <RegularText
                color="text.secondary"
                sx={{ backgroundColor: "#fafafa", p: 1, borderRadius: 1 }}
              >
                {hp.assignedCategory || "—"}
              </RegularText>

              <SemiBoldText>Instructions</SemiBoldText>
              <RegularText
                color="text.secondary"
                sx={{ backgroundColor: "#fafafa", p: 1, borderRadius: 1 }}
              >
                {hp.instructions || "—"}
              </RegularText>

              <SemiBoldText>Attach Reference</SemiBoldText>
              <Box
                sx={{
                  bgcolor: "#EFF9FD",
                  p: 1.25,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <RegularText color="text.secondary">
                  {hp.reference
                    ? hp.reference.name || "Attached"
                    : "Attach Reference"}
                </RegularText>
                {/* paperclip visual via unicode or icon; MUI doesn't have Feather directly */}
                <AttachFile sx={{ color: "primary.icon" }} />
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Container>
  );
}
