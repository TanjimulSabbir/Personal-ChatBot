import { useRef, useState } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { Message } from "../types/types";

// কোড ব্লক + কপি বাটন
function CodeBlock({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(ref.current?.textContent ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* কপি না হলে কিছু করার নেই */
    }
  }

  return (
    <div className="not-prose group/code relative my-4 overflow-hidden rounded-xl border border-white/10 bg-slate-950">
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-white/10 bg-slate-800 px-2 py-1 text-xs text-slate-300 opacity-0 transition hover:bg-slate-700 group-hover/code:opacity-100"
      >
        {copied ? "✓ কপি হয়েছে" : "কপি"}
      </button>
      <pre
        ref={ref}
        className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-200"
      >
        {children}
      </pre>
    </div>
  );
}

// Markdown-এর কোন অংশ কীভাবে দেখাবে
const components: Components = {
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-white/10">
      <table className="my-0 w-full">{children}</table>
    </div>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

const proseClasses = [
  "prose prose-invert max-w-none",
  "prose-p:leading-7 prose-li:my-1",
  "prose-headings:font-semibold prose-headings:text-slate-50",
  "prose-h2:mt-6 prose-h2:text-xl prose-h3:text-lg",
  "prose-a:text-indigo-400 hover:prose-a:text-indigo-300",
  "prose-strong:text-slate-50",
  "prose-blockquote:border-indigo-400/50 prose-blockquote:text-slate-300",
  "prose-hr:border-white/10",
  "prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal",
  "prose-code:before:content-none prose-code:after:content-none",
].join(" ");

export default function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* কপি না হলে কিছু করার নেই */
    }
  }

  // ইউজারের মেসেজ: সাধারণ টেক্সট
  if (isUser) {
    return (
      <div className="animate-fade-up flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-600 to-indigo-500 px-4 py-2.5 shadow-lg shadow-indigo-900/20">
          {message.content}
        </div>
      </div>
    );
  }

  // Error: সাধারণ টেক্সট, লাল বাক্স
  if (message.isError) {
    return (
      <div className="animate-fade-up flex items-end gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-sm">
          ⚠️
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-red-300">
          {message.content}
        </div>
      </div>
    );
  }

  // AI-র উত্তর: Markdown
  return (
    <div className="animate-fade-up group flex items-start gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm">
        🤖
      </div>
      <div className="min-w-0 max-w-[90%]">
        <div className="rounded-2xl rounded-tl-sm bg-slate-800/80 px-5 py-3">
          <div className={proseClasses}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
           <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
          {message.model && (
            <span className="rounded-md bg-white/5 px-1.5 py-0.5">
              {message.model.split("/").pop()}
            </span>
          )}
          <button
            onClick={copy}
            className="opacity-0 transition hover:text-slate-300 group-hover:opacity-100"
          >
            {copied ? "✓ কপি হয়েছে" : "পুরো উত্তর কপি"}
          </button>
        </div>
      </div>
    </div>
  );
}