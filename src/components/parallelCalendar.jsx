import React, { useMemo, useEffect, useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import RegularText from "./typography/regularText";
import SemiBoldText from "./typography/semiBoldText";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const generateCalendarDays = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const dateObj = new Date(year, month, i + 1);

    const iso = [
      dateObj.getFullYear(),
      String(dateObj.getMonth() + 1).padStart(2, "0"),
      String(dateObj.getDate()).padStart(2, "0"),
    ].join("-");

    const isToday =
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear();

    return {
      day: weekDays[dateObj.getDay()],
      date: i + 1,
      iso,
      isToday,
    };
  });
};

const ParallelCalendar = ({ selectedDate, setSelectedDate }) => {
  const data = useMemo(() => generateCalendarDays(), []);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current || !selectedDate) return;
    const el = document.getElementById(`day-${selectedDate}`);
    if (el && scrollRef.current) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedDate]);

  return (
    <Box
      ref={scrollRef}
      sx={{
        display: "flex",
        overflowX: "auto",
        gap: 1,
        py: 1,
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
        "&::-webkit-scrollbar": {
          display: "none", // Chrome/Safari
        },
      }}
    >
      {data.map((item) => {
        const isSelected = item.iso === selectedDate;
        return (
          <Box
            key={item.iso}
            id={`day-${item.iso}`}
            sx={{
              minWidth: 64,
              borderRadius: 2,
              border: item.isToday
                ? isSelected
                  ? "1px solid #fdedf1"
                  : "1px solid #fdc5d0"
                : "1px solid transparent",
              bgcolor: isSelected ? "#fdedf1" : "transparent",
              boxShadow: isSelected ? 2 : "none",
              textAlign: "center",
              px: 1,
              py: 1.5,
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { bgcolor: isSelected ? "none" : "#f5f5f5" },
            }}
            onClick={() => setSelectedDate(item.iso)}
          >
            <RegularText
              sx={{
                color: item.isToday || isSelected ? "#000" : "#666",
                fontSize: item.isToday || isSelected ? 14 : 12,
              }}
            >
              {item.day}
            </RegularText>
            <SemiBoldText
              sx={{
                mt: 0.5,
                color: item.isToday || isSelected ? "#000" : "#666",
                fontSize:  item.isToday || isSelected ? 18 : 16,
              }}
            >
              {item.date}
            </SemiBoldText>
          </Box>
        );
      })}
    </Box>
  );
};

export default ParallelCalendar;
