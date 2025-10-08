// SuggestionsListPage.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
  Box,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Skeleton,
  CircularProgress,
  Modal,
  Fade,
  Backdrop,
  Button,
  useMediaQuery,
  Alert,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import suggestionService from "../../services/suggestions";
import renderFormattedText from "../../components/aiResponse";

const PAGE_SIZE = 10;

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const formatToDateAndTime = (date) =>
  date ? dayjs(date).format("MMM D, YYYY • h:mm A") : "N/A";

export default function SuggestionsListPage() {
  const [activeTab, setActiveTab] = useState("daily"); // "daily" | "specific"
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [suggestions, setSuggestions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [openCommentForId, setOpenCommentForId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [showFeedbackForId, setShowFeedbackForId] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const sentinelRef = useRef(null);
  const isSmall = useMediaQuery("(max-width:600px)");

  const queryKey = useMemo(
    () => `${activeTab}_${selectedDate.format("YYYY-MM-DD")}`,
    [activeTab, selectedDate]
  );

  const resetList = useCallback(() => {
    setSuggestions([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
    });
  }, []);

  const fetchPage = useCallback(
    async (page, opts = {}) => {
      try {
        setError(null);
        if (page === 1 && !opts.append) setLoading(true);
        else setLoadingMore(true);

        const response = await suggestionService.getAllAiSuggestion(
          page,
          PAGE_SIZE,
          activeTab,
          selectedDate.toDate()
        );

        if (response?.success) {
          const incoming = response.suggestions || [];
          setSuggestions((prev) =>
            page === 1 && !opts.append ? incoming : [...prev, ...incoming]
          );
          setPagination(response.pagination || {});
        }
      } catch (e) {
        setError(e?.message || "Failed to load suggestions");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab, selectedDate]
  );

  useEffect(() => {
    resetList();
    fetchPage(1);
  }, [queryKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
          fetchPage((pagination.currentPage || 1) + 1, { append: true });
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [pagination, loadingMore, loading, fetchPage]);

  const handleTabChange = (_, value) => {
    setActiveTab(value);
  };

  const handleOpenDetail = (item) => {
    setDetailData(item);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailData(null);
  };

  const handleToggleCommentBox = (id) => {
    setOpenCommentForId((prev) => (prev === id ? null : id));
  };

  const handleToggleFeedback = (id) => {
    setShowFeedbackForId((prev) => (prev === id ? null : id));
  };

  const handleAddFeedback = async (id) => {
    const text = (commentDrafts[id] || "").trim();
    if (!text) return;

    setOpenCommentForId(null);
    setSuggestions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, feedback: text } : s))
    );
    setShowFeedbackForId(id);

    try {
      await suggestionService.addFeedback(id, text);
      setCommentDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      // optionally revert and show toast
    }
  };

  const renderSkeleton = () => (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {[...Array(4)].map((_, i) => (
        <Card
          key={`sk-${i}`}
          elevation={0}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <CardHeader
            title={<Skeleton variant="text" width="40%" />}
            subheader={<Skeleton variant="text" width="25%" />}
          />
          <CardContent>
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="70%" />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          boxShadow: "none",
          borderRadius: 2,
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Typography>AI Suggestions</Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          pt: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          allowScrollButtonsMobile
          aria-label="suggestion type tabs"
          sx={{ px: 2 }}
        >
          <Tab value="daily" label="Daily Suggestions" />
          <Tab value="specific" label="Specific Suggestions" />
        </Tabs>
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          <DatePicker
            value={selectedDate}
            onChange={(v) => v && setSelectedDate(v)}
            format="MMM D, YYYY"
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 170, bgcolor: "background.paper" },
              },
            }}
          />
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && suggestions.length === 0 && (
          <Card
            variant="outlined"
            sx={{ p: 3, textAlign: "center", borderRadius: 2 }}
          >
            <Typography variant="h6" fontWeight={700}>
              No suggestions found
            </Typography>
            <Typography color="text.secondary">
              Try switching tabs or check back later
            </Typography>
          </Card>
        )}

        {loading && renderSkeleton()}

        {!loading &&
          suggestions.map((item) => {
            const child = item.childProfile || {};
            const genderShort = child.gender?.charAt(0)?.toUpperCase();
            const commentOpen = openCommentForId === item._id;
            const feedbackOpen = showFeedbackForId === item._id;

            return (
              <Card
                key={item._id}
                variant="outlined"
                elevation={0}
                sx={{
                  borderRadius: 2,
                  mb: 2,
                  "&:hover": { boxShadow: 2, borderColor: "transparent" },
                  transition: "box-shadow 120ms ease, border-color 120ms ease",
                }}
              >
                <CardHeader
                  titleTypographyProps={{
                    variant: "subtitle1",
                    fontWeight: 600,
                  }}
                  title={child.name || "Unknown Child"}
                  action={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography>
                        {child.age && child.gender
                          ? `${child.age} yr / ${genderShort}`
                          : undefined}
                      </Typography>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDetail(item)}
                        aria-label="open suggestion"
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    </Box>
                  }
                />

                <CardContent sx={{ pt: 0 }}>
                  {child.therapyType && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Therapy Type
                      </Typography>
                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1.25,
                          borderRadius: 1.5,
                          bgcolor: "success.50",
                          border: "1px solid",
                          borderColor: "success.100",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="success.dark"
                          >
                            {child.therapyType}
                          </Typography>
                          <Chip
                            size="small"
                            label={`#${
                              item.suggestionType || "Specific"
                            } Suggestion`}
                            color="success"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    </Box>
                  )}

                  <Box>{renderFormattedText(item.content)}</Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={1}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", fontWeight: 700 }}
                    >
                      This suggestion is purely based out of AI
                    </Typography>
                    <Stack direction="row" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleFeedback(item._id)}
                        aria-label="toggle feedback"
                      >
                        <ChatBubbleOutlineIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleOpenDetail(item)}
                        aria-label="open metadata"
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>

                  {!commentOpen && (
                    <Button
                      variant="text"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => handleToggleCommentBox(item._id)}
                    >
                      Add Comment
                    </Button>
                  )}

                  {commentOpen && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={1}
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
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handleAddFeedback(item._id)}
                                edge="end"
                                aria-label="send comment"
                              >
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Stack>
                  )}
                </CardContent>

                {feedbackOpen && (
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "teal.50",
                        border: "1px solid",
                        borderColor: "teal.100",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="teal.900"
                        fontWeight={800}
                        gutterBottom
                      >
                        Comments
                      </Typography>
                      <Typography
                        variant="body2"
                        color="teal.900"
                        fontWeight={500}
                      >
                        {item.feedback ? item.feedback : "No Feedbacks"}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Card>
            );
          })}

        <Box ref={sentinelRef} sx={{ height: 1 }} />

        {loadingMore && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="caption" sx={{ mt: 1 }}>
              Loading more…
            </Typography>
          </Stack>
        )}
      </Container>

      <Modal
        open={detailOpen}
        onClose={handleCloseDetail}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 200 } }}
        aria-labelledby="suggestion-detail-title"
      >
        <Fade in={detailOpen}>
          <Box
            role="dialog"
            aria-modal="true"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isSmall ? "90%" : 520,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 6,
              p: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography
                id="suggestion-detail-title"
                variant="h6"
                fontWeight={700}
              >
                Suggestion Details
              </Typography>
              <Button onClick={handleCloseDetail} size="small" color="inherit">
                ✕
              </Button>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Suggestion Type
              </Typography>
              <Typography variant="body2">
                {capitalize(detailData?.suggestionType || "Specific")}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Generated At
              </Typography>
              <Typography variant="body2">
                {formatToDateAndTime(
                  detailData?.generatedAt || detailData?.createdAt
                )}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Sent for Review On
              </Typography>
              <Typography variant="body2">
                {formatToDateAndTime(detailData?.sentAt) || "N/A"}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body2">
                {detailData?.status
                  ? `${capitalize(detailData?.status)} on ${formatToDateAndTime(
                      detailData?.updateStatusAt
                    )}`
                  : "N/A"}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Feedback On
              </Typography>
              <Typography variant="body2">
                {detailData?.feedback
                  ? `${formatToDateAndTime(detailData?.feedbackAt)}`
                  : "N/A"}
              </Typography>
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </LocalizationProvider>
  );
}
