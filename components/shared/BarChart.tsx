import { ChartDatum } from "@/lib/types";
import { C } from "@/lib/palette";

interface Props {
  data: ChartDatum[];
  height?: number;
  width?: number;
  showVals?: boolean;
  highlightLast?: boolean;
}

// SVG bar chart — ported from the prototype for exact brand fidelity.
export default function BarChart({
  data,
  height = 180,
  width = 360,
  showVals = false,
  highlightLast = false,
}: Props) {
  const H = height;
  const W = width;
  const pad = 28;
  const max = Math.max(...data.map((d) => d.value), 0);
  const n = data.length;
  const gap = 14;
  const bw = (W - pad - gap * (n - 1)) / n;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxHeight: H }}
      preserveAspectRatio="xMidYMid meet"
      role="img"
    >
      {data.map((d, i) => {
        const h = max ? (H - 30) * (d.value / max) : 0;
        const x = pad + i * (bw + gap);
        const y = H - 24 - h;
        const fill = highlightLast && i === n - 1 ? C.greenDD : C.greenD;
        return <rect key={`b${i}`} x={x} y={y} width={bw} height={h} rx={2} fill={fill} />;
      })}
      {data.map((d, i) => {
        const h = max ? (H - 30) * (d.value / max) : 0;
        const x = pad + i * (bw + gap);
        const y = H - 24 - h;
        return (
          <g key={`l${i}`}>
            <text
              x={x + bw / 2}
              y={H - 8}
              textAnchor="middle"
              fontSize="11"
              fill={C.grayM}
              fontFamily="Work Sans"
            >
              {d.label}
            </text>
            {showVals && (
              <text
                x={x + bw / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="10.5"
                fill={C.grayD}
                fontFamily="Work Sans"
              >
                {d.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
