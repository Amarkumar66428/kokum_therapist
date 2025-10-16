import React from "react";
import { Box, Stack, Typography, Chip, CircularProgress } from "@mui/material";
import MusicIcon from "../assets/svg/Music.svg";
import PuzzleIcon from "../assets/svg/Puzzle.svg";
import PaintingIcon from "../assets/svg/Painting.svg";
import YogaIcon from "../assets/svg/Yoga.svg";
import GardeningIcon from "../assets/svg/Gardening.svg";
import SculptingIcon from "../assets/svg/Sculpting.svg";
import { FiActivity } from "react-icons/fi";
import { AppColors } from "../constant/appColors";

const ACTIVITY_DATA = [
  { label: "Music", Icon: MusicIcon },
  { label: "Puzzles", Icon: PuzzleIcon },
  { label: "Painting", Icon: PaintingIcon },
  { label: "Dancing", Icon: YogaIcon },
  { label: "Gardening", Icon: GardeningIcon },
  { label: "Sculpting", Icon: SculptingIcon },
];

const DailyActivities = ({ dailyActivities = [] }) => {
  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      {dailyActivities.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={120}
          sx={{
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary" fontSize="0.95rem">
            No activities for today
          </Typography>
        </Box>
      ) : (
        dailyActivities.map((activity, index) => {
          return (
            <Stack
              key={activity.id || index}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{
                p: 1.5,
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                backgroundColor: "#fff",
              }}
            >
              <figure
                sx={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {ACTIVITY_DATA.find((a) => a.label === activity.label) ? (
                  <img
                    src={
                      ACTIVITY_DATA.find((a) => a.label === activity.label).Icon
                    }
                    width={40}
                    height={40}
                  />
                ) : (
                  <FiActivity size={40 - 6} color={AppColors.ICON} />
                )}
              </figure>
              <Box
                flexGrow={1}
                display="flex"
                gap={0.5}
                justifyContent={"space-between"}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  sx={{ color: "#000" }}
                >
                  {activity.label}
                </Typography>

                <Chip
                  label={`${activity.startTime} to ${activity.endTime}`}
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    backgroundColor: "#f0f0f0",
                    color: "#333",
                  }}
                />
              </Box>
            </Stack>
          );
        })
      )}
    </Box>
  );
};

export default DailyActivities;
