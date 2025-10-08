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
} from "@mui/material";
import { DeleteSweep, DoneAll, NotificationsNone } from "@mui/icons-material";
import notificationService from "../../services/notificationService";

const Notifications = () => {
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
        "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
        "& .Mui-selected": { color: "primary.main" },
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
        color="inherit"
        elevation={0}
        sx={{
          p: 2,
          boxShadow: "none",
          borderRadius: 2,
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography>Notifications</Typography>
            {unreadCount > 0 && (
              <Typography variant="body2" color="error.main">
                {unreadCount} unread notification
                {unreadCount !== 1 ? "s" : ""}
              </Typography>
            )}
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            display="flex"
            justifyContent="flex-end"
            gap={1}
            flexWrap="wrap"
          >
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<DoneAll />}
              onClick={markAllAsRead}
              disabled={markReadLoading || unreadCount === 0}
            >
              {markReadLoading ? "Marking..." : "Mark All Read"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteSweep />}
              onClick={() => setConfirmOpen(true)}
              disabled={clearLoading}
            >
              {clearLoading ? "Clearing..." : "Clear All"}
            </Button>
          </Grid>
        </Grid>
      </AppBar>
      <FilterTabs />

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
            <Typography variant="h6" mt={2}>
              No notifications
            </Typography>
            <Typography variant="body2">
              {filter === "unread"
                ? "You're all caught up!"
                : filter === "read"
                ? "No read notifications yet."
                : "You don't have any notifications yet."}
            </Typography>
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              onClick={() => fetchNotifications(true)}
            >
              Refresh
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredNotifications.map((item) => (
              <Grid size={{ xs: 12 }} key={item._id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderLeft: !item.read && "4px solid #072c85",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: 1,
                    },
                  }}
                  onClick={() => markAsRead(item._id)}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      fontWeight={item.read ? 500 : 700}
                      color={item.read ? "text.primary" : "primary.main"}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {fetchDateTime(item.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.message}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Confirm Clear All */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Clear All Notifications</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all notifications? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              deleteNotification("all");
              setConfirmOpen(false);
            }}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications;
