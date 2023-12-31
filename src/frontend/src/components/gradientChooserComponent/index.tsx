import { gradients } from "../../utils/styleUtils";

export default function GradientChooserComponent({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center  gap-4">
      {gradients.map((gradient, idx) => (
        <div
          onClick={() => {
            onChange(gradient);
          }}
          className={
            "duration-400 h-8 w-8 cursor-pointer rounded-full transition-all " +
            gradient +
            (value === gradient ? " shadow-lg ring-2 ring-primary" : "")
          }
          key={idx}
        ></div>
      ))}
    </div>
  );
}
