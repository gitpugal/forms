"use client";

import dynamic from "next/dynamic";
import React from "react";
const Editor = dynamic(() => import("@/components/Editorjs/Editor"), {
  ssr: false,
});
const page = () => {
  return (
    <div className="w-screen overflow-y-scroll h-screen flex items-start pt-10 justify-center ">
      {" "}
      <Editor callFirebase={()=>{}} curform={null} workspace={null} form={null} json={null} cancelPreview={()=>{}}/>
    </div>
  );
};

export default page;
