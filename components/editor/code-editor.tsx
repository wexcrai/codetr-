"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-full min-h-[400px] rounded-md" />
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  theme?: "vs-dark" | "light";
  fontSize?: number;
  onRun?: () => void;
}

export function CodeEditor({
  value,
  onChange,
  language = "python",
  readOnly = false,
  height = "100%",
  theme = "vs-dark",
  fontSize = 14,
  onRun
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="w-full h-full min-h-[400px] rounded-md" />;
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Define custom dark theme
    monaco.editor.defineTheme('codetr-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0f172a', // slate-950
      }
    });
    
    if (theme === 'vs-dark') {
      monaco.editor.setTheme('codetr-dark');
    }

    // Add keybinding for run
    if (onRun) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        onRun();
      });
    }
    
    // Auto-format shortcut
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  return (
    <div className="w-full h-full relative" style={{ height }}>
      <MonacoEditor
        height={height}
        language={language}
        theme={theme}
        value={value}
        onChange={(val) => onChange(val || "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          wordWrap: "on"
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}
