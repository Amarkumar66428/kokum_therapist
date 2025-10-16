import { Email, PinDrop } from "@mui/icons-material";
import { Box, Stack, Divider, Link } from "@mui/material";
import RegularText from "../../components/typography/regularText";

const ContactUs = () => {
  const email = "Kokumassist@kokumassist.com";
  const location = "Mumbai, Maharashtra, India";

  return (
    <Box>
      <Stack spacing={2} mt={2}>
        {/* Email */}
        <Box display="flex" alignItems="center" gap={2}>
          <Email sx={{ color: "primary.icon" }} fontSize="medium" />
          <Link
            href={`mailto:${email}`}
            underline="hover"
            sx={{
              cursor: "pointer",
              textDecoration: "underline",
              "&:hover": { color: "primary.hlt_main" },
            }}
          >
            <RegularText sx={{ "&:hover": { color: "primary.hlt_main" } }}>
              {email}
            </RegularText>
          </Link>
        </Box>

        <Divider variant="middle" />

        {/* Location */}
        <Box display="flex" alignItems="flex-start" gap={2}>
          <PinDrop sx={{ color: "primary.icon" }} fontSize="medium" />
          <RegularText>{location}</RegularText>
        </Box>
      </Stack>
    </Box>
  );
};

export default ContactUs;
