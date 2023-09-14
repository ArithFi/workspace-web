"use client";
import IframeResizer from "iframe-resizer-react";
const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/ba222562-3d95-4835-90fe-71826003d12d"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
    ></IframeResizer>
  );
};

export default Metabase;
