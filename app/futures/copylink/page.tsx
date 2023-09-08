"use client";
import IframeResizer from "iframe-resizer-react";
const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/f7871d0c-34db-4cfc-87c3-9e1e30b9e33f"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
      allowTransparency
    ></IframeResizer>
  );
};

export default Metabase;
