"use client";
import IframeResizer from "iframe-resizer-react";
const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/c3445415-7070-4cdd-830a-9ccb55e35093"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
    ></IframeResizer>
  );
};

export default Metabase;
