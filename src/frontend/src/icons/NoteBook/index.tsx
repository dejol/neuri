import React, { forwardRef } from "react";
import SvgNoteBooksIcon from "./NoteBooksIcon";

export const NoteBooksIcon = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <SvgNoteBooksIcon ref={ref} {...props} />;
});
