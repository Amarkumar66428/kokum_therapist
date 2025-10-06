// TimelineCalendarMUI.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Box, Container, Stack, Typography, useTheme } from "@mui/material";

export default function TimelineChart({
  events = [],
  hourHeight = 50, // px per hour
  showCurrentTime = true,
}) {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const timeToMinutes = useCallback((t) => {
    const d = t instanceof Date ? t : new Date(t);
    if (!isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes();
    if (typeof t === "string" && /^\d{2}:\d{2}$/.test(t)) {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }
    return 0;
  }, []);

  const minutesToY = useCallback(
    (mins) => (mins / 60) * hourHeight,
    [hourHeight]
  );

  const hourLabels = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const suffix = i < 12 ? "AM" : "PM";
      return `${hour}:00 ${suffix}`;
    });
  }, []);

  const totalHeight = useMemo(() => 24 * hourHeight, [hourHeight]);

  const currentTimeY = useCallback(() => {
    const mins = currentTime.getHours() * 60 + currentTime.getMinutes();
    return minutesToY(mins);
  }, [currentTime, minutesToY]);

  useEffect(() => {
    const y = Math.max(currentTimeY() - 150, 0);
    requestAnimationFrame(() => {
      if (scrollRef.current)
        scrollRef.current.scrollTo({ top: y, left: 0, behavior: "auto" });
    });
  }, [currentTimeY]);

  // Overlap grouping + greedy columns
  const positionedEvents = useMemo(() => {
    if (!events?.length) return [];

    const sorted = [...events].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    const eventsOverlap = (a, b) => {
      const s1 = timeToMinutes(a.startTime);
      const e1 = timeToMinutes(a.endTime);
      const s2 = timeToMinutes(b.startTime);
      const e2 = timeToMinutes(b.endTime);
      return s1 < e2 && s2 < e1;
    };

    const groups = [];
    let active = [];

    for (const ev of sorted) {
      const s = timeToMinutes(ev.startTime);
      active = active.filter((a) => timeToMinutes(a.endTime) > s);
      const overlaps = active.filter((a) => eventsOverlap(a, ev));

      if (overlaps.length === 0) {
        const last = groups[groups.length - 1];
        if (last && last.some((g) => eventsOverlap(g, ev))) {
          last.push(ev);
        } else {
          groups.push([ev]);
        }
      } else {
        let attached = false;
        for (let gi = groups.length - 1; gi >= 0; gi--) {
          const g = groups[gi];
          if (g.some((x) => eventsOverlap(x, ev))) {
            g.push(ev);
            attached = true;
            break;
          }
        }
        if (!attached) groups.push([ev]);
      }
      active.push(ev);
    }

    const out = [];
    for (const group of groups) {
      const g = [...group].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
      const cols = [];
      for (const ev of g) {
        const evStart = timeToMinutes(ev.startTime);
        let col = 0;
        while (col < cols.length) {
          const last = cols[col];
          if (!last || timeToMinutes(last.endTime) <= evStart) break;
          col++;
        }
        ev._col = col;
        cols[col] = ev;
      }
      const maxCols = cols.length || 1;
      for (const ev of g) {
        ev._maxCols = maxCols;
        ev._isOverlapping = maxCols > 1;
        out.push(ev);
      }
    }
    return out;
  }, [events, timeToMinutes]);

  const eventDurationLabel = useCallback((startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = Math.max(end - start, 0);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hrs > 0)
      return `${hrs} hr${hrs > 1 ? "s" : ""}${mins > 0 ? ` ${mins} min` : ""}`;
    return `${mins} min`;
  }, []);

  // Base event width for column calculations; capped visually by container
  const EVENT_TOTAL_WIDTH = 260;

  return (
    <Container maxWidth="md" disableGutters>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          overflow: "hidden",
        }}
      >
        <Box
          role="region"
          aria-label="Timeline scroll area"
          ref={scrollRef}
          sx={{
            height: { xs: 420, sm: 380, md: 360 },
            overflow: "auto",
            scrollBehavior: "smooth",
            backgroundColor: "background.default",
          }}
        >
          <Box
            sx={{
              position: "relative",
              height: totalHeight,
              pl: { xs: 7, sm: 9, md: 10 }, // label gutter
              pr: { xs: 1.5, sm: 2, md: 2.5 },
            }}
          >
            {hourLabels.map((hour, i) => {
              const top = i * hourHeight;
              return (
                <Box
                  key={hour}
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    minHeight: 16,
                    display: "flex",
                    alignItems: "center",
                    zIndex: 2,
                    transform: `translateY(${top}px)`,
                    willChange: "transform",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 64, sm: 80, md: 92 },
                      pr: 1.25,
                      display: "flex",
                      justifyContent: "flex-end",
                      boxSizing: "border-box",
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.disabled",
                        fontWeight: 600,
                        fontSize: { xs: 10, sm: 11 },
                      }}
                    >
                      {hour}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, height: 1, bgcolor: "divider" }} />
                </Box>
              );
            })}

            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: { xs: 64, sm: 80, md: 92 },
                width: 2,
                bgcolor: "divider",
                height: totalHeight,
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: "relative",
                height: "100%",
                pl: 1.25,
                maxWidth: { xs: "88vw", sm: 520, md: 560 },
              }}
            >
              {positionedEvents.map((ev, idx) => {
                const start = timeToMinutes(ev.startTime);
                const end = timeToMinutes(ev.endTime);
                const dur = Math.max(end - start, 0);
                const top = minutesToY(start);
                const height = Math.max(minutesToY(dur), 48);

                const maxCols = ev._maxCols || 1;
                const colIndex = ev._col || 0;
                const colWidth = EVENT_TOTAL_WIDTH / maxCols;
                const leftPx = colIndex * colWidth;
                const widthPx = ev._isOverlapping
                  ? colWidth - 6
                  : EVENT_TOTAL_WIDTH;

                const accent =
                  ev.type === "routine"
                    ? theme.palette.info.main
                    : theme.palette.error.light;

                return (
                  <Box
                    key={ev._id ?? idx}
                    sx={{
                      position: "absolute",
                      transform: `translate(${leftPx}px, ${top}px)`,
                      height,
                      width: widthPx,
                      borderRadius: 1.5,
                      borderLeft: `3px solid ${accent}`,
                      borderBottom: `1px solid ${accent}`,
                      bgcolor: "grey.50",
                      boxShadow: 1,
                      p: 0.75,
                      overflow: "hidden",
                      zIndex: 2,
                      willChange: "transform,height,width",
                    }}
                    title={`${
                      ev.name || ev.customName || ""
                    } • ${eventDurationLabel(ev.startTime, ev.endTime)}`}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "primary.dark",
                        lineHeight: 1.2,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        WebkitLineClamp: height < 60 ? 1 : 2,
                        fontSize: { xs: 12, sm: 13 },
                      }}
                    >
                      {ev.name || ev.customName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.25,
                        color: "text.secondary",
                        fontWeight: 500,
                        fontSize: { xs: 10, sm: 11 },
                      }}
                    >
                      {eventDurationLabel(ev.startTime, ev.endTime)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {showCurrentTime && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  transform: `translateY(${currentTimeY()}px)`,
                  willChange: "transform",
                  pointerEvents: "none",
                }}
              >
                <Box
                  sx={{
                    bgcolor: "error.main",
                    borderRadius: 0.5,
                    px: 0.75,
                    py: 0.25,
                    mr: 0.25,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: "#fff",
                      fontSize: { xs: 10 },
                      fontWeight: 800,
                    }}
                  >
                    {currentTime.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, height: 2, bgcolor: "error.main" }} />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "error.main",
                    ml: "-4px",
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
        {["Routines", "Activities"].map((label) => (
          <Stack key={label} direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 28,
                height: 3,
                borderRadius: 1,
                bgcolor: label === "Routines" ? "info.main" : "error.light",
              }}
            />
            <Typography variant="body2">{label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}
