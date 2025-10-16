import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Grid, // ✅ Use Grid2 for `size={{}}` prop support
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SemiBoldText from "../../components/typography/semiBoldText";
import RoundedButton from "../../components/button/roundedButton";
import { FONT_SIZE } from "../../constant/lookUpConstant";
import RegularText from "../../components/typography/regularText";

const BI_REPORT_URL =
  "https://neurosurgery-recommendations.onrender.com/generate-bi-report";

const ReportsPage = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const id = query.get("id");

  const { id: therapistId } = useAuth() || {};

  const [caretaker, setCaretaker] = useState(id || "");
  const [patientList, setPatientList] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // fetch patient / caretaker list
  const fetchCaretaker = async () => {
    setFetchLoading(true);
    try {
      const response = await therapistService.getTherapistPatients();
      if (response?.success && Array.isArray(response.caretakerProfiles)) {
        const caretakers = response.caretakerProfiles.map((c) => ({
          label: c?.basicDetails?.patientName || "Unknown",
          value: c?._id,
        }));
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
      if (!therapistId) {
        window.alert("No therapist id found in storage.");
        return;
      }

      setLoading(true);

      const payload = {
        therapist_id: String(therapistId),
        caretaker_id: String(caretaker),
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
        if (res.status === 404 || /no report/i.test(txt)) {
          window.alert(
            `No BI report for:\nStart: ${startDateISO}\nEnd: ${endDateISO}`
          );
          return;
        }
        throw new Error(`API error (${res.status}): ${txt}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([new Uint8Array(arrayBuffer)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const fileName = `bi_report_${therapistId}_${caretaker}_${startDateISO}_${endDateISO}.pdf`;

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
    if (toDate.isBefore(fromDate, "day")) {
      window.alert("End date cannot be earlier than start date.");
      return;
    }

    const childName = patientList.find((c) => c.value === caretaker)?.label;
    const newRow = {
      childName: childName || "Unknown",
      periodFrom: fromDate.format("YYYY-MM-DD"),
      periodTo: toDate.format("YYYY-MM-DD"),
      status: "Ready to Download",
    };

    setRequests((prev) => [newRow, ...prev]);
  };

  const tableData = useMemo(() => requests, [requests]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <SemiBoldText>Patient Name</SemiBoldText>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Autocomplete
              options={patientList}
              getOptionLabel={(opt) => opt.label || ""}
              value={patientList.find((p) => p.value === caretaker) || null}
              onChange={(_, newVal) => setCaretaker(newVal ? newVal.value : "")}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              sx={{
                fontFamily: "regular",
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Patient"
                  variant="outlined"
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
            <SemiBoldText>Select Period</SemiBoldText>
          </Grid>

          <Grid size={{ xs: 6, md: 4 }}>
            <DatePicker
              value={fromDate}
              onChange={(v) => setFromDate(v)}
              format="DD MM, YYYY"
              sx={{
                width: "100%",
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 5 }}>
            <DatePicker
              value={toDate}
              onChange={(v) => setToDate(v)}
              format="DD MM, YYYY"
              sx={{
                width: "100%",
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <RoundedButton
                  onClick={handleRequestReport}
                  disabled={loading}
                  sx={{
                    width: { xs: "100%", sm: "15em" },
                  }}
                  startIcon={loading ? <CircularProgress size={18} /> : null}
                >
                  {loading ? "Requesting..." : "Request Report"}
                </RoundedButton>
              </Box>
              <SemiBoldText>View Requested Download</SemiBoldText>
            </Box>
          </Grid>
        </Grid>

        {/* Table */}
        <Box sx={{ mt: 3 }}>
          <TableContainer
            sx={{
              border: "1px solid #000",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      fontFamily: "semibold",
                      color: "#000",
                      fontSize: FONT_SIZE.TITLE,
                    }}
                  >
                    Child Name
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontFamily: "semibold",
                      color: "#000",
                      fontSize: FONT_SIZE.TITLE,
                    }}
                  >
                    Period
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontFamily: "semibold",
                      color: "#000",
                      fontSize: FONT_SIZE.TITLE,
                    }}
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
                      sx={{
                        py: 4,
                        fontFamily: "regular",
                        color: "#000",
                        fontSize: FONT_SIZE.BODY,
                      }}
                    >
                      No reports requested yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((item, idx) => {
                    const startISO = item.periodFrom;
                    const endISO = item.periodTo;
                    return (
                      <TableRow key={idx}>
                        <TableCell
                          align="center"
                          sx={{
                            fontFamily: "regular",
                            color: "#000",
                            fontSize: FONT_SIZE.BODY,
                          }}
                        >
                          {item.childName}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontFamily: "regular",
                            color: "#000",
                            fontSize: FONT_SIZE.BODY,
                          }}
                        >
                          {moment(startISO).format("DD-MM-YYYY")} <br /> to{" "}
                          <br /> {moment(endISO).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontFamily: "regular",
                            color: "#000",
                            fontSize: FONT_SIZE.BODY,
                          }}
                        >
                          <RegularText>{item.status}</RegularText>
                          <RoundedButton
                            startIcon={<DownloadIcon />}
                            onClick={() =>
                              downloadBiReportPdf(startISO, endISO)
                            }
                            disabled={loading}
                          >
                            {loading ? "Please wait..." : "Download BI Report"}
                          </RoundedButton>
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
    </LocalizationProvider>
  );
};

export default ReportsPage;
