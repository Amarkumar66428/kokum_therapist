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

// Outer text labels plugin (unchanged)
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

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${opts.fontSize || 11}px ${
      opts.fontFamily || "Inter, system-ui, Segoe UI, Roboto, Arial"
    }`;
    ctx.fillStyle = opts.color || "#333";

    const labels = chart.data.labels || [];
    meta.data.forEach((arc, i) => {
      const mid = (arc.startAngle + arc.endAngle) / 2;
      const x = cx + Math.cos(mid) * radius;
      const y = cy + Math.sin(mid) * radius;
      ctx.fillText(labels[i] ?? "", x, y);
    });
    ctx.restore();
  },
};

// Plugin to draw black borders for all sectors and the outer circle
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

    // Draw outer circle border (full 100%)
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw each sector divider line
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
  "Abnormal Posture",
  "Poor Eye Contact",
  "Tics and Fidgets",
  "Aggression",
  "Depression",
  "Fixations",
  "Abnormal Flat Speech",
  "Noise Sensitivity",
  "Social Difficulty",
  "Anxiety",
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
    []
  );

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      responsive: true,
      layout: { padding: 26 },
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
          callbacks: { label: (ctx) => `${LABELS[ctx.dataIndex]}` },
        },
        outerLabelPlugin: { offset: 18, fontSize: 10, color: "#333" },
        blackBorderPlugin: { color: "#000", lineWidth: 1.2 },
      },
      animation: { duration: 600 },
      hover: { mode: null }, // disable hover scaling
      elements: {
        arc: {
          hoverOffset: 0, // no size increase on hover
        },
      },
    }),
    []
  );

  return (
    <div style={{ width: 260, height: 180 }}>
      {" "}
      <PolarArea data={data} options={options} />{" "}
    </div>
  );
}
