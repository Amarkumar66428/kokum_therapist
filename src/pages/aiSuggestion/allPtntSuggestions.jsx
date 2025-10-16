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
import SemiBoldText from "../../components/typography/semiBoldText";
import RegularText from "../../components/typography/regularText";
import { FONT_SIZE } from "../../constant/lookUpConstant";
import SuggestionDetails from "../../components/suggestionDetails";
import NormalInput from "../../components/input/normalInput";

const PAGE_SIZE = 10;

export default function SuggestionsListPage() {
  const [activeTab, setActiveTab] = useState("daily"); // "daily" | "specific"
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [commentDrafts, setCommentDrafts] = useState({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const sentinelRef = useRef(null);

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

  const handleAddFeedback = async (id) => {
    const text = (commentDrafts[id] || "").trim();
    if (!text) return;

    setSuggestions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, feedback: text } : s))
    );

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
        elevation={0}
        sx={{
          backgroundColor: "background.default",
          boxShadow: "none",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: "1px solid #e0e0e0",
              "& .MuiTab-root": {
                textTransform: "none",
                fontFamily: "regular",
              },
              "& .Mui-selected": { fontFamily: "semibold" },
            }}
          >
            <Tab value="daily" label="Daily Suggestions" />
            <Tab value="specific" label="Specific Suggestions" />
          </Tabs>
          <Box
            sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}
          >
            <DatePicker
              value={selectedDate}
              onChange={(v) => v && setSelectedDate(v)}
              format="MMM D, YYYY"
              sx={{
                fontSize: 12,
                "& .MuiPickersInputBase-sectionsContainer": {
                  padding: 1.5,
                },
              }}
            />
          </Box>
        </Box>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontFamily: "regular" }}>
            {error}
          </Alert>
        )}

        {!loading && suggestions.length === 0 && (
          <Card
            variant="outlined"
            sx={{ p: 3, textAlign: "center", borderRadius: 2 }}
          >
            <SemiBoldText>No suggestions found</SemiBoldText>
            <RegularText>Try switching tabs or check back later</RegularText>
          </Card>
        )}

        {loading && renderSkeleton()}

        {!loading &&
          suggestions.map((item) => {
            const child = item.childProfile || {};
            const genderShort = child.gender?.charAt(0)?.toUpperCase();

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
                    fontFamily: "semibold",
                    fontSize: FONT_SIZE.TITLE,
                  }}
                  title={child.name || "Unknown Child"}
                  action={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <SemiBoldText sx={{ fontSize: FONT_SIZE.BODY }}>
                        {child.age && child.gender
                          ? `${child.age} yr / ${genderShort}`
                          : undefined}
                      </SemiBoldText>
                      <IconButton
                        onClick={() => handleOpenDetail(item)}
                        aria-label="open suggestion"
                      >
                        <ChevronRightIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                />

                <CardContent sx={{ pt: 0 }}>
                  {child.therapyType && (
                    <Box sx={{ mb: 1.5 }}>
                      <SemiBoldText>Therapy Type</SemiBoldText>
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
                          <RegularText color="success.dark">
                            {child.therapyType}
                          </RegularText>
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
                    <RegularText color="secondary.error">
                      This suggestion is purely based out of AI
                    </RegularText>
                    <Stack direction="row" gap={1}>
                      <IconButton
                        onClick={() => handleOpenDetail(item)}
                        aria-label="open metadata"
                        sx={{ color: "primary.icon" }}
                      >
                        <InfoOutlinedIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={1}
                    sx={{ mt: 1 }}
                  >
                    <NormalInput
                      value={commentDrafts[item._id] ?? ""}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [item._id]: e.target.value,
                        }))
                      }
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
                  <Box
                    sx={{
                      mt: 1,
                    }}
                  >
                    <SemiBoldText>Comments</SemiBoldText>
                    <RegularText>
                      {item.feedback ? item.feedback : "No Feedbacks"}
                    </RegularText>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

        <Box ref={sentinelRef} sx={{ height: 1 }} />

        {loadingMore && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 2 }}>
            <CircularProgress size={20} />
            <RegularText sx={{ mt: 1 }}>Loading more…</RegularText>
          </Stack>
        )}
        <SuggestionDetails
          open={detailOpen}
          close={handleCloseDetail}
          data={detailData}
        />
      </Container>
    </LocalizationProvider>
  );
}
