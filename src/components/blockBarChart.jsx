import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Box } from "@mui/material";

// Example category labels and colors (you can import yours instead)
const categoryLabels = ["A", "B", "C", "D"];
const categoryColors = ["#D11B49", "#1E90FF", "#32CD32", "#FFA500"];

const BlockBarChart = ({ selectedFilter, realChartData, onBarPress }) => {
  // Prepare data for Recharts
  const chartData = realChartData.map((bar) => {
    const currentDaySum = bar.values.reduce((sum, val) => sum + val, 0);

    if (selectedFilter === "All") {
      // Stacked bar chart data
      const obj = { day: bar.day, date: bar.date };
      categoryLabels.forEach((label, idx) => {
        obj[label] = bar.values[idx] || 0;
      });
      return obj;
    } else {
      const filterIndex = categoryLabels.indexOf(selectedFilter);
      return {
        day: bar.day,
        date: bar.date,
        [selectedFilter]: bar.values[filterIndex] || 0,
      };
    }
  });

  return (
    <Box sx={{ width: "100%", height: 300, mt: 2 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#D7E2F0" />
          <XAxis dataKey="day" />
          <YAxis
            ticks={[0, 20, 40, 60, 80, 100]}
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#888" }}
          />
          <Tooltip />

          {selectedFilter === "All"
            ? categoryLabels.map((label, i) => (
                <Bar
                  key={label}
                  dataKey={label}
                  stackId="a"
                  fill={categoryColors[i]}
                  onClick={(data) => onBarPress?.(data.date)}
                />
              ))
            : categoryLabels
                .filter((label) => label === selectedFilter)
                .map((label, i) => (
                  <Bar
                    key={label}
                    dataKey={label}
                    fill={categoryColors[i]}
                    onClick={(data) => onBarPress?.(data.date)}
                  />
                ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BlockBarChart;
