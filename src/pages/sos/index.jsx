// pages/SosPatients.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  Divider,
  IconButton,
  Paper,
  TextField,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  Popover,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { createSosSocket } from "../../utils/socket";
import useAuth from "../../hooks/useAuth";
import sosChatService from "../../services/sosChatService";
import { FilterAltOutlined } from "@mui/icons-material";

const COLORS = {
  pageBg: "#f7f9fc",
  headerBg: "#f6f7fb",
  headerBorder: "#ecf1fb",
  cardBg: "#fff",
  avatarBg: "#e6f0ff",
  avatarText: "#2d4fc1",
  name: "#1e1e2d",
  sub: "#6a6a7b",
  subLight: "#9090a0",
  bubbleMe: "#deeaff",
  bubbleOther: "#fff",
  bubbleOtherBorder: "rgba(0,0,0,0.08)",
  chipDateBg: "rgba(0,0,0,0.05)",
  unreadBadge: "#0078d4",
  sendBg: "#deeaff",
  inputBorder: "rgba(0,0,0,0.08)",
};
const RADIUS = { card: 14, bubble: 12, input: 24 };

const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
const formatDateSeparator = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  const isYesterday =
    d.getDate() === yest.getDate() &&
    d.getMonth() === yest.getMonth() &&
    d.getFullYear() === yest.getFullYear();
  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
const showMessageTime = (ts) => {
  if (!ts) return "";
  const date = new Date(ts),
    now = new Date();
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "long" });
  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) return timeFmt.format(date);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);
  const dayDiff = (startOfDate - startOfToday) / (1000 * 60 * 60 * 24);
  if (dayDiff >= -now.getDay() && dayDiff <= 6 - now.getDay())
    return dayFmt.format(date);
  return dateFmt.format(date);
};
const isSameDay = (a, b) => {
  const d1 = new Date(a),
    d2 = new Date(b);
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

const socket = createSosSocket();

function normalizeMsg(data) {
  return {
    _id: data?._id || `${Date.now()}_${Math.random()}`,
    content: data?.content ?? data?.message ?? "",
    userId: String(data?.senderId || data?.userId || ""),
    createdAt: data?.createdAt || new Date().toISOString(),
    status: data?.status || "sent",
  };
}

export default function SosPatients() {
  const therapist = useAuth();
  const selfId = therapist?.id;

  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [loading, setLoading] = useState(false);

  // chat store: keyed by roomId
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const fetchCaretakers = useCallback(async () => {
    setLoading(true);
    try {
      setFilter("");
      const data = await sosChatService.getPatients();
      const list = Array.isArray(data) ? data : data?.users || [];
      setUsers(list);
      setFilteredUsers(list);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("Failed to load caretakers", err);
      setToast({
        open: true,
        msg: "Failed to load caretakers",
        severity: "error",
      });
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaretakers();
  }, [fetchCaretakers]);

  const handleSelectFilter = (id) => {
    setFilter(id);
    if (id === "read")
      setFilteredUsers(users.filter((u) => (u.unreadMessages || 0) === 0));
    else if (id === "unread")
      setFilteredUsers(users.filter((u) => (u.unreadMessages || 0) > 0));
    else setFilteredUsers(users);
    setMenuVisible(false);
  };

  const selectUser = useCallback(
    (u) => {
      setSelectedUser(u);
      if (!u?.roomId) return;
      socket.joinRoom({ roomId: u.roomId, userId: selfId });
      (async () => {
        try {
          const chatHistory = await sosChatService.getChatHistory(u.roomId, 1);
          if (chatHistory?.success) {
            const normalized = (chatHistory.chats || []).map(normalizeMsg);
            setMessages((prev) => ({ ...prev, [u.roomId]: normalized }));
            socket.markMessageRead({ roomId: u.roomId, userId: selfId });
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log("history error", e);
        }
      })();
    },
    [selfId]
  );

  useEffect(
    () => () => {
      if (selectedUser?.roomId)
        socket.leaveRoom({ roomId: selectedUser.roomId, userId: selfId });
    },
    []
  ); // unmount

  // Socket listeners
  useEffect(() => {
    const handleIncoming = (data) => {
      const msg = normalizeMsg(data);
      const rid = data?.roomId;
      if (!rid) return;
      setMessages((prev) => ({ ...prev, [rid]: [...(prev[rid] || []), msg] }));
    };
    const handleReadAck = () => {
      const rid = selectedUser?.roomId;
      if (!rid) return;
      setMessages((prev) => ({
        ...prev,
        [rid]: (prev[rid] || []).map((m) =>
          m.status === "sent" ? { ...m, status: "read" } : m
        ),
      }));
    };
    socket.on("receiveMessage", handleIncoming);
    socket.on("messageReadAck", handleReadAck);
    return () => {
      socket.off("receiveMessage", handleIncoming);
      socket.off("messageReadAck", handleReadAck);
    };
  }, [selectedUser?.roomId]);

  const send = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !selectedUser?.roomId) return;
    socket.sendMessage({
      roomId: selectedUser.roomId,
      userId: selfId,
      content: trimmed,
    });
    setInput("");
  }, [input, selectedUser?.roomId, selfId]);

  const currentMsgs = useMemo(
    () => (selectedUser?.roomId ? messages[selectedUser.roomId] || [] : []),
    [messages, selectedUser?.roomId]
  );

  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: COLORS.pageBg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Grid container>
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            borderRight: "1px solid #ddd",
            bgcolor: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              Patients
            </Typography>
            <IconButton
              size="small"
              aria-label="filter"
              onClick={(e) => {
                setMenuVisible(true);
                setMenuAnchor(e.currentTarget);
              }}
            >
              <FilterAltOutlined />
            </IconButton>
            <FilterModal
              anchorEl={menuAnchor}
              open={menuVisible}
              filter={filter}
              onClose={() => setMenuVisible(false)}
              onSelect={handleSelectFilter}
            />
          </Box>
          {loading ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <PatientList
              users={filteredUsers}
              selfId={selfId}
              selectedUser={selectedUser}
              onSelect={selectUser}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <ChatPane
            selfId={selfId}
            user={selectedUser}
            messages={currentMsgs}
            onSend={send}
            input={input}
            setInput={setInput}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((s) => ({ ...s, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function FilterModal({ anchorEl, open, filter, onClose, onSelect }) {
  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{ sx: { borderRadius: 1, minWidth: 160 } }}
    >
      <Box>
        <Box
          sx={{
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #ccc",
          }}
        >
          <Typography
            sx={{ fontSize: 16, color: "#333", fontWeight: 600, my: 1.5 }}
          >
            Filter
          </Typography>
          <Button
            onClick={() => onSelect("")}
            sx={{ color: "red", fontWeight: 600, my: 1.5 }}
          >
            Clear
          </Button>
        </Box>
        {[
          { id: "", name: "All" },
          { id: "read", name: "Read" },
          { id: "unread", name: "Unread" },
        ].map((it) => (
          <Box
            key={it.id}
            onClick={() => onSelect(it.id)}
            sx={{
              px: 2,
              py: 1.5,
              cursor: "pointer",
              bgcolor: filter === it.id ? "#c9c9c9" : "transparent",
              "&:hover": { bgcolor: "#eee" },
            }}
          >
            <Typography sx={{ fontSize: 16, color: "#333" }}>
              {it.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Popover>
  );
}

function PatientList({ users, selfId, selectedUser, onSelect }) {
  return (
    <List sx={{ flex: 1, overflowY: "auto" }}>
      {users.map((u) => {
        const displayName = u?.patientName || u?.name || u?.email || "User";
        const preview = u?.message ? u?.message?.currentMessage : "No messages";
        const t = u?.message ? u?.message?.createdAt : null;
        const unread = u?.unreadMessages || 0;
        const isUnreadIncoming =
          u?.message?.status !== "read" &&
          String(selfId) !== String(u?.message?.userId);

        return (
          <React.Fragment key={String(u?._id || u?.id)}>
            <ListItemButton
              onClick={() => onSelect(u)}
              selected={selectedUser?._id === u?._id}
              sx={{
                bgcolor: selectedUser?._id === u?._id ? "#f5f5f5" : "#fff",
                alignItems: "flex-start",
                py: 1.25,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: COLORS.avatarBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1.5,
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: COLORS.avatarText,
                  }}
                >
                  {String(displayName).charAt(0).toUpperCase()}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: COLORS.name,
                      mr: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayName}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: COLORS.sub }}>
                    {showMessageTime(t)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: isUnreadIncoming ? "#0078d4" : "#6a6a7b",
                      fontWeight: isUnreadIncoming ? 800 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      mr: 1,
                    }}
                  >
                    {preview}
                  </Typography>
                  {unread > 0 && (
                    <Box
                      sx={{
                        fontSize: 12,
                        color: "#fff",
                        bgcolor: COLORS.unreadBadge,
                        px: 1,
                        py: 0.5,
                        borderRadius: 12,
                      }}
                    >
                      {unread}
                    </Box>
                  )}
                </Box>
              </Box>
            </ListItemButton>
            <Divider />
          </React.Fragment>
        );
      })}
      {users.length === 0 && (
        <Box sx={{ p: 3, color: COLORS.sub, textAlign: "center" }}>
          <Typography>No caretakers found.</Typography>
          <Typography sx={{ color: COLORS.subLight, fontSize: 12, mt: 0.75 }}>
            Click Refresh or try again later.
          </Typography>
        </Box>
      )}
    </List>
  );
}

function ChatPane({ selfId, user, messages, onSend, input, setInput }) {
  const bottomRef = useRef(null);
  const scrollBoxRef = useRef(null);

  // auto scroll to bottom on new messages and when user changes
  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, user?._id]);

  // Render messages with date separators and RN styling
  const items = useMemo(() => {
    const out = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const prev = messages[i - 1];
      const showDate = i === 0 || !isSameDay(prev?.createdAt, m.createdAt);
      if (showDate) {
        out.push(
          <Box
            key={`sep_${i}`}
            sx={{ display: "flex", justifyContent: "center", my: 1.25 }}
          >
            <Box
              sx={{
                bgcolor: COLORS.chipDateBg,
                px: 1.75,
                py: 0.75,
                borderRadius: 20,
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#555" }}>
                {formatDateSeparator(m.createdAt)}
              </Typography>
            </Box>
          </Box>
        );
      }
      const isSelf = String(m.userId) === String(selfId);
      out.push(
        <Box key={m._id} sx={{ mb: 1.5, display: "flex" }}>
          <Box sx={{ ml: isSelf ? "auto" : 0, mr: isSelf ? 0 : "auto" }}>
            <Paper
              elevation={1}
              sx={{
                bgcolor: isSelf ? COLORS.bubbleMe : COLORS.bubbleOther,
                borderTopRightRadius: RADIUS.bubble,
                borderTopLeftRadius: RADIUS.bubble,
                borderBottomRightRadius: isSelf ? 0 : RADIUS.bubble,
                borderBottomLeftRadius: isSelf ? RADIUS.bubble : 0,
                px: 1.75,
                py: 1.25,
                border: !isSelf
                  ? `1px solid ${COLORS.bubbleOtherBorder}`
                  : "none",
                boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                sx={{ fontSize: 15, color: isSelf ? "#000" : "#222" }}
              >
                {m.content}
              </Typography>
              <Box
                sx={{
                  mt: 0.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 0.5,
                }}
              >
                <Typography sx={{ fontSize: 11, color: "#000" }}>
                  {formatTime(m.createdAt)}
                </Typography>
                {isSelf &&
                  (m.status === "read" ? (
                    <DoneAllIcon sx={{ fontSize: 16, color: "#0078d4" }} />
                  ) : m.status === "delivered" ? (
                    <DoneAllIcon sx={{ fontSize: 16, color: "black" }} />
                  ) : (
                    <CheckIcon sx={{ fontSize: 16, color: "black" }} />
                  ))}
              </Box>
            </Paper>
          </Box>
        </Box>
      );
    }
    return out;
  }, [messages, selfId]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        ref={scrollBoxRef}
        sx={{
          flex: 1,
          px: 1.5,
          pt: 1.5,
          pb: 10,
          overflowY: "auto",
        }}
      >
        {user ? (
          items
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.sub,
            }}
          >
            <Typography>Select a patient</Typography>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>

      {user && (
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            bgcolor: "transparent",
            px: 1,
            pb: 1,
          }}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.25,
              py: 1,
              borderRadius: RADIUS.input,
              border: `1px solid ${COLORS.inputBorder}`,
              boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
              mx: 0.5,
            }}
          >
            <TextField
              placeholder="Type your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              multiline
              maxRows={6}
              fullWidth
              sx={{
                "& fieldset": { border: "none" },
              }}
              InputProps={{
                sx: {
                  "& textarea": {
                    fontSize: 15,
                    color: "#000",
                  },
                },
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
            <IconButton
              onClick={onSend}
              sx={{
                "&:hover": { bgcolor: "#d4e4ff" },
              }}
            >
              <SendIcon sx={{ color: "#000", fontSize: 24 }} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}
