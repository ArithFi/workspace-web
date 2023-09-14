"use client";
import IframeResizer from "iframe-resizer-react";

const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/104bb17f-c14e-4e44-b947-1050fd17f8eb"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
    ></IframeResizer>
  );
};

export default Metabase;
