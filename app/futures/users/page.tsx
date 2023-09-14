"use client";
import IframeResizer from "iframe-resizer-react";

const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/cc463c0d-fddc-4c1c-a458-40479f63a133"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
    ></IframeResizer>
  );
};

export default Metabase;
