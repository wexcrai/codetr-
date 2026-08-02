"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface TestCase {
  id: string;
  input?: string | null;
  expectedOutput: string;
  description?: string | null;
  isHidden: boolean;
}

export interface RunResult {
  output: string;
  error: string | null;
  executionTime: number;
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actual: string;
  error?: string;
}

type PyodideInstance = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (msg: string) => void }) => void;
  setStderr: (opts: { batched: (msg: string) => void }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInstance>;
    _pyodideInstance?: PyodideInstance;
  }
}

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/";
const TIMEOUT_MS = 10_000;

export function usePyodide() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pyodideRef = useRef<PyodideInstance | null>(null);

  const loadPyodide = useCallback(async () => {
    // Return cached instance
    if (pyodideRef.current) {
      setIsReady(true);
      return;
    }
    if (window._pyodideInstance) {
      pyodideRef.current = window._pyodideInstance;
      setIsReady(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Dynamically load pyodide script
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `${PYODIDE_CDN}pyodide.js`;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Pyodide yüklenemedi"));
          document.head.appendChild(script);
        });
      }

      const instance = await window.loadPyodide!({ indexURL: PYODIDE_CDN });
      pyodideRef.current = instance;
      window._pyodideInstance = instance;
      setIsReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pyodide başlatılamadı");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-load on mount
  useEffect(() => {
    loadPyodide();
  }, [loadPyodide]);

  const runCode = useCallback(async (code: string): Promise<RunResult> => {
    if (!pyodideRef.current) {
      return { output: "", error: "Python motoru hazır değil", executionTime: 0 };
    }

    const py = pyodideRef.current;
    let output = "";
    let errorMsg: string | null = null;
    const start = performance.now();

    py.setStdout({ batched: (msg) => { output += msg + "\n"; } });
    py.setStderr({ batched: (msg) => { errorMsg = (errorMsg ?? "") + msg + "\n"; } });

    try {
      await Promise.race([
        py.runPythonAsync(code),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Zaman aşımı: Kod 10 saniyede tamamlanamadı")), TIMEOUT_MS)
        ),
      ]);
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e);
    }

    const executionTime = Math.round(performance.now() - start);
    return { output: output.trimEnd(), error: errorMsg, executionTime };
  }, []);

  const runTests = useCallback(
    async (code: string, testCases: TestCase[]): Promise<TestResult[]> => {
      const results: TestResult[] = [];

      for (const tc of testCases) {
        let testCode = code;

        // If test case has input, mock builtins.input
        if (tc.input !== null && tc.input !== undefined) {
          const inputLines = tc.input
            .split("\n")
            .map((l) => JSON.stringify(l))
            .join(", ");
          testCode = `
import builtins
_input_lines = [${inputLines}]
_input_idx = 0
def _mock_input(prompt=''):
    global _input_idx
    if _input_idx < len(_input_lines):
        val = _input_lines[_input_idx]
        _input_idx += 1
        return val
    return ''
builtins.input = _mock_input

${code}
`.trimStart();
        }

        const result = await runCode(testCode);
        const actual = result.output.trim();
        const expected = tc.expectedOutput.trim();
        const passed = actual === expected && !result.error;

        results.push({
          testCase: tc,
          passed,
          actual,
          error: result.error ?? undefined,
        });
      }

      return results;
    },
    [runCode]
  );

  return { isLoading, isReady, error, runCode, runTests, loadPyodide };
}
