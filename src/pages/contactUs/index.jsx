import { Email, PinDrop } from "@mui/icons-material";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import React from "react";

const ContactUs = () => {
  return (
    <Container maxWidth={false}>
      <Box>
        <Typography variant="h6">Contact Us</Typography>
        <Stack spacing={3} mt={3}>
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
    </Container>
  );
};

export default ContactUs;
