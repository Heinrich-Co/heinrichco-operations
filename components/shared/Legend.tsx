import { ChartDatum } from "@/lib/types";
import { PIE } from "@/lib/palette";

interface Props {
  data: ChartDatum[];
  format?: (v: number) => string;
}

export default function Legend({ data, format }: Props) {
  return (
    <div className="legend">
      {data.map((d, i) => (
        <div className="li" key={i}>
          <span className="name">
            <span className="dot" style={{ background: PIE[i % PIE.length] }} />
            {d.label}
          </span>
          <span className="val">{format ? format(d.value) : d.value}</span>
        </div>
      ))}
    </div>
  );
}
