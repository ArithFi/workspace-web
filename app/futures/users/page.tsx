"use client";
import IframeResizer from "iframe-resizer-react";

const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/63322bd9-6b77-4e56-ac33-300a03a7970d"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
      allowTransparency
    ></IframeResizer>
  );
};

export default Metabase;
