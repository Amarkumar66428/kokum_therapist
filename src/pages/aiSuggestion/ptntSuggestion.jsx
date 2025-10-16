// pages/AISuggestionsListPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Stack,
  Tabs,
  Tab,
  IconButton,
  Badge,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Modal,
  Fade,
  Backdrop,
  Popover,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import FilterListIcon from "@mui/icons-material/FilterList";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  LocalizationProvider,
  DatePicker,
  PickersDay,
} from "@mui/x-date-pickers";

import usePatient from "../../hooks/usePatient";
import suggestionService from "../../services/suggestions";
import ChildDetailCard from "../../components/childDetailCard";
import renderFormattedText from "../../components/aiResponse";
import { FilterAltOutlined } from "@mui/icons-material";
import SuggestionDetails from "../../components/suggestionDetails";

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const formatToDateAndTime = (d) =>
  d ? dayjs(d).format("MMM D, YYYY • h:mm A") : "N/A";

export default function AISuggestionsListPage() {
  const { patient } = usePatient();

  const caretakerId = patient?.caretakerId;

  const [showFeedBack, setShowFeedBack] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [filter, setFilter] = useState("");
  const [filterAnchor, setFilterAnchor] = useState(null);

  const [suggestionDetails, setSuggestionDetails] = useState({
    open: false,
    data: null,
  });

  const [suggestions, setSuggestions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusLoading, setStatusLoading] = useState({
    id: null,
    type: null,
    loading: false,
  });

  const sentinelRef = useRef(null);

  // Fetch
  const fetchSuggestions = useCallback(
    async (page = 1, dateVal = selectedDate, filter = filter) => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const serviceMethod =
          activeTab === "daily"
            ? suggestionService.getDailyPatientAiSuggestion
            : suggestionService.getSpecificAiSuggestion;

        const res = await serviceMethod(
          caretakerId,
          dateVal.toDate(),
          10,
          page,
          filter
        );
        if (res?.success) {
          const incoming = res.data || [];
          setSuggestions((prev) =>
            page === 1 ? incoming : [...prev, ...incoming]
          );
          setPagination(res.pagination || {});
          setCurrentPage(page);
        }
      } catch (e) {
        console.log("e: ", e);
        // handle/log
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab, caretakerId, selectedDate, filter]
  );

  useEffect(() => {
    fetchSuggestions(1, selectedDate, filter);
  }, [activeTab]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          pagination.hasNextPage &&
          !loadingMore &&
          !loading
        ) {
          fetchSuggestions(currentPage + 1);
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [pagination, loadingMore, loading, currentPage, fetchSuggestions]);

  const handleTabChange = (_, val) => {
    setActiveTab(val);
    setCurrentPage(1);
    setSuggestions([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
    });
  };

  const handleSelectDate = (v) => {
    if (!v) return;
    setSelectedDate(v);
    fetchSuggestions(1, v, filter);
  };

  const handleFilterClick = (e) => setFilterAnchor(e.currentTarget);
  const handleFilterClose = () => setFilterAnchor(null);
  const handleSelectFilter = async (val) => {
    setFilter(val);
    await fetchSuggestions(1, selectedDate, val);
    setFilterAnchor(null);
  };

  const toggleComment = (id) =>
    setShowFeedBack((prev) => (prev === id ? null : id));

  const addFeedback = async (suggestionId) => {
    setSuggestions((prev) =>
      prev.map((item) =>
        item._id === suggestionId
          ? { ...item, feedback: commentDrafts[suggestionId] }
          : item
      )
    );
    setShowFeedBack(suggestionId);
    try {
      await suggestionService.addFeedback(
        suggestionId,
        commentDrafts[suggestionId],
        activeTab
      );
      setCommentDrafts((prev) => {
        const n = { ...prev };
        delete n[suggestionId];
        return n;
      });
    } catch {
      // optionally revert/toast
    }
  };

  const updateStatusSuggestion = async (suggestionId, status) => {
    setStatusLoading({ id: suggestionId, type: status, loading: true });
    try {
      const res = await suggestionService.approveSuggestion(
        suggestionId,
        status,
        activeTab
      );
      if (res?.success) {
        setSuggestions((prev) =>
          prev.map((it) => (it._id === suggestionId ? { ...it, status } : it))
        );
      }
    } finally {
      setStatusLoading({ id: null, type: null, loading: false });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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

      <Box sx={{ pb: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, borderBottom: "1px solid #e0e0e0" }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: 16,
                color: "#7d7d7e",
              },
              "& .Mui-selected": {
                color: "#0A0A0A",
              },
            }}
          >
            <Tab value="daily" label="Daily Suggestions" />
            <Tab value="specific" label="Specific Suggestions" />
          </Tabs>

          <Stack direction="row" alignItems="center" spacing={2}>
            <DatePicker
              value={selectedDate}
              onChange={(v) => v && handleSelectDate(v)}
              format="D MM, YYYY"
              sx={{
                fontSize: 12,
                "& .MuiPickersInputBase-sectionsContainer": {
                  padding: 1.5,
                },
              }}
            />

            <IconButton
              onClick={handleFilterClick}
              sx={{ position: "relative" }}
            >
              <FilterAltOutlined sx={{ color: "#ff5a82" }} />
              {filter && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -3,
                    right: -3,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "red",
                  }}
                />
              )}
            </IconButton>

            <Popover
              open={Boolean(filterAnchor)}
              anchorEl={filterAnchor}
              onClose={handleFilterClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{ sx: { width: 200, borderRadius: 2 } }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderBottom: "1px solid #ccc",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{ fontSize: 14, fontWeight: 600, color: "#333", my: 1 }}
                >
                  Filter
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    if (filter) handleSelectFilter("");
                    else handleFilterClose();
                  }}
                  sx={{ textTransform: "none" }}
                >
                  {filter ? "Clear" : "Close"}
                </Button>
              </Box>
              <Stack sx={{ py: 0.5 }}>
                {[
                  { id: "approved", name: "Approved" },
                  { id: "unapproved", name: "Unapproved" },
                ].map((it) => (
                  <Button
                    key={it.id}
                    onClick={() => handleSelectFilter(it.id)}
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: 0,
                      textTransform: "none",
                      bgcolor: filter === it.id ? "#c9c9c9" : "transparent",
                      color: "#333",
                      "&:hover": { bgcolor: "#e9e9e9" },
                      px: 2,
                    }}
                  >
                    {it.name}
                  </Button>
                ))}
              </Stack>
            </Popover>
          </Stack>
        </Stack>
      </Box>

      {/* List */}
      <Container maxWidth="md" sx={{ px: 2, pb: 20 }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 1, color: "#022E8A", fontSize: 16 }}>
              Loading suggestions...
            </Typography>
          </Stack>
        ) : suggestions.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ fontWeight: 700, color: "#0A0A0A", mb: 0.5 }}>
              No suggestions found
            </Typography>
            <Typography sx={{ color: "#667085" }}>
              Try switching tabs or check back later
            </Typography>
          </Box>
        ) : (
          suggestions.map((item) => {
            const feedbackOpen = showFeedBack === item._id;
            const isPending = item.status === "pending";
            const isApproveLoading =
              statusLoading.id === item._id &&
              statusLoading.type === "approved" &&
              statusLoading.loading;
            const isRejectLoading =
              statusLoading.id === item._id &&
              statusLoading.type === "rejected" &&
              statusLoading.loading;

            return (
              <Box key={item._id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    p: 1.25,
                    mt: 1.5,
                    borderColor: "#fff",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    {item?.requestMessage?.content && (
                      <Box
                        sx={{
                          borderColor: "#022E8A",
                          borderWidth: 1,
                          borderStyle: "solid",
                          p: 1.25,
                          borderRadius: 1.25,
                          bgcolor: "#E6ECF8",
                          mb: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#022E8A",
                            fontWeight: 700,
                            mb: 0.5,
                          }}
                        >
                          Users Request
                        </Typography>
                        <Box>
                          {renderFormattedText(item?.requestMessage?.content)}
                        </Box>
                      </Box>
                    )}

                    <Box>{renderFormattedText(item.content)}</Box>

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mt: 1 }}
                    >
                      <Typography
                        sx={{
                          color: "#ff5a82",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        This suggestion is purely based out of AI
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => toggleComment(item._id)}
                        >
                          <ChatBubbleOutlineIcon
                            fontSize="small"
                            sx={{ color: "#022E8A" }}
                          />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setSuggestionDetails({ data: item, open: true })
                          }
                        >
                          <InfoOutlinedIcon
                            fontSize="small"
                            sx={{ color: "#ff5a82" }}
                          />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mt: 1.5,
                      }}
                    >
                      {isPending ? (
                        <Stack direction="row" spacing={1.25} width="100%">
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() =>
                              item.status !== "rejected" &&
                              updateStatusSuggestion(item._id, "rejected")
                            }
                            sx={{
                              borderRadius: 22,
                              borderColor: "#ff5a8325",
                              bgcolor: "#ff5a8317",
                              color: "#ff5a82",
                              fontWeight: 700,
                              textTransform: "none",
                              py: 1,
                              "&:hover": {
                                bgcolor: "#ffd1dc4d",
                                borderColor: "#ff5a83",
                              },
                            }}
                          >
                            {isRejectLoading ? (
                              <CircularProgress
                                size={16}
                                sx={{ color: "#ff5a82" }}
                              />
                            ) : (
                              "Reject Suggestion"
                            )}
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() =>
                              item.status !== "approved" &&
                              updateStatusSuggestion(item._id, "approved")
                            }
                            sx={{
                              borderRadius: 22,
                              borderColor: "#CFEAE0",
                              bgcolor: "#F2FBF8",
                              color: "#0B726E",
                              fontWeight: 700,
                              textTransform: "none",
                              py: 1,
                              "&:hover": {
                                bgcolor: "#EAF7F2",
                                borderColor: "#9fd8c5",
                              },
                            }}
                          >
                            {isApproveLoading ? (
                              <CircularProgress
                                size={16}
                                sx={{ color: "#0B726E" }}
                              />
                            ) : (
                              "Approve Suggestion"
                            )}
                          </Button>
                        </Stack>
                      ) : (
                        <Box
                          sx={{
                            px: 1.5,
                            py: 1,
                            borderRadius: 22,
                            border: "1px solid",
                            borderColor:
                              item.status === "approved"
                                ? "#CFEAE0"
                                : "#ff5a8325",
                            bgcolor:
                              item.status === "approved"
                                ? "#F2FBF8"
                                : "#ff5a8317",
                            color:
                              item.status === "approved"
                                ? "#0B726E"
                                : "#ff5a82",
                            fontWeight: 700,
                            textAlign: "center",
                            minWidth: 160,
                          }}
                        >
                          {capitalize(item.status)}
                        </Box>
                      )}
                    </Box>

                    {feedbackOpen && (
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mt: 1 }}
                      >
                        <TextField
                          value={commentDrafts[item._id] ?? ""}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [item._id]: e.target.value,
                            }))
                          }
                          size="small"
                          placeholder="Add Comment"
                          fullWidth
                          sx={{
                            borderRadius: "22px",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "22px",
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => addFeedback(item._id)}
                                >
                                  <SendIcon
                                    fontSize="small"
                                    sx={{ color: "#0A0A0A" }}
                                  />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Stack>
                    )}
                  </CardContent>
                </Card>

                {feedbackOpen && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.75,
                      bgcolor: "#F5FDFA",
                      border: "1px solid #F5FDFA",
                      borderRadius: 2.25,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#0B726E",
                        fontWeight: 800,
                        mb: 1,
                      }}
                    >
                      Comments
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12, color: "#0B726E", fontWeight: 500 }}
                    >
                      {item?.feedback ? item.feedback : "No Feedbacks"}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })
        )}

        {/* Infinite scroll sentinel */}
        <Box ref={sentinelRef} sx={{ height: 1 }} />

        {loadingMore && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 2 }}>
            <CircularProgress size={20} />
            <Typography sx={{ mt: 1, color: "#022E8A", fontSize: 14 }}>
              Loading more...
            </Typography>
          </Stack>
        )}
      </Container>
      <SuggestionDetails
        data={suggestionDetails.data}
        open={suggestionDetails.open}
        close={() => setSuggestionDetails({ data: null, open: false })}
      />
    </LocalizationProvider>
  );
}
