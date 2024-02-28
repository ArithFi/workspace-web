"use client";
import IframeResizer from "iframe-resizer-react";
const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/daba7f01-7d27-48a3-9994-66123d8ae3bf"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
    ></IframeResizer>
  );
};

export default Metabase;
