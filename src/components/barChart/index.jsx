// Chart.jsx
import React, { useRef, useEffect, useState } from "react";
import "./Chart.scss";
import { ChartColors } from "../../constant/appColors";

const BarChart = ({
  selectedFilter = "All",
  realChartData = [],
  onBarPress,
}) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const totalHeight = 200;
  const labelFontSize = 12;

  const categoryLabels = Array.from({ length: 10 }, (_, i) => `Metric${i + 1}`);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!realChartData.length) return null;

  const maxValueAll =
    selectedFilter === "All"
      ? Math.max(
          ...realChartData.map((day) =>
            day.values.reduce((sum, val) => sum + val, 0)
          )
        )
      : 100;

  // Calculate dynamic bar width based on number of days
  const barWidth = Math.max(containerWidth / realChartData.length - 8, 20);
  const chartWidth = containerWidth;

  return (
    <div className="chart-container" ref={containerRef}>
      {/* Y-axis labels */}
      <div className="chart-y-axis">
        {[100, 80, 60, 40, 20, 0].map((percent, i) => {
          const y = totalHeight - (percent / 100) * totalHeight;
          return (
            <span
              key={i}
              className="chart-y-label"
              style={{
                top: `${y}px`,
                fontSize: `${labelFontSize}px`,
                transform: `translateY(-${labelFontSize + 16}px)`,
              }}
            >
              {percent}%
            </span>
          );
        })}
      </div>

      {/* Chart grid and bars */}
      <div className="chart-scroll">
        <div className="chart-grid" style={{ width: `${chartWidth}px` }}>
          <svg
            height={totalHeight}
            width={chartWidth}
            className="chart-grid-svg"
          >
            {[0, 20, 40, 60, 80, 100].map((p, idx) => (
              <line
                key={idx}
                x1={0}
                y1={totalHeight - (p / 100) * totalHeight}
                x2={chartWidth}
                y2={totalHeight - (p / 100) * totalHeight}
                stroke="#D7E2F0"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            ))}
            <line
              x1={0}
              y1={totalHeight}
              x2={chartWidth}
              y2={totalHeight}
              stroke="#D7E2F0"
              strokeWidth="1"
            />
          </svg>

          <div className="chart-bars">
            {realChartData.map((bar, i) => {
              const currentDaySum = bar.values.reduce(
                (sum, val) => sum + val,
                0
              );
              let displayValue = 0;
              let displayColor = "#D11B49";

              if (selectedFilter !== "All") {
                const filterIndex = categoryLabels.indexOf(selectedFilter);
                if (filterIndex !== -1) {
                  displayValue = bar.values[filterIndex] || 0;
                  displayColor = ChartColors[filterIndex];
                }
              } else {
                displayValue = currentDaySum;
              }

              const scaleFactor = selectedFilter === "All" ? maxValueAll : 100;
              const barHeight =
                scaleFactor > 0
                  ? (displayValue / scaleFactor) * totalHeight
                  : 0;

              let yOffset = 0;

              return (
                <div
                  key={i}
                  className="chart-bar-wrapper"
                  style={{ width: `${barWidth}px` }}
                >
                  <svg height={totalHeight} width={barWidth}>
                    <g>
                      {selectedFilter === "All"
                        ? bar.values.map((value, j) => {
                            if (value === 0) return null;
                            const segmentHeight =
                              currentDaySum > 0
                                ? (value / currentDaySum) * barHeight
                                : 0;
                            const rect = (
                              <rect
                                key={j}
                                x={0}
                                y={totalHeight - segmentHeight - yOffset}
                                width={barWidth - 4}
                                height={segmentHeight}
                                fill={ChartColors[j % ChartColors.length]}
                                rx={0}
                                ry={0}
                                onClick={() => onBarPress?.(bar.date)}
                              />
                            );
                            yOffset += segmentHeight;
                            return rect;
                          })
                        : displayValue > 0 && (
                            <rect
                              x={0}
                              y={totalHeight - barHeight}
                              width={barWidth - 4}
                              height={barHeight}
                              fill={displayColor}
                              rx={0}
                              ry={0}
                              onClick={() => onBarPress?.(bar.date)}
                            />
                          )}
                    </g>
                  </svg>
                  <p className="chart-x-label">
                    {String(bar.day).toUpperCase()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChart;
