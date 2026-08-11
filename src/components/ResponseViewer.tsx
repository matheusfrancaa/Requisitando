import React, { useState } from "react";
import { 
  Download, 
  Copy, 
  Check, 
  ClipboardList 
} from "lucide-react";
import { ApiResponse } from "../types";
import { motion } from "motion/react";

interface ResponseViewerProps {
  response: ApiResponse | null;
  loading: boolean;
}

export default function ResponseViewer({ response, loading }: ResponseViewerProps) {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-[#15181b] border border-[#24282c] rounded-xl p-6 select-none animate-pulse">
        <div className="w-8 h-8 border-3 border-[#ff6c37]/30 border-t-[#ff6c37] rounded-full animate-spin mb-3" />
        <span className="text-xs text-neutral-400 font-semibold tracking-wide">Executando Requisição HTTP...</span>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-[#15181b] border border-[#24282c] rounded-xl p-6 text-center select-none" id="response-viewer-empty">
        <ClipboardList className="w-10 h-10 text-neutral-500 mb-2" />
        <p className="text-xs font-bold text-neutral-300">Sem Resposta Ainda</p>
        <p className="text-[11px] text-neutral-500 mt-1 max-w-[320px]">
          Preencha os campos da requisição acima e clique em "Enviar" para disparar a chamada e visualizar a resposta do servidor aqui.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    try {
      const textToCopy = typeof response.body === "object" 
        ? JSON.stringify(response.body, null, 2) 
        : String(response.body);
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Copy fallback
    }
  };

  const handleDownload = () => {
    try {
      const dataStr = typeof response.body === "object"
        ? JSON.stringify(response.body, null, 2)
        : String(response.body);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `api-response-${response.status || "data"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // Download failed
    }
  };

  // Status Badge configurations
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (status >= 300 && status < 400) return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (status >= 400 && status < 500) return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    if (status >= 500 || status === 0) return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    return "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20";
  };

  // Format payload size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isSuccess = response && response.status > 0 && response.status < 400;
  const isClientError = response && response.status >= 400 && response.status < 500;
  const isServerError = response && (response.status >= 500 || response.status === 0);
  const isError = isClientError || isServerError;

  const containerBorderClass = isSuccess
    ? "border-emerald-500/80 ring-1 ring-emerald-500/20"
    : isClientError
      ? "border-amber-500/80 ring-1 ring-amber-500/20"
      : isServerError
        ? "border-rose-500/80 ring-1 ring-rose-500/20"
        : "border-[#24282c]";

  const animationKey = response ? `${response.status}-${response.time}` : 'empty';

  return (
    <motion.div
      key={animationKey}
      initial={{ scale: 0.99, opacity: 0.95 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: isError ? [0, -6, 6, -4, 4, 0] : 0,
        boxShadow: isSuccess
          ? [
              "0 0 0px rgba(16, 185, 129, 0)",
              "0 0 20px rgba(16, 185, 129, 0.45)",
              "0 0 0px rgba(16, 185, 129, 0)"
            ]
          : isClientError
            ? [
                "0 0 0px rgba(245, 158, 11, 0)",
                "0 0 20px rgba(245, 158, 11, 0.45)",
                "0 0 0px rgba(245, 158, 11, 0)"
              ]
            : isServerError
              ? [
                  "0 0 0px rgba(239, 68, 68, 0)",
                  "0 0 20px rgba(239, 68, 68, 0.45)",
                  "0 0 0px rgba(239, 68, 68, 0)"
                ]
              : "0 0 0px rgba(0,0,0,0)"
      }}
      transition={{
        duration: isError ? 0.45 : 0.35,
        ease: "easeOut"
      }}
      className={`bg-[#15181b] border ${containerBorderClass} rounded-xl flex flex-col h-full overflow-hidden`}
      id="response-pane"
    >
      {/* RESPONSE STATISTICS ACTION BAR */}
      <div className="bg-[#0c0e10] px-4 py-2 border-b border-[#1f2226] flex items-center justify-between select-none">
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-bold text-neutral-300">Resposta</span>
          
          {/* HTTP Status Code */}
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getStatusColor(response.status)}`}>
            {response.status === 0 ? "Erro de Conexão" : `${response.status} ${response.statusText || "OK"}`}
          </span>

          {/* Time taken */}
          <span className="bg-[#1c2024] text-neutral-300 px-2 py-0.5 rounded text-[10px] font-semibold font-mono border border-neutral-700/20">
            {response.time} ms
          </span>

          {/* Response payload size */}
          <span className="bg-[#1c2024] text-neutral-300 px-2 py-0.5 rounded text-[10px] font-semibold font-mono border border-neutral-700/20">
            {formatBytes(response.size)}
          </span>
        </div>

        {/* Copy & download tools */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#1c2024] rounded-lg transition"
            title="Copiar Corpo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={handleDownload}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#1c2024] rounded-lg transition"
            title="Baixar JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* RENDER VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#15181b]">
        <div className="h-full flex flex-col">
          {/* Content box - displays pretty formatted body */}
          <div className="flex-1">
            <div className={`bg-[#121416] text-neutral-200 border ${
              isSuccess 
                ? "border-emerald-500/30" 
                : isClientError
                  ? "border-amber-500/30"
                  : isServerError 
                    ? "border-rose-500/30" 
                    : "border-[#24282c]"
            } font-mono text-xs rounded-lg p-3 select-text overflow-x-auto whitespace-pre leading-relaxed h-full max-h-[400px]`}>
              {typeof response.body === "object" ? (
                JSON.stringify(response.body, null, 2)
              ) : (
                String(response.body)
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
