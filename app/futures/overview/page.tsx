"use client";
import IframeResizer from "iframe-resizer-react";
const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/ebe593b4-835b-431a-84b5-ba29509c9dc4"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
      allowTransparency
    ></IframeResizer>
  );
};

export default Metabase;
