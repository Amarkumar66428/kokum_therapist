import React, { useMemo } from "react";

const chartData = [
  { key: "abnormalPostures", label: "Abnormal Postures", color: "#ef8548" },
  { key: "poorEyeContact", label: "Poor Eye Contact", color: "#667da6" },
  { key: "socialDifficulty", label: "Social Difficulty", color: "#8de4ff" },
  { key: "ticsAndFidgets", label: "Tics and Fidgets", color: "#3883f5" },
  { key: "aggression", label: "Aggression", color: "#5D6BC3" },
  {
    key: "abnormalFlatSpeech",
    label: "Abnormal Flat Speech",
    color: "#667DA6",
  },
  { key: "fixations", label: "Fixations", color: "#edb578" },
  { key: "depression", label: "Depression", color: "#b1d59d" },
  { key: "noiseSensitivity", label: "Noise Sensitivity", color: "#cfb6e8" },
  { key: "anxiety", label: "Anxiety", color: "#e6b7b8" },
];

const initialValues = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50];

const MAX_CHARS_PER_LINE = 12; // tune as needed

const degToRad = (deg) => (Math.PI / 180) * deg;
const polarToCartesian = (cx, cy, radius, angle) => {
  const rad = degToRad(angle - 90);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
};

// Greedy word-wrap by character count into lines of <= MAX_CHARS_PER_LINE
const wrapLabel = (label, maxChars = MAX_CHARS_PER_LINE) => {
  const words = label.trim().split(/\s+/);
  const lines = [];
  let current = "";

  for (const w of words) {
    if (current.length === 0) {
      // if a single word exceeds max, hard-break it into chunks
      if (w.length > maxChars) {
        const chunks = w.match(new RegExp(`.{1,${maxChars}}`, "g")) || [w];
        lines.push(...chunks);
      } else {
        current = w;
      }
    } else if ((current + " " + w).length <= maxChars) {
      current += " " + w;
    } else {
      lines.push(current);
      if (w.length > maxChars) {
        const chunks = w.match(new RegExp(`.{1,${maxChars}}`, "g")) || [w];
        // push all but last; start new current with last chunk to allow following words
        lines.push(...chunks.slice(0, -1));
        current = chunks[chunks.length - 1];
      } else {
        current = w;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
};

const buildSectorPath = (cx, cy, r0, r1, a0, a1) => {
  const p0 = polarToCartesian(cx, cy, r0, a0);
  const p1 = polarToCartesian(cx, cy, r1, a0);
  const p2 = polarToCartesian(cx, cy, r1, a1);
  const p3 = polarToCartesian(cx, cy, r0, a1);
  const sweep = 1;
  const largeArc = (a1 - a0 + 360) % 360 > 180 ? 1 : 0;
  return [
    `M ${p0.x} ${p0.y}`,
    `L ${p1.x} ${p1.y}`,
    `A ${r1} ${r1} 0 ${largeArc} ${sweep} ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    r0 > 0
      ? `A ${r0} ${r0} 0 ${largeArc} ${1 - sweep} ${p0.x} ${p0.y}`
      : `L ${p0.x} ${p0.y}`,
    `Z`,
  ].join(" ");
};

const buildSideStrokesPath = (cx, cy, r0, r1, a0, a1) => {
  const p0 = polarToCartesian(cx, cy, r0, a0);
  const p1 = polarToCartesian(cx, cy, r1, a0);
  const p2 = polarToCartesian(cx, cy, r1, a1);
  const p3 = polarToCartesian(cx, cy, r0, a1);
  return [
    `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`,
    `M ${p3.x} ${p3.y} L ${p2.x} ${p2.y}`,
  ].join(" ");
};

const PolarChart = ({ size, values, onChange }) => {
  const safeValues =
    values && Array.isArray(values) && values.length > 0
      ? values
      : initialValues;

  const cx = size / 2;
  const cy = size / 2;
  const radiusBase = 0;
  const radiusMax = size / 2 - 50;
  const n = safeValues?.length;
  const angleStep = 360 / n;

  const pre = useMemo(() => {
    const labelMeta = chartData.map((item, i) => {
      const a0 = i * angleStep;
      const a1 = (i + 1) * angleStep;
      const mid = (a0 + a1) / 2;
      const labelPt = polarToCartesian(cx, cy, radiusMax + 15, mid);
      const lines = wrapLabel(item.label, MAX_CHARS_PER_LINE);
      const textAnchor = labelPt.x >= cx ? "start" : "end";
      return { a0, a1, labelPt, lines, textAnchor };
    });
    return { labelMeta };
  }, [angleStep, cx, cy, radiusMax]);

  const handleSectorMouseMove = (i) => (evt) => {
    const svgRect = document
      .getElementById("polar-chart-svg")
      .getBoundingClientRect();
    const mx = evt.clientX - svgRect.left;
    const my = evt.clientY - svgRect.top;
    const dx = mx - cx;
    const dy = my - cy;
    const dist = Math.hypot(dx, dy);
    const percent = Math.max(
      0,
      Math.min(100, ((dist - radiusBase) / (radiusMax - radiusBase)) * 100)
    );
    onChange((v) =>
      v[i] === percent ? v : v.map((val, idx) => (idx === i ? percent : val))
    );
  };

  return (
    <svg
      id="polar-chart-svg"
      width={size}
      height={size}
      style={{ cursor: "pointer" }}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx={cx}
        cy={cy}
        r={radiusMax}
        fill="none"
        stroke="#000"
        strokeWidth={1}
      />

      {chartData.map((_, i) => {
        const angle = i * (360 / n);
        const end = polarToCartesian(cx, cy, radiusMax, angle);
        return (
          <line
            key={`radial-${i}`}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="#000"
            strokeWidth={1}
          />
        );
      })}

      {chartData.map((item, i) => {
        const { a0, a1, labelPt, lines, textAnchor } = pre.labelMeta[i];
        const r1 =
          radiusBase + (safeValues[i] / 100) * (radiusMax - radiusBase);
        const sectorPath = buildSectorPath(cx, cy, radiusBase, r1, a0, a1);
        const sideStrokePath = buildSideStrokesPath(
          cx,
          cy,
          radiusBase,
          r1,
          a0,
          a1
        );
        const hitR = Math.max(r1, radiusMax);
        const hitPath = buildSectorPath(cx, cy, radiusBase, hitR, a0, a1);

        return (
          <g key={item.key}>
            <path
              d={hitPath}
              fill="transparent"
              stroke="transparent"
              onMouseMove={handleSectorMouseMove(i)}
              style={{ cursor: "pointer" }}
            />
            <path d={sectorPath} fill={item.color} stroke="none" />
            <path
              d={sideStrokePath}
              fill="none"
              stroke="#000"
              strokeWidth={1}
              strokeLinecap="butt"
            />
            <text
              x={labelPt.x}
              y={labelPt.y}
              fontSize="8"
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fill="#111"
              style={{ pointerEvents: "none" }}
            >
              {lines.map((ln, idx) => (
                <tspan key={idx} x={labelPt.x} dy={idx === 0 ? 0 : 12}>
                  {ln}
                </tspan>
              ))}
            </text>
            <text
              x={labelPt.x}
              y={labelPt.y + lines.length * 12}
              fontSize="8"
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fill="#111"
              style={{ pointerEvents: "none" }}
            >
              {safeValues[i].toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default PolarChart;
