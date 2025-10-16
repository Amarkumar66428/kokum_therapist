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
  List,
  ListItemButton,
  Divider,
  IconButton,
  Paper,
  TextField,
  CircularProgress,
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
import SemiBoldText from "../../components/typography/semiBoldText";
import RegularText from "../../components/typography/regularText";
import { FONT_SIZE } from "../../constant/lookUpConstant";
import NormalButton from "../../components/button/normalButton";

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

// Keep clientId for correlation between optimistic UI and server echo
function normalizeMsg(data) {
  return {
    _id: data?._id || `${Date.now()}_${Math.random()}`,
    clientId: data?.clientId,
    content: data?.content ?? data?.message ?? "",
    userId: String(data?.senderId || data?.userId || ""),
    createdAt: data?.createdAt || new Date().toISOString(),
    status: data?.status || "sent",
  };
}
const makeClientId = () =>
  `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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

  // Single active-session messages
  const [messages, setMessages] = useState([]);
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
      if (!u?.roomId) {
        setMessages([]);
        return;
      }
      socket.joinRoom({ roomId: u.roomId, userId: selfId });
      (async () => {
        try {
          const chatHistory = await sosChatService.getChatHistory(u.roomId, 1);
          if (chatHistory?.success) {
            const normalized = (chatHistory.chats || []).map(normalizeMsg);
            setMessages(normalized);
            socket.markMessageRead({ roomId: u.roomId, userId: selfId });
          } else {
            setMessages([]);
          }
        } catch (e) {
          console.log("history error", e);
          setMessages([]);
        }
      })();
    },
    [selfId]
  );

  // leave room on unmount
  useEffect(
    () => () => {
      if (selectedUser?.roomId)
        socket.leaveRoom({ roomId: selectedUser.roomId, userId: selfId });
    },
    []
  );

  useEffect(() => {
    const handleIncoming = (data) => {
      const incomingRoomId = data?.roomId || data?.roomid || data?.roomID;
      if (!selectedUser?.roomId || incomingRoomId !== selectedUser.roomId)
        return;

      const msg = normalizeMsg(data);
      const clientId = data?.clientId;

      setMessages((prev) => {
        if (clientId) {
          const idx = prev.findIndex(
            (m) => m.clientId === clientId || m._id === clientId
          );
          if (idx !== -1) {
            const next = prev.slice();
            next[idx] = { ...prev[idx], ...msg, _id: msg._id || prev[idx]._id };
            return next;
          }
        }
        return [...prev, msg];
      });
    };

    const handleDeliveredAck = (ack) => {
      const ackRoomId =
        ack?.roomId || ack?.roomid || ack?.roomID || selectedUser?.roomId;
      if (!selectedUser?.roomId || ackRoomId !== selectedUser.roomId) return;
      const id = ack?._id || ack?.messageId || ack?.clientId;

      setMessages((prev) =>
        prev.map((m) =>
          m._id === id || m.clientId === id ? { ...m, status: "delivered" } : m
        )
      );
    };

    const handleReadAck = (ack) => {
      const ackRoomId =
        ack?.roomId || ack?.roomid || ack?.roomID || selectedUser?.roomId;
      if (!selectedUser?.roomId || ackRoomId !== selectedUser.roomId) return;
      const id = ack?._id || ack?.messageId || ack?.clientId;

      setMessages((prev) =>
        id
          ? prev.map((m) =>
              m._id === id || m.clientId === id ? { ...m, status: "read" } : m
            )
          : prev.map((m) =>
              String(m.userId) === String(selfId) ? { ...m, status: "read" } : m
            )
      );
    };

    socket.on("receiveMessage", handleIncoming);
    socket.on("messageDeliveredAck", handleDeliveredAck);
    socket.on("messageReadAck", handleReadAck);
    return () => {
      socket.off("receiveMessage", handleIncoming);
      socket.off("messageDeliveredAck", handleDeliveredAck);
      socket.off("messageReadAck", handleReadAck);
    };
  }, [selectedUser?.roomId, selfId]);

  const send = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !selectedUser?.roomId) return;

    const clientId = makeClientId();
    const optimistic = {
      _id: clientId,
      clientId,
      content: trimmed,
      userId: String(selfId),
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    setMessages((prev) => [...prev, optimistic]);

    socket.sendMessage({
      roomId: selectedUser.roomId,
      userId: selfId,
      content: trimmed,
      clientId,
    });

    setInput("");
  }, [input, selectedUser?.roomId, selfId]);

  const currentMsgs = useMemo(() => messages, [messages]);

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
            borderTopLeftRadius: 8,
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
            <SemiBoldText>Patients</SemiBoldText>
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
          <SemiBoldText>Filter</SemiBoldText>
          <NormalButton
            variant="text"
            onClick={() => onSelect("")}
            sx={{ color: "red", my: 1.5 }}
          >
            Clear
          </NormalButton>
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
            <RegularText>{it.name}</RegularText>
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
                <SemiBoldText
                  sx={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: COLORS.avatarText,
                  }}
                >
                  {String(displayName).charAt(0).toUpperCase()}
                </SemiBoldText>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <SemiBoldText>{displayName}</SemiBoldText>
                  <RegularText>{showMessageTime(t)}</RegularText>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <RegularText>{preview}</RegularText>
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
          <SemiBoldText>No caretakers found.</SemiBoldText>
          <RegularText>Click Refresh or try again later.</RegularText>
        </Box>
      )}
    </List>
  );
}

function ChatPane({ selfId, user, messages, onSend, input, setInput }) {
  const bottomRef = useRef(null);
  const scrollBoxRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, user?._id]);

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
              <RegularText color={"primary.main"}>
                {formatDateSeparator(m.createdAt)}
              </RegularText>
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
              <RegularText>{m.content}</RegularText>
              <Box
                sx={{
                  mt: 0.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 0.5,
                }}
              >
                <RegularText>{formatTime(m.createdAt)}</RegularText>
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
        height: "calc(100vh - 90px)",
      }}
    >
      <Box
        sx={{
          p: 2.6,
          bgcolor: "#fff",
          boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
          borderTopRightRadius: 8,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SemiBoldText>
            {user?.patientName || "Patient Not Selected"}
          </SemiBoldText>
        </Box>
      </Box>
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
            <SemiBoldText>Select a patient</SemiBoldText>
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
                    fontFamily: "regular",
                    fontSize: FONT_SIZE.BODY,
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
