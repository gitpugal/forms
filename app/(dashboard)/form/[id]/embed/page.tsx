"use client";
import React, { useState } from "react";
import CodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-dark.css";

const page = ({ params }: { params: { id: string } }) => {
  const [code, setCode] = useState(
    `\n\n\n// you other components //\n\n <iframe src="https://form-x-eight.vercel.app/embed/forms/${params.id}" height={"100%"} width={"100%"} />\n\n // you other components //\n\n\n`
  );
  const [popupCode, setpopupCode] = useState(` 
        <div>
          <button data-form-id="${params.id}" id="openFormButton">Open Form</button>
          <div id="formContainer" class="hidden"></div>
          <script src="https://form-x-eight.vercel.app/script.js"/>
        </div>`);
  return (
    <div className="w-full h-full flex flex-col items-start justify-start pt-5 md:py-10 py-5 px-2 md:p-10 md:pt-7">
      <p className="text-xl font-semibold opacity-70">Embed</p>
      <p>Add this form to any of your apps seamlessly</p>
      <div className="mt-10 w-full h-[40vh]">
        <CodeEditor
          value={code}
          onValueChange={(code) => setCode(code)}
          highlight={(code) => highlight(code, languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            color: "white",
          }}
          className="bg-black rounded-md mt-7"
          disabled={true}
        />
      </div>
    </div>
  );
};

export default page;
