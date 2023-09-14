"use client";
import IframeResizer from "iframe-resizer-react";
const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/ac247d50-1ea5-4a7b-b0ba-ab36afcabf01"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
    ></IframeResizer>
  );
};

export default Metabase;
