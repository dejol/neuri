import { RadialProgressType } from "../../types/components";

export default function RadialProgressComponent({
  value,
  color,
  size,
}: RadialProgressType) {
  const style = {
    "--value": value * 100,
    "--size": size??"1.5rem",
    "--thickness": "2px",
  } as React.CSSProperties;

  return (
    <div className={"radial-progress " + color} style={style}>
      <strong className="text-[8px]">{Math.trunc(value * 100)}%</strong>
    </div>
  );
}
