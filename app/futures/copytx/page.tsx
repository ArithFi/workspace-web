"use client";
import IframeResizer from "iframe-resizer-react";

const Metabase = () => {
  return (
    <IframeResizer
      src="https://workspace.nestprotocol.org/public/dashboard/5f5b615a-e553-411f-944c-3435289c79eb"
      width="100%"
      height="100%"
      scrolling
      sizeHeight
      allowTransparency
    ></IframeResizer>
  );
};

export default Metabase;
