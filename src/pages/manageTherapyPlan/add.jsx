// TherapyPlanPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Stack,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AttachmentIcon from "@mui/icons-material/Attachment";
import HistoryIcon from "@mui/icons-material/History";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import usePatient from "../../hooks/usePatient";
import api from "../../utils/axios";
import ChildDetailCard from "../../components/childDetailCard";
import patientService from "../../services/patientService";
import { ArrowBackIosNewOutlined } from "@mui/icons-material";

const PALETTE = {
  primary: "#042F8A",
  accentPink: "#FF5A82",
  softBlue: "#EFF9FD",
  cardBorder: "rgba(44,127,255,0.08)",
  bg: "#F9F9FB",
  inputBorder: "#EEF2FF",
  greenCTA: "#0B726E",
};

const CATEGORY_OPTIONS = [
  { label: "Type Category", value: "" },
  { label: "Physical Therapy", value: "Physical" },
  { label: "Occupational Therapy", value: "Occupational" },
  { label: "Speech Therapy", value: "Speech" },
];

const blankHomeCare = () => ({
  title: "",
  category: "",
  instructions: "",
  reference: null,
  schedule: "",
});

export default function TherapyPlanPage() {
  const navigate = useNavigate();
  const { patient } = usePatient();

  const caretakerId = patient?.caretakerId;
  const patientId = patient?.patientId;

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [startTime, setStartTime] = useState(() => new Date());
  const [endTime, setEndTime] = useState(() => new Date());

  const [therapyNotes, setTherapyNotes] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");

  const [goalOne, setGoalOne] = useState("");
  const [goalTwo, setGoalTwo] = useState("");
  const [showShortComment, setShowShortComment] = useState(false);
  const [showLongComment, setShowLongComment] = useState(false);
  const [shortTermComment, setShortTermComment] = useState("");
  const [longTermComment, setLongTermComment] = useState("");

  const [homeCarePlans, setHomeCarePlans] = useState([blankHomeCare()]);
  const [latestPlanId, setLatestPlanId] = useState(null);
  const [prefillLoading, setPrefillLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLatestPlan = async () => {
      if (!patientId) return;
      setPrefillLoading(true);
      try {
        const res = await patientService.getTherapyPlanById(patientId);
        const latest = res?.therapyPlans || {};
        setGoalOne(latest?.shortTermGoals || "");
        setGoalTwo(latest?.longTermGoals || "");
        setShortTermComment(latest?.shortTermComments || "");
        setLongTermComment(latest?.longTermComments || "");
        setShowShortComment(!!latest?.shortTermComments);
        setShowLongComment(!!latest?.longTermComments);
        setGeneralNotes(latest?.generalNotes || "");

        const mapped =
          (latest?.homeCarePlans || []).map((p) => ({
            title: p?.title || "",
            category: p?.assignedCategory || "",
            instructions: p?.instructions || "",
            reference: null,
            schedule: p?.schedule || "",
          })) || [];

        setHomeCarePlans(mapped.length ? mapped : [blankHomeCare()]);
        setLatestPlanId(latest?._id || null);
      } catch (e) {
        console.warn("prefill error", e);
      } finally {
        setPrefillLoading(false);
      }
    };
    fetchLatestPlan();
  }, [patientId]);

  const zero2 = (n) => String(n).padStart(2, "0");
  const toHHMM = (d) => `${zero2(d.getHours())}:${zero2(d.getMinutes())}`;
  const toISODate = (d) => moment(d).format("YYYY-MM-DD");

  const handleAddPlan = () => setHomeCarePlans((s) => [...s, blankHomeCare()]);
  const handleRemovePlan = (index) =>
    setHomeCarePlans((s) => s.filter((_, i) => i !== index));
  const handleHomeCareChange = (index, field, value) => {
    setHomeCarePlans((s) => {
      const next = [...s];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFilePick = (index, file) => {
    if (!file) return;
    handleHomeCareChange(index, "reference", {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const buildPayload = () => ({
    patientId,
    caretakerId,
    planDate: toISODate(selectedDate),
    startTime: toHHMM(startTime),
    endTime: toHHMM(endTime),
    therapyNotes: therapyNotes || "",
    shortTermGoals: goalOne || "",
    shortTermComments: shortTermComment || "",
    longTermGoals: goalTwo || "",
    longTermComments: longTermComment || "",
    generalNotes: generalNotes || "",
    homeCarePlans: homeCarePlans.map((p) => ({
      title: p.title || "",
      assignedCategory: p.category || "",
      instructions: p.instructions || "",
      schedule: p.schedule || "",
    })),
  });

  const handleSubmit = async () => {
    try {
      if (!caretakerId || !patientId) {
        window.alert("Missing patient or caretaker id.");
        return;
      }
      setSubmitting(true);

      const basePayload = buildPayload();
      const files = homeCarePlans.map((p) => p.reference?.file).filter(Boolean);

      if (files.length > 0) {
        const form = new FormData();
        Object.entries(basePayload).forEach(([k, v]) => {
          if (k === "homeCarePlans") return;
          if (v !== undefined && v !== null) form.append(k, String(v));
        });
        form.append("homeCarePlans", JSON.stringify(basePayload.homeCarePlans));
        files.forEach((file, idx) => {
          const name = file.name || `attachment-${idx + 1}`;
          const type = file.type || "application/octet-stream";
          form.append("attachments", file, name);
        });
        await api.post("/therapy-plan", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/therapy-plan", basePayload);
      }

      window.alert("Therapy plan created successfully.");
    } catch (err) {
      console.error("submit error", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit therapy plan.";
      window.alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: "100vh", bgcolor: PALETTE.bg }}>
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
            <Typography>New Therapy Plan</Typography>
            <Box sx={{ ml: "auto" }}>
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

        {/* Child card */}
        <Container maxWidth="sm" sx={{ py: 2.5 }}>
          <ChildDetailCard
            childData={{
              name: patient?.patientName,
              age: patient?.patientAge,
              gender: patient?.patientGender,
              caretakerName: patient?.caretakerName,
            }}
          />
        </Container>

        {/* Prefill notice */}
        <Box sx={{ maxWidth: 1200, mx: "auto", mb: 2 }}>
          {prefillLoading ? (
            <Box display="flex" gap={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography color={PALETTE.primary}>
                Checking previous plans…
              </Typography>
            </Box>
          ) : latestPlanId ? (
            <Typography color="#0B726E">
              Goals and Home care plans prefilled from last therapy plan.
            </Typography>
          ) : null}
        </Box>

        {/* Date & Times */}
        <Box sx={{ maxWidth: 1200, mx: "auto", mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <DatePicker
                label="Plan Date"
                value={selectedDate}
                onChange={(d) => d && setSelectedDate(d)}
                format="MMM D, YYYY"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={(t) => t && setStartTime(t)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={(t) => t && setEndTime(t)}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Therapy notes */}
        <Box sx={{ maxWidth: 1200, mx: "auto", mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Therapy Notes
          </Typography>
          <TextField
            multiline
            minRows={4}
            fullWidth
            placeholder="Type therapy notes"
            value={therapyNotes}
            onChange={(e) => setTherapyNotes(e.target.value)}
            sx={{
              bgcolor: "#fff",
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: PALETTE.inputBorder,
              },
            }}
          />
        </Box>

        {/* Goals */}
        <Box sx={{ maxWidth: 1200, mx: "auto", mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Goals
          </Typography>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              mb: 2,
              border: `1px solid ${PALETTE.inputBorder}`,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: PALETTE.primary, mb: 1 }}>
              Short- Term Goals
            </Typography>
            <TextField
              multiline
              minRows={2}
              fullWidth
              placeholder="Enter short-term goals"
              value={goalOne}
              onChange={(e) => setGoalOne(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              variant="text"
              onClick={() => setShowShortComment((s) => !s)}
              sx={{ color: PALETTE.accentPink, fontWeight: 600, px: 0 }}
            >
              {showShortComment ? "Hide Comment" : "Add Comment"}
            </Button>
            {showShortComment && (
              <TextField
                multiline
                minRows={3}
                fullWidth
                placeholder="Short-term goal comment"
                value={shortTermComment}
                onChange={(e) => setShortTermComment(e.target.value)}
                sx={{ mt: 1, bgcolor: "#fff", borderRadius: 1 }}
              />
            )}
          </Paper>

          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${PALETTE.inputBorder}`,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: PALETTE.primary, mb: 1 }}>
              Long- Term Goals
            </Typography>
            <TextField
              multiline
              minRows={2}
              fullWidth
              placeholder="Enter long-term goals"
              value={goalTwo}
              onChange={(e) => setGoalTwo(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              variant="text"
              onClick={() => setShowLongComment((s) => !s)}
              sx={{ color: PALETTE.accentPink, fontWeight: 600, px: 0 }}
            >
              {showLongComment ? "Hide Comment" : "Add Comment"}
            </Button>
            {showLongComment && (
              <TextField
                multiline
                minRows={3}
                fullWidth
                placeholder="Long-term goal comment"
                value={longTermComment}
                onChange={(e) => setLongTermComment(e.target.value)}
                sx={{ mt: 1, bgcolor: "#fff", borderRadius: 1 }}
              />
            )}
          </Paper>
        </Box>

        {/* Home care plans */}
        <Box sx={{ maxWidth: 1200, mx: "auto", mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Home Care Plan
            </Typography>
            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddPlan}
              sx={{
                color: PALETTE.accentPink,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Add
            </Button>
          </Box>

          <Stack spacing={2}>
            {homeCarePlans.map((plan, idx) => (
              <Paper
                key={idx}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#F6F9FF",
                  border: `1px solid ${PALETTE.inputBorder}`,
                  position: "relative",
                }}
              >
                {homeCarePlans.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemovePlan(idx)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                )}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                      Title
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter Title"
                      value={plan.title}
                      onChange={(e) =>
                        handleHomeCareChange(idx, "title", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                      Assigned Category
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        label="Category"
                        value={plan.category}
                        onChange={(e) =>
                          handleHomeCareChange(idx, "category", e.target.value)
                        }
                        sx={{ bgcolor: "#fff" }}
                      >
                        {CATEGORY_OPTIONS.map((o) => (
                          <MenuItem key={o.value || "empty"} value={o.value}>
                            {o.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                      Schedule
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g., Daily, Weekly"
                      value={plan.schedule}
                      onChange={(e) =>
                        handleHomeCareChange(idx, "schedule", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                      Instructions
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder="Add Instructions"
                      value={plan.instructions}
                      onChange={(e) =>
                        handleHomeCareChange(
                          idx,
                          "instructions",
                          e.target.value
                        )
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                      Attach Reference
                    </Typography>
                    <Box
                      component="label"
                      htmlFor={`file-input-${idx}`}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: PALETTE.softBlue,
                        p: 1,
                        borderRadius: 1,
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      <AttachmentIcon sx={{ color: PALETTE.primary }} />
                      <Typography
                        sx={{
                          color: PALETTE.primary,
                          fontWeight: 600,
                          flex: 1,
                        }}
                      >
                        {plan.reference?.name || "Attach Reference"}
                      </Typography>
                      <input
                        id={`file-input-${idx}`}
                        type="file"
                        accept="*/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleFilePick(idx, file);
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* General notes */}
        <Box sx={{ maxWidth: 1200, mx: "auto", mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            General Notes
          </Typography>
          <TextField
            multiline
            minRows={3}
            fullWidth
            placeholder="Add any general notes"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            sx={{ bgcolor: "#fff", borderRadius: 1 }}
          />
        </Box>

        {/* Actions */}
        <Box sx={{ maxWidth: 1200, mx: "auto", mb: 6 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Button
                onClick={handleCancel}
                fullWidth
                variant="outlined"
                sx={{
                  py: 1.6,
                  borderRadius: 6,
                  borderColor: "#00000018",
                  bgcolor: "#fff",
                  color: "#000",
                  fontWeight: 700,
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Button
                onClick={handleSubmit}
                fullWidth
                sx={{
                  py: 1.6,
                  borderRadius: 6,
                  fontWeight: 700,
                  bgcolor: "#F2FBF8",
                  color: PALETTE.greenCTA,
                  border: "1px solid #CFEAE0",
                  boxShadow: "0px 6px 12px rgba(26,26,46,0.08)",
                  "&:hover": { bgcolor: "#E6F7F0" },
                }}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} /> : null}
              >
                {submitting ? "Saving..." : "Save"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
