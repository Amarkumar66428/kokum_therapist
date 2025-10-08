import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import moment from "moment";
import therapistService from "../../services/therapistService";
import useAuth from "../../hooks/useAuth";
import { useLocation } from "react-router-dom";

const BI_REPORT_URL =
  "https://neurosurgery-recommendations.onrender.com/generate-bi-report";

const ReportsPage = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const id = query.get("id");

  const [caretaker, setCaretaker] = useState(id || "");
  const [patientList, setPatientList] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // fetch patient / caretaker list
  const fetchCaretaker = async () => {
    setFetchLoading(true);
    try {
      const response = await therapistService.getTherapistPatients();
      if (response?.success && Array.isArray(response.caretakerProfiles)) {
        const caretakers = response.caretakerProfiles
          .map((c) => ({
            label: c?.basicDetails?.patientName || "Unknown",
            value: c?._id,
          }))
          .filter(Boolean);
        setPatientList(caretakers);
      } else {
        setPatientList([]);
      }
    } catch (err) {
      console.error("Error fetching caretakers:", err);
      setPatientList([]);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchCaretaker();
  }, []);

  const downloadBiReportPdf = async (startDateISO, endDateISO) => {
    try {
      if (!caretaker) {
        window.alert("Please choose a patient / caretaker");
        return;
      }

      const therapistId = useAuth()?.id;
      const caretakerId = caretaker;

      if (!therapistId) {
        window.alert("No therapist id found in storage.");
        return;
      }

      setLoading(true);

      const payload = {
        therapist_id: String(therapistId),
        caretaker_id: String(caretakerId),
        start_date: startDateISO,
        end_date: endDateISO,
      };

      const res = await fetch(BI_REPORT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("BI report API error:", res.status, txt);
        if (res.status === 404 || /no report/i.test(txt)) {
          window.alert(
            `No BI report for:\nStart: ${startDateISO}\nEnd: ${endDateISO}`
          );
          return;
        }
        throw new Error(
          `API error (${res.status}): ${txt || "Failed to generate BI report"}`
        );
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/pdf")) {
        const preview = await res
          .clone()
          .text()
          .catch(() => "");
        console.warn("BI report: unexpected content-type:", ct, preview);
        window.alert(preview || "Server did not return a PDF.");
        return;
      }

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([new Uint8Array(arrayBuffer)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const fileName = `bi_report_${therapistId}_${caretakerId}_${startDateISO}_${endDateISO}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      window.alert(`Downloaded: ${fileName}`);
    } catch (err) {
      console.error("BI Download failed:", err);
      window.alert(err.message || "Could not download the BI report.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReport = () => {
    if (!fromDate || !toDate) {
      window.alert("Please pick both From and To dates.");
      return;
    }
    if (moment(toDate).isBefore(moment(fromDate), "day")) {
      window.alert("End date cannot be earlier than start date.");
      return;
    }

    const childName = patientList.find((c) => c.value === caretaker)?.label;
    const newRow = {
      childName: childName || "Unknown",
      periodFrom: moment(fromDate).format("YYYY-MM-DD"),
      periodTo: moment(toDate).format("YYYY-MM-DD"),
      status: "Ready to Download",
    };

    setRequests((prev) => [newRow, ...prev]);
  };

  const tableData = useMemo(() => requests, [requests]);

  return (
    <Box>
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
          <Typography>Reports</Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography fontSize={16} color="#333" sx={{ minWidth: 90 }}>
              Patient Name
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Autocomplete
              options={patientList}
              getOptionLabel={(opt) => opt.label || ""}
              value={patientList.find((p) => p.value === caretaker) || null}
              onChange={(_, newVal) => setCaretaker(newVal ? newVal.value : "")}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Patient"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: fetchLoading ? (
                      <CircularProgress size={16} />
                    ) : null,
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography fontSize={16} color="#333">
              Select Period
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 4 }}>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              size="small"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              sx={{
                borderRadius: 1,
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 5 }}>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              size="small"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              sx={{
                borderRadius: 1,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                mt: 2,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  onClick={handleRequestReport}
                  disabled={loading}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 700,
                    color: "#002F8D",
                    background:
                      "linear-gradient(90deg, #EFF9FD 0%, #FAF0F6 50%, #F3FAF7 100%)",
                    boxShadow: 2,
                    "&:hover": {
                      opacity: 0.95,
                    },
                  }}
                  startIcon={loading ? <CircularProgress size={18} /> : null}
                >
                  {loading ? "Requesting..." : "Request Report"}
                </Button>
              </Box>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#002F8D",
                  textAlign: "start",
                }}
              >
                View Requested Download
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Table */}
        <Box sx={{ mt: 3 }}>
          <TableContainer
            component={Paper}
            sx={{
              border: "1px solid #002F8D",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#fff" }}>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "#002F8D",
                      borderRight: "1px solid #002F8D",
                    }}
                  >
                    Child Name
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "#002F8D",
                      borderRight: "1px solid #002F8D",
                    }}
                  >
                    Period
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "#002F8D" }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{ py: 4, color: "#666" }}
                    >
                      No reports requested yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((item, idx) => {
                    const startISO = moment(item.periodFrom).format(
                      "YYYY-MM-DD"
                    );
                    const endISO = moment(item.periodTo).format("YYYY-MM-DD");
                    return (
                      <TableRow key={idx}>
                        <TableCell
                          align="center"
                          sx={{ borderRight: "1px solid #002F8D" }}
                        >
                          {item.childName}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ borderRight: "1px solid #002F8D" }}
                        >
                          {moment(item.periodFrom).format("DD-MM-YYYY")}
                          <br />
                          to
                          <br />
                          {moment(item.periodTo).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ mb: 1, fontSize: 13 }}>
                            {item.status}
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() =>
                              downloadBiReportPdf(startISO, endISO)
                            }
                            disabled={loading}
                            sx={{
                              borderRadius: 1,
                              textTransform: "none",
                              px: 1.5,
                              py: 0.6,
                              background:
                                "linear-gradient(90deg, #EFF9FD 0%, #FAF0F6 50%, #F3FAF7 100%)",
                              borderColor: "#E6EEF9",
                              color: "#002F8D",
                              fontWeight: 600,
                            }}
                          >
                            {loading ? "Please wait..." : "Download BI Report"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ReportsPage;
