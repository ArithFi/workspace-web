"use client";
import IframeResizer from "iframe-resizer-react";
const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/c19afe08-16dc-41d1-a6fd-d2762a007db3"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
      allowTransparency
    ></IframeResizer>
  );
};

export default Metabase;
