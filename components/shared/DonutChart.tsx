import { ChartDatum } from "@/lib/types";
import { C, PIE } from "@/lib/palette";

interface Props {
  data: ChartDatum[];
}

// SVG donut with centered total — ported from the prototype.
export default function DonutChart({ data }: Props) {
  const W = 190;
  const H = 190;
  const cx = 95;
  const cy = 95;
  const rO = 72;
  const rI = 44;
  const total = data.reduce((s, d) => s + d.value, 0);

  const polar = (r: number, a: number): [number, number] => {
    const rad = ((a - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  let acc = 0;
  const paths = data.map((d, i) => {
    const start = (acc / total) * 360;
    acc += d.value;
    const end = (acc / total) * 360;
    const p1 = polar(rO, end);
    const p2 = polar(rO, start);
    const p3 = polar(rI, start);
    const p4 = polar(rI, end);
    const large = end - start <= 180 ? 0 : 1;
    const dPath = `M${p1[0]} ${p1[1]} A${rO} ${rO} 0 ${large} 0 ${p2[0]} ${p2[1]} L${p3[0]} ${p3[1]} A${rI} ${rI} 0 ${large} 1 ${p4[0]} ${p4[1]} Z`;
    return <path key={i} d={dPath} fill={PIE[i % PIE.length]} />;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={190} height={190} role="img">
      {paths}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="12" fill={C.grayM} fontFamily="Work Sans">
        Total
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fontSize="16"
        fontWeight="600"
        fill={C.black}
        fontFamily="Work Sans"
      >
        € {total.toLocaleString()}
      </text>
    </svg>
  );
}
