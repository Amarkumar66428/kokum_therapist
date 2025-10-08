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
import { useNavigate, useParams } from "react-router-dom";

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
  const planId = useParams().planId;
  const navigate = useNavigate();
  const { patient } = usePatient();

  const patientId = patient?.patientId;

  const [plan, setPlan] = useState(null);
  const [showShortComment, setShowShortComment] = useState(false);
  const [showLongComment, setShowLongComment] = useState(false);

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9f9fb" }}>
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
          <Typography>
            {planId ? "Therapy Plan (History)" : "Last Therapy Plan"}
          </Typography>
          <Box
            sx={{
              ml: "auto",
              display: "flex",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <IconButton
              aria-label="create new therapy plan"
              onClick={() => navigate("/therapyPlans/last")}
              color="primary"
            >
              <AddTaskIcon sx={{ color: "#032E8A" }} />
            </IconButton>
            <IconButton
              aria-label="open therapy history"
              onClick={() => navigate("/therapyPlans/history")}
              color="primary"
            >
              <HistoryIcon sx={{ color: "#032E8A" }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="sm"
        sx={{ display: "flex", flexDirection: "column", py: 2.5, gap: 2 }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <ChildDetailCard
          childData={{
            name: patient?.patientName,
            age: patient?.patientAge,
            gender: patient?.patientGender,
            caretakerName: patient?.caretakerName,
          }}
        />

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
            <Typography variant="body1" color="#4B5563" sx={{ mb: 1.5 }}>
              No last therapy plan found
            </Typography>
            <Button
              variant="text"
              onClick={() => navigate && navigate("TherapyPlanMain")}
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
              <Typography
                sx={{ fontSize: 15, fontWeight: 700, color: "#082878" }}
              >
                Date & Time
              </Typography>
              <Box
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 1.5,
                  p: 1.25,
                  border: "1px solid #EEF2FF",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1E293B",
                    mb: 0.5,
                  }}
                >
                  {planDate}
                </Typography>
                <Typography
                  sx={{ fontSize: 14, fontWeight: 600, color: "#64748B" }}
                >
                  {(plan?.startTime || "—") + " - " + (plan?.endTime || "—")}
                </Typography>
              </Box>
            </Stack>

            {/* Therapy Notes */}
            <Stack spacing={1}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#333" }}>
                Therapy Notes
              </Typography>
              <Box
                sx={{
                  minHeight: 100,
                  bgcolor: "#fff",
                  borderRadius: 1.5,
                  p: 1.25,
                  border: "1px solid #EEF2FF",
                }}
              >
                <Typography
                  sx={{ fontSize: 14, color: "#333", whiteSpace: "pre-wrap" }}
                >
                  {plan?.therapyNotes || "—"}
                </Typography>
              </Box>
            </Stack>

            {/* Short-term goals */}
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 1.5,
                p: 1.75,
                border: "1px solid #EEF2FF",
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#002F8D",
                  mb: 0.75,
                }}
              >
                Short- Term Goals
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#333",
                  mb: 1.25,
                  whiteSpace: "pre-wrap",
                }}
              >
                {plan?.shortTermGoals || "—"}
              </Typography>

              <Button
                variant="text"
                size="small"
                onClick={() => setShowShortComment((s) => !s)}
                sx={{
                  color: "#F72485",
                  fontWeight: 600,
                  px: 0,
                  alignSelf: "flex-start",
                }}
              >
                {showShortComment ? "Hide Comment" : "Show Comment"}
              </Button>

              {showShortComment && (
                <Box
                  sx={{
                    mt: 1.25,
                    bgcolor: "#fff",
                    border: "1px solid #EEFBFD",
                    borderRadius: 1,
                    p: 1.5,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 14, color: "#333", whiteSpace: "pre-wrap" }}
                  >
                    {plan?.shortTermComments || "—"}
                  </Typography>
                </Box>
              )}
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
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#002F8D",
                  mb: 0.75,
                }}
              >
                Long- Term Goals
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#333",
                  mb: 1.25,
                  whiteSpace: "pre-wrap",
                }}
              >
                {plan?.longTermGoals || "—"}
              </Typography>

              <Button
                variant="text"
                size="small"
                onClick={() => setShowLongComment((s) => !s)}
                sx={{
                  color: "#F72485",
                  fontWeight: 600,
                  px: 0,
                  alignSelf: "flex-start",
                }}
              >
                {showLongComment ? "Hide Comment" : "Show Comment"}
              </Button>

              {showLongComment && (
                <Box
                  sx={{
                    mt: 1.25,
                    bgcolor: "#fff",
                    border: "1px solid #EEFBFD",
                    borderRadius: 1,
                    p: 1.5,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 14, color: "#333", whiteSpace: "pre-wrap" }}
                  >
                    {plan?.longTermComments || "—"}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Home Care Plan list */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#000" }}>
                Home Care Plan
              </Typography>
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
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#000",
                    mb: 0.75,
                  }}
                >
                  Title
                </Typography>
                <Box
                  sx={{
                    fontSize: 14,
                    border: "1px solid #EEFBFD",
                    borderRadius: 1,
                    p: 1.25,
                    mb: 1,
                    bgcolor: "#fff",
                  }}
                >
                  {hp.title || "—"}
                </Box>

                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#000",
                    mb: 0.75,
                  }}
                >
                  Assigned Category
                </Typography>
                <Box
                  sx={{
                    fontSize: 14,
                    border: "1px solid #EEFBFD",
                    borderRadius: 1,
                    p: 1.25,
                    mb: 1,
                    bgcolor: "#fff",
                  }}
                >
                  {hp.assignedCategory || "—"}
                </Box>

                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#000",
                    mb: 0.75,
                  }}
                >
                  Instructions
                </Typography>
                <Box
                  sx={{
                    fontSize: 14,
                    border: "1px solid #EEFBFD",
                    borderRadius: 1,
                    p: 1.25,
                    mb: 1,
                    bgcolor: "#fff",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {hp.instructions || "—"}
                </Box>

                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#000",
                    mb: 0.75,
                  }}
                >
                  Attach Reference
                </Typography>
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
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 14,
                      color: "#032E8A",
                      fontWeight: 600,
                      mr: 1,
                      maxWidth: "80%",
                    }}
                  >
                    {hp.reference
                      ? hp.reference.name || "Attached"
                      : "Attach Reference"}
                  </Typography>
                  {/* paperclip visual via unicode or icon; MUI doesn't have Feather directly */}
                  <span style={{ color: "#032E8A", fontSize: 18 }}>📎</span>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
