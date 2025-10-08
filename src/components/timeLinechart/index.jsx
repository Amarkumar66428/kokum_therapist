import React, { useEffect, useMemo, useRef, useState } from "react";
import "./timeline-calendar.scss";
import { Card } from "@mui/material";

function TimelineCalendar({
  events = [],
  hourHeight = 50,
  showCurrentTime = true,
  labelWidth = 70,
  initialScrollOffset = 150,
}) {
  const [now, setNow] = useState(new Date());
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Measure content width for event layout
  useEffect(() => {
    const updateWidth = () => {
      if (contentRef.current) {
        setContentWidth(contentRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const timeToMinutes = (t) => {
    const d = t instanceof Date ? t : new Date(t);
    if (!isNaN(d.getTime())) {
      return d.getHours() * 60 + d.getMinutes();
    }
    if (typeof t === "string" && /^\d{2}:\d{2}$/.test(t)) {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }
    return 0;
  };

  const minutesToY = (mins) => (mins / 60) * (hourHeight + 0.6);

  const hourLabels = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const suffix = i < 12 ? "AM" : "PM";
      return `${hour}:00 ${suffix}`;
    });
  }, []);

  const currentTimeY = () => {
    const mins = now.getHours() * 60 + now.getMinutes();
    return minutesToY(mins);
  };

  const totalHeight = 24 * hourHeight;

  useEffect(() => {
    const y = Math.max(currentTimeY() - initialScrollOffset, 0);
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: y, left: 0, behavior: "instant" });
      }
    });
  }, []);

  function assignEventColumns(inEvents) {
    if (!inEvents?.length) return [];
    const sorted = [...inEvents].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    const positioned = [];
    const eventsOverlap = (a, b) => {
      const s1 = timeToMinutes(a.startTime);
      const e1 = timeToMinutes(a.endTime);
      const s2 = timeToMinutes(b.startTime);
      const e2 = timeToMinutes(b.endTime);
      return s1 < e2 && s2 < e1;
    };
    const findOverlaps = (target, all) =>
      all.filter((e) => e !== target && eventsOverlap(target, e));

    sorted.forEach((event) => {
      const direct = findOverlaps(event, sorted);
      if (direct.length === 0) {
        event._col = 0;
        event._maxCols = 1;
        event._isOverlapping = false;
      } else {
        event._isOverlapping = true;
        const group = new Set([event]);
        const stack = [...direct];
        while (stack.length) {
          const curr = stack.pop();
          if (!group.has(curr)) {
            group.add(curr);
            const more = findOverlaps(curr, sorted);
            more.forEach((m) => {
              if (!group.has(m)) stack.push(m);
            });
          }
        }
        const groupArr = Array.from(group).sort(
          (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );
        const columns = [];
        groupArr.forEach((ev) => {
          const evStart = timeToMinutes(ev.startTime);
          let col = 0;
          while (col < columns.length) {
            const last = columns[col];
            if (!last || timeToMinutes(last.endTime) <= evStart) break;
            col++;
          }
          ev._col = col;
          columns[col] = ev;
        });
        const maxCols = columns.length;
        groupArr.forEach((ev) => (ev._maxCols = maxCols));
      }
      positioned.push(event);
    });
    return positioned;
  }

  const eventDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.max(Math.floor(diffMs / (1000 * 60)), 0);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hrs > 0)
      return `${hrs} hr${hrs > 1 ? "s" : ""}${mins > 0 ? ` ${mins} min` : ""}`;
    return `${mins} min`;
  };

  return (
    <div className="timeline-root">
      <Card className="timeline-wrapper">
        <div
          className="timeline-scroll"
          ref={scrollRef}
          style={{ height: 350 }}
        >
          <div
            className="timeline-scroll-content"
            style={{
              height: totalHeight,
              paddingLeft: labelWidth + 10,
              paddingRight: 20,
              position: "relative",
            }}
          >
            {hourLabels.map((hour, i) => {
              const top = i * hourHeight;
              return (
                <div key={hour} className="hour-row" style={{ top }}>
                  <div
                    className="hour-label-box"
                    style={{ width: labelWidth, paddingRight: 10 }}
                  >
                    <span className="hour-label">{hour}</span>
                  </div>
                  <div className="hour-line" />
                </div>
              );
            })}

            <div
              className="vertical-rail"
              style={{ height: totalHeight, left: labelWidth + 5 }}
            />

            {/* Event blocks */}
            <div ref={contentRef} className="events-layer">
              {assignEventColumns(events).map((ev, idx) => {
                const start = timeToMinutes(ev.startTime);
                const end = timeToMinutes(ev.endTime);
                const dur = Math.max(end - start, 0);
                const top = minutesToY(start);
                const height = Math.max(minutesToY(dur), 50);

                // New width logic
                let colWidth = contentWidth;
                let left = 0;
                const gap = 6;
                if (ev._isOverlapping && ev._maxCols > 1) {
                  colWidth =
                    (contentWidth - gap * (ev._maxCols - 1)) / ev._maxCols;
                  left = ev._col * (colWidth + gap);
                }

                return (
                  <div
                    key={ev._id || idx}
                    className="event-block"
                    style={{
                      top,
                      height,
                      left,
                      width: colWidth,
                      borderLeftColor:
                        ev.type === "routine" ? "#3B82F6" : "#FF5A82",
                      borderBottomColor:
                        ev.type === "routine" ? "#3B82F6" : "#FF5A82",
                    }}
                    title={`${ev.name || ev.customName} — ${eventDuration(
                      ev.startTime,
                      ev.endTime
                    )}`}
                  >
                    <div
                      className="event-title"
                      style={{
                        WebkitLineClamp: height < 60 ? 1 : 2,
                      }}
                    >
                      {ev.name || ev.customName}
                    </div>
                    <div className="event-time">
                      {eventDuration(ev.startTime, ev.endTime)}
                    </div>
                  </div>
                );
              })}
            </div>

            {showCurrentTime && (
              <div className="now-row" style={{ top: currentTimeY() }}>
                <div className="now-pill">
                  <span className="now-text">
                    {now.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="now-line" />
                <div className="now-dot" />
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="legend">
        {["Routines", "Activities"].map((item) => (
          <div key={item} className="legend-item">
            <div
              className="legend-bar"
              style={{
                backgroundColor: item === "Routines" ? "#3B82F6" : "#FF5A82",
              }}
            />
            <span className="legend-text">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimelineCalendar;
