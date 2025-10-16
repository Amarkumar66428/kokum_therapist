import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  useTheme,
} from "@mui/material";
import { DeleteSweep, DoneAll, NotificationsNone } from "@mui/icons-material";
import notificationService from "../../services/notificationService";
import RegularText from "../../components/typography/regularText";
import NormalButton from "../../components/button/normalButton";
import SemiBoldText from "../../components/typography/semiBoldText";
import RoundedButton from "../../components/button/roundedButton";

const Notifications = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [markReadLoading, setMarkReadLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const fetchDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.fetchNotifications();
      setNotifications(res.notifications || []);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    setMarkReadLoading(true);
    try {
      await notificationService.markAsRead("single", id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setMarkReadLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!notifications.some((n) => !n.read)) return;
    setMarkReadLoading(true);
    try {
      await notificationService.markAsRead("all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    } finally {
      setMarkReadLoading(false);
    }
  };

  const deleteNotification = async (type, id) => {
    setClearLoading(true);
    try {
      await notificationService.deleteNotification(type, id);
      if (type === "all") {
        setNotifications([]);
      } else {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClearLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const FilterTabs = () => (
    <Tabs
      value={filter}
      onChange={(_, val) => setFilter(val)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderBottom: "1px solid #e0e0e0",
        "& .MuiTab-root": { textTransform: "none", fontFamily: "regular" },
        "& .Mui-selected": { fontFamily: "semibold" },
      }}
    >
      <Tab label="All" value="all" />
      <Tab label={`Unread (${unreadCount})`} value="unread" />
      <Tab label="Read" value="read" />
    </Tabs>
  );

  return (
    <Box>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          boxShadow: "none",
          borderRadius: 2,
          backgroundColor: "background.default",
        }}
      >
        <Grid
          container
          alignItems="center"
          spacing={2}
          sx={{ backgroundColor: "secondary.main", mb: 1, p: 2 }}
        >
          <Grid size={{ xs: 12, md: 8 }}>
            {unreadCount > 0 && (
              <RegularText color="error.main">
                {unreadCount} unread notification
                {unreadCount !== 1 ? "s" : ""}
              </RegularText>
            )}
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            display="flex"
            justifyContent="flex-end"
            gap={1}
            flexWrap="wrap"
          >
            <NormalButton
              startIcon={<DoneAll />}
              onClick={markAllAsRead}
              disabled={markReadLoading || unreadCount === 0}
            >
              {markReadLoading ? "Marking..." : "Mark All Read"}
            </NormalButton>
            <NormalButton
              startIcon={<DeleteSweep />}
              onClick={() => setConfirmOpen(true)}
              disabled={clearLoading}
            >
              {clearLoading ? "Clearing..." : "Clear All"}
            </NormalButton>
          </Grid>
        </Grid>
        <FilterTabs />
      </AppBar>

      <Box sx={{ marginTop: 2 }}>
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={80}
              sx={{ borderRadius: 2, mb: 2 }}
            />
          ))
        ) : filteredNotifications.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <NotificationsNone sx={{ fontSize: 80, color: "#ccc" }} />
            <SemiBoldText>No notifications</SemiBoldText>
            <RegularText>
              {filter === "unread"
                ? "You're all caught up!"
                : filter === "read"
                ? "No read notifications yet."
                : "You don't have any notifications yet."}
            </RegularText>
            <RoundedButton
              sx={{ mt: 2 }}
              variant="contained"
              onClick={() => fetchNotifications(true)}
            >
              Refresh
            </RoundedButton>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredNotifications.map((item) => (
              <Grid size={{ xs: 12 }} key={item._id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderLeft:
                      !item.read &&
                      `4px solid ${theme.palette.primary.hlt_main}`,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: 1,
                    },
                  }}
                  onClick={() => markAsRead(item._id)}
                >
                  <CardContent>
                    <RegularText
                      sx={{
                        fontFamily: item.read ? "regular" : "semiBold",
                      }}
                    >
                      {item.title}
                    </RegularText>
                    <RegularText mb={1}>
                      {fetchDateTime(item.createdAt)}
                    </RegularText>
                    <RegularText>{item.message}</RegularText>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Confirm Clear All */}
      <Dialog
        open={confirmOpen}
        sx={{ "& .MuiDialog-paper": { p: 2 } }}
        onClose={() => setConfirmOpen(false)}
      >
        <SemiBoldText>Clear All Notifications</SemiBoldText>
        <DialogContent>
          <RegularText>
            Are you sure you want to clear all notifications? This action cannot
            be undone.
          </RegularText>
        </DialogContent>
        <DialogActions>
          <NormalButton variant="text" onClick={() => setConfirmOpen(false)}>
            Cancel
          </NormalButton>
          <NormalButton
            color="error"
            onClick={() => {
              deleteNotification("all");
              setConfirmOpen(false);
            }}
          >
            Clear All
          </NormalButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications;
