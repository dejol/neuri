import { Infinity } from "lucide-react";
import { forwardRef } from "react";

const GradientSparkles = forwardRef<SVGSVGElement, React.PropsWithChildren<{}>>(
  (props, ref) => {
    return (
      <>
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop className="gradient-start" offset="0%" />
              <stop className="gradient-end" offset="100%" />
            </linearGradient>
          </defs>
        </svg>
        {/* <Infinity stroke="url(#grad1)" ref={ref} {...props} /> 在windows服务器上面不支持，暂时屏蔽动态LOGO*/}
      </>
    );
  }
);

export default GradientSparkles;
