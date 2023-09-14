"use client";
import IframeResizer from "iframe-resizer-react";
const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/63af0257-6526-4c8d-b7e1-f5c13936b110"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
    ></IframeResizer>
  );
};

export default Metabase;
