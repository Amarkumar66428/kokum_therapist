// Chart.jsx
import React from "react";
import "./Chart.scss";

const BarChart = ({ selectedFilter, realChartData, onBarPress }) => {
  const totalHeight = 200;
  const labelFontSize = 12; // Replace FontSize.SUB_TITLE
  const categoryColors = ["#D11B49", "#3B82F6", "#10B981", "#F59E0B"]; // Example colors
  const categoryLabels = ["Metric1", "Metric2", "Metric3", "Metric4"]; // Example labels

  return (
    <div className="chart-container">
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

      {/* Bars */}
      <div className="chart-scroll">
        <div
          className="chart-grid"
          style={{ width: `${realChartData?.length * 40}px` }}
        >
          <svg
            height={totalHeight}
            width={realChartData?.length * 40}
            className="chart-grid-svg"
          >
            {[0, 20, 40, 60, 80, 100].map((p, idx) => (
              <line
                key={idx}
                x1={0}
                y1={totalHeight - (p / 100) * totalHeight}
                x2={realChartData?.length * 40}
                y2={totalHeight - (p / 100) * totalHeight}
                stroke="#D7E2F0"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            ))}
            <line
              x1={0}
              y1={totalHeight}
              x2={realChartData?.length * 40}
              y2={totalHeight}
              stroke="#D7E2F0"
              strokeWidth="1"
            />
          </svg>

          <div className="chart-bars">
            {realChartData?.map((bar, i) => {
              let yOffset = 0;
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
                  displayColor = categoryColors[filterIndex];
                }
              } else {
                displayValue = currentDaySum;
              }

              const scaleFactor =
                selectedFilter === "All"
                  ? Math.max(
                      ...realChartData.map((day) =>
                        day.values.reduce((sum, val) => sum + val, 0)
                      )
                    )
                  : 100;

              const barHeight = (displayValue / scaleFactor) * totalHeight;

              return (
                <div key={i} className="chart-bar-wrapper">
                  <svg height={totalHeight} width={30}>
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
                                width={26}
                                height={segmentHeight}
                                fill={categoryColors[j]}
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
                              width={26}
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
