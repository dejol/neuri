import React, { forwardRef } from "react";
import SvgNoteNailIcon from "./NoteNailIcon";

export const NoteNailIcon = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <SvgNoteNailIcon ref={ref} {...props} />;
});
