import React, { useState } from "react";
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const SosPatients = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState({});

  // Dummy users
  const users = [
    { id: 1, name: "John Doe", lastMsg: "Need help!" },
    { id: 2, name: "Jane Smith", lastMsg: "SOS alert sent" },
    { id: 3, name: "Michael Lee", lastMsg: "On the way to hospital" },
  ];

  const handleSend = () => {
    if (!message || !selectedUser) return;
    setChat((prev) => ({
      ...prev,
      [selectedUser.id]: [
        ...(prev[selectedUser.id] || []),
        { text: message, sender: "me" },
      ],
    }));
    setMessage("");
  };

  return (
    <Grid container sx={{ height: "100%", bgcolor: "#f5f5f5" }}>
      <Grid
        size={3}
        sx={{
          borderRight: "1px solid #ddd",
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          sx={{ p: 2, borderBottom: "1px solid #ddd", fontWeight: "bold" }}
        >
          Patients
        </Typography>
        <List sx={{ flex: 1, overflowY: "auto" }}>
          {users.map((user) => (
            <React.Fragment key={user.id}>
              <ListItem
                button
                onClick={() => setSelectedUser(user)}
                selected={selectedUser?.id === user.id}
                sx={{
                  bgcolor: selectedUser?.id === user.id && "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                <ListItemText
                  primary={user.name}
                  secondary={user.lastMsg}
                  primaryTypographyProps={{ fontWeight: "500" }}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Grid>

      <Grid
        size={9}
        sx={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Typography
          variant="h6"
          sx={{
            p: 2,
            borderBottom: "1px solid #ddd",
            bgcolor: "#fafafa",
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          {selectedUser ? selectedUser.name : "Select a patient"}
        </Typography>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            overflowX: "hidden",
          }}
        >
          {selectedUser &&
            (chat[selectedUser.id] || []).map((msg, i) => (
              <Paper
                key={i}
                sx={{
                  p: 1,
                  maxWidth: "70%",
                  alignSelf: msg.sender === "me" ? "flex-end" : "flex-start",
                  bgcolor: msg.sender === "me" ? "#dcf8c6" : "#fff",
                  boxShadow: 1,
                }}
              >
                {msg.text}
              </Paper>
            ))}
        </Box>

        {/* Input Box */}
        {selectedUser && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              borderTop: "1px solid #ddd",
              bgcolor: "#fafafa",
              flexShrink: 0,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <IconButton color="primary" onClick={handleSend}>
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default SosPatients;
