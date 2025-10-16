import React from "react";
import {
  Backdrop,
  Box,
  Button,
  Divider,
  Fade,
  Modal,
  Stack,
  useMediaQuery,
} from "@mui/material";
import dayjs from "dayjs";
import SemiBoldText from "./typography/semiBoldText";
import RegularText from "./typography/regularText";

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const formatToDateAndTime = (date) =>
  date ? dayjs(date).format("MMM D, YYYY • h:mm A") : "N/A";

const SuggestionDetails = ({ open, close, data }) => {
  const isSmall = useMediaQuery("(max-width:600px)");
  return (
    <Modal
      open={open}
      onClose={close}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 200 } }}
      aria-labelledby="suggestion-detail-title"
    >
      <Fade in={open}>
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
            <SemiBoldText>Suggestion Details</SemiBoldText>
            <Button onClick={close} size="small" color="inherit">
              ✕
            </Button>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <SemiBoldText>Suggestion Type</SemiBoldText>
              <RegularText>
                {capitalize(data?.suggestionType || "Specific")}
              </RegularText>
            </Stack>
            <Stack spacing={0.5}>
              <SemiBoldText>Generated At</SemiBoldText>
              <RegularText>
                {formatToDateAndTime(data?.generatedAt || data?.createdAt)}
              </RegularText>
            </Stack>

            <Stack spacing={0.5}>
              <SemiBoldText>Sent for Review On</SemiBoldText>
              <RegularText>
                {formatToDateAndTime(data?.sentAt) || "N/A"}
              </RegularText>
            </Stack>
            <Stack spacing={0.5}>
              <SemiBoldText>Status</SemiBoldText>
              <RegularText>
                {data?.status
                  ? `${capitalize(data?.status)} on ${formatToDateAndTime(
                      data?.updateStatusAt
                    )}`
                  : "N/A"}
              </RegularText>
            </Stack>

            <Stack spacing={0.5}>
              <SemiBoldText>Feedback On</SemiBoldText>
              <RegularText>
                {data?.feedback
                  ? `${formatToDateAndTime(data?.feedbackAt)}`
                  : "N/A"}
              </RegularText>
            </Stack>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SuggestionDetails;
