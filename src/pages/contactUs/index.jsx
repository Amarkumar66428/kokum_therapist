import { Email, PinDrop } from "@mui/icons-material";
import { Box, Typography, Stack, AppBar, Toolbar } from "@mui/material";

const ContactUs = () => {
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
          <Typography>Contact Us</Typography>
        </Toolbar>
      </AppBar>
      <Stack spacing={3} mt={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Email sx={{ color: "#646464" }} fontSize="medium" />
          <Typography variant="body1" color="text.secondary">
            Kokumassist@kokumassist.com
          </Typography>
        </Box>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <PinDrop sx={{ color: "#646464" }} fontSize="medium" />
          <Typography variant="body1" color="text.secondary">
            601 Gopal Vishnu CHS Ltd. Mahant Road, Opposite Ruia School, Vile
            Parle (East), Vile Parle Police Station, Mumbai, 400057,
            Maharashtra, India
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default ContactUs;
