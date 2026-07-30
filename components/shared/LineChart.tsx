import { ChartDatum } from "@/lib/types";
import { C } from "@/lib/palette";

interface Props {
  data: ChartDatum[];
  height?: number;
  width?: number;
}

// SVG area/line chart — ported from the prototype.
export default function LineChart({ data, height = 180, width = 360 }: Props) {
  const H = height;
  const W = width;
  const pad = 30;
  const max = Math.max(...data.map((d) => d.value), 0);
  const min = 0;
  const n = data.length;
  const step = n > 1 ? (W - pad * 2) / (n - 1) : 0;
  const px = (i: number) => pad + i * step;
  const py = (v: number) => H - 26 - (H - 46) * ((v - min) / (max - min || 1));

  const pts = data.map((d, i) => `${px(i)},${py(d.value)}`).join(" ");
  const area = `M${px(0)},${H - 26} L${pts.replace(/ /g, " L")} L${px(n - 1)},${H - 26} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxHeight: H }}
      preserveAspectRatio="xMidYMid meet"
      role="img"
    >
      <path d={area} fill={C.green} opacity={0.35} />
      <polyline points={pts} fill="none" stroke={C.greenDD} strokeWidth={2.2} />
      {data.map((d, i) => (
        <circle key={`d${i}`} cx={px(i)} cy={py(d.value)} r={3.2} fill={C.greenDD} />
      ))}
      {data.map((d, i) => (
        <text
          key={`t${i}`}
          x={px(i)}
          y={H - 8}
          textAnchor="middle"
          fontSize="11"
          fill={C.grayM}
          fontFamily="Work Sans"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}
