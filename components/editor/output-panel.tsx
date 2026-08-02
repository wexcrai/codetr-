"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Terminal, PlayCircle } from "lucide-react";
import type { TestResult } from "@/hooks/use-pyodide";
import { Skeleton } from "@/components/ui/skeleton";

interface OutputPanelProps {
  output: string;
  errors: string;
  testResults: TestResult[];
  isRunning: boolean;
  executionTime: number;
  onClear: () => void;
}

export function OutputPanel({
  output,
  errors,
  testResults,
  isRunning,
  executionTime,
  onClear
}: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<"console" | "tests">("console");

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 border-t border-slate-800">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("console")}
            className={cn(
              "text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === "console" ? "text-blue-400" : "text-slate-400 hover:text-slate-300"
            )}
          >
            <Terminal className="w-4 h-4" />
            Konsol
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={cn(
              "text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === "tests" ? "text-blue-400" : "text-slate-400 hover:text-slate-300"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            Test Sonuçları
            {testResults.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-slate-800 rounded-full">
                {testResults.filter(t => t.passed).length}/{testResults.length}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-4">
          {executionTime > 0 && (
            <span className="text-xs text-slate-500">
              Süre: {executionTime}ms
            </span>
          )}
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
        {isRunning ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 bg-slate-800" />
            <Skeleton className="h-4 w-1/2 bg-slate-800" />
            <Skeleton className="h-4 w-2/3 bg-slate-800" />
          </div>
        ) : activeTab === "console" ? (
          <div className="whitespace-pre-wrap break-words">
            {errors ? (
              <div className="text-red-400 font-semibold">{errors}</div>
            ) : output ? (
              <div className="text-green-400">{output}</div>
            ) : (
              <div className="text-slate-500 italic">Program çıktısı burada görünecek...</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {testResults.length === 0 ? (
              <div className="text-slate-500 italic">Test sonuçları burada görünecek...</div>
            ) : (
              testResults.map((result, i) => (
                <div 
                  key={result.testCase.id || i}
                  className={cn(
                    "p-3 rounded-md border",
                    result.passed 
                      ? "bg-green-950/20 border-green-900/50" 
                      : "bg-red-950/20 border-red-900/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-semibold text-slate-200">
                      Test {i + 1}: {result.testCase.description}
                    </span>
                  </div>
                  
                  {!result.passed && !result.testCase.isHidden && (
                    <div className="mt-2 text-xs space-y-1">
                      <div className="text-slate-400">Beklenen:</div>
                      <div className="bg-slate-900 p-2 rounded text-green-400">
                        {result.testCase.expectedOutput}
                      </div>
                      <div className="text-slate-400 mt-2">Gerçekleşen:</div>
                      <div className="bg-slate-900 p-2 rounded text-red-400">
                        {result.error ? result.error : result.actual || "<Boş Çıktı>"}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
