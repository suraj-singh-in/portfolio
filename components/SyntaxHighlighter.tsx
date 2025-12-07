// components/CodeBlock.tsx
"use client";

import { FC } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {  duotoneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language?: string;
  value: string;
  wrapLongLines?: boolean;
}

const CodeBlock: FC<CodeBlockProps> = ({
  language = "javascript",
  value,
  wrapLongLines = true,
}) => {
  return (
    <div className="my-4 overflow-hidden rounded-lg border bg-[#0d1117]">
      <SyntaxHighlighter
        
        language={language}
        style={duotoneLight}
        wrapLongLines={wrapLongLines}
        customStyle={{
          margin: 0,
          padding: "1rem 1.25rem",
          background: "transparent",
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}
        showLineNumbers
      >
        {value.trim()}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
