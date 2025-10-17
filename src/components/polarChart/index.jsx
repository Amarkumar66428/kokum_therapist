import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";
import { ChartColors } from "../../constant/appColors";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const OuterLabelPlugin = {
  id: "outerLabelPlugin",
  afterDatasetsDraw(chart, _args, opts) {
    const { ctx, chartArea, scales } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data) return;

    const r = scales.r;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    const radius = r.drawingArea + (opts.offset || 18);

    const labels = chart.data.labels || [];
    const values = chart.data.datasets[0]?.data || [];

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${opts.fontSize || 11}px ${
      opts.fontFamily || "Inter, system-ui, Segoe UI, Roboto, Arial"
    }`;
    ctx.fillStyle = opts.color || "#333";

    const wrapLabel = (label, maxChars = 10) => {
      const words = label.split(" ");
      const lines = [];
      let currentLine = "";

      for (const word of words) {
        if ((currentLine + word).length <= maxChars) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    meta.data.forEach((arc, i) => {
      const mid = (arc.startAngle + arc.endAngle) / 2;
      const x = cx + Math.cos(mid) * radius;
      const y = cy + Math.sin(mid) * radius;

      const label = labels[i] ?? "";
      const value = values[i] ?? 0;

      // Wrap text intelligently (by words, not chars)
      const lines = wrapLabel(label, 10);
      // Add percentage as last line
      lines.push(`${value}%`);

      const lineHeight = opts.lineHeight || 13;
      const totalHeight = lines.length * lineHeight;

      lines.forEach((line, idx) => {
        ctx.fillText(
          line,
          x,
          y - totalHeight / 2 + idx * lineHeight + lineHeight / 2
        );
      });
    });

    ctx.restore();
  },
};

// Plugin to draw black borders
const BlackBorderPlugin = {
  id: "blackBorderPlugin",
  afterDraw(chart, _args, opts) {
    const { ctx, chartArea, scales } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data) return;
    const r = scales.r;
    if (!r) return;

    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    const outerRadius = r.drawingArea;

    ctx.save();
    ctx.lineJoin = "round";
    ctx.strokeStyle = opts.color || "#000";
    ctx.lineWidth = opts.lineWidth || 1.5;

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw divider lines
    meta.data.forEach((arc) => {
      const start = arc.startAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(start) * outerRadius,
        cy + Math.sin(start) * outerRadius
      );
      ctx.stroke();
    });

    ctx.restore();
  },
};

ChartJS.register(OuterLabelPlugin, BlackBorderPlugin);

const VALUES = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
const LABELS = [
  "Poor Eye Contact",
  "Abnormal Flat Speech",
  "Anxiety",
  "Aggression",
  "Noise Sensitivity",
  "Fixations",
  "Social Difficulty",
  "Depression",
  "Tics and Fidgets",
  "Abnormal Postures",
];

export default function PolarChart({ values }) {
  const data = useMemo(
    () => ({
      labels: LABELS,
      datasets: [
        {
          label: "Profile",
          data: values || VALUES,
          backgroundColor: ChartColors,
          borderWidth: 0, // we'll draw borders manually
        },
      ],
    }),
    [values]
  );

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      responsive: true,
      layout: { padding: 30 },
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 100,
          grid: { display: false },
          angleLines: { display: false },
          ticks: { display: false },
          pointLabels: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (ctx) => `${LABELS[ctx.dataIndex]}: ${ctx.formattedValue}%`,
          },
        },
        outerLabelPlugin: {
          offset: 18,
          fontSize: 10,
          color: "#000",
          fontFamily: "regular",
        },
        blackBorderPlugin: { color: "#000", lineWidth: 1.2 },
      },
      animation: { duration: 600 },
      hover: { mode: null },
      elements: {
        arc: { hoverOffset: 0 },
      },
    }),
    []
  );

  return (
    <div style={{ width: 280, height: 240 }}>
      <PolarArea data={data} options={options} />
    </div>
  );
}
