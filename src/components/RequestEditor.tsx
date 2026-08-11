import React, { useState, useEffect, useRef } from "react";
import { ApiRequest, KeyValueItem, MethodType, Environment } from "../types";
import KeyValueTable from "./KeyValueTable";
import { 
  Play as PlayIcon, 
  Plus as PlusIcon, 
  X as XIcon, 
  Code as CodeIcon, 
  Trash2 as Trash2Icon, 
  CheckSquare as CheckSquareIcon, 
  Square as SquareIcon, 
  Sparkles as SparklesIcon, 
  Globe as GlobeIcon, 
  RotateCcw as RotateCcwIcon, 
  PlusCircle as PlusCircleIcon, 
  Eye as EyeIcon, 
  Save as SaveIcon,
  Sliders as SlidersIcon, 
  ChevronDown as ChevronDownIcon,
  ChevronRight,
  Layers,
  Settings
} from "lucide-react";
import { motion } from "motion/react";

interface RequestEditorProps {
  tabs: ApiRequest[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab: () => void;
  onUpdateRequest: (updated: ApiRequest) => void;
  onSendRequest: () => void;
  onResetResponse?: () => void;
  loading: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function RequestEditor({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  onUpdateRequest,
  onSendRequest,
  onResetResponse,
  loading,
  isSidebarOpen = true,
  onToggleSidebar
}: RequestEditorProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isParamsModalOpen, setIsParamsModalOpen] = useState(false);
  const [isHeadersModalOpen, setIsHeadersModalOpen] = useState(false);
  const [isTestsModalOpen, setIsTestsModalOpen] = useState(false);

  const activeRequest = tabs.find((t) => t.id === activeTabId);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight + 8}px`;
    }
  }, [activeRequest?.bodyRaw, activeTabId]);

  // Parse URL query parameters into Request params list when URL changes
  useEffect(() => {
    if (!activeRequest) return;
    
    try {
      const urlString = activeRequest.url;
      if (!urlString.includes("?")) return;
      
      const queryString = urlString.split("?")[1];
      const urlParams = new URLSearchParams(queryString);
      
      const newParams: KeyValueItem[] = [];
      urlParams.forEach((value, key) => {
        newParams.push({
          id: Math.random().toString(36).substring(2, 9),
          key,
          value,
          enabled: true
        });
      });

      const currentKeysString = JSON.stringify(activeRequest.params.map(p => ({ k: p.key, v: p.value, e: p.enabled })));
      const newKeysString = JSON.stringify(newParams.map(p => ({ k: p.key, v: p.value, e: p.enabled })));

      if (currentKeysString !== newKeysString && newParams.length > 0) {
        const mergedParams = newParams.map(np => {
          const existing = activeRequest.params.find(ep => ep.key === np.key);
          return existing ? { ...np, id: existing.id, description: existing.description } : np;
        });
        
        onUpdateRequest({
          ...activeRequest,
          params: mergedParams
        });
      }
    } catch (e) {
      // url might have custom brackets, ignore parse errors
    }
  }, [activeRequest?.url]);

  const handleParamsChange = (updatedParams: KeyValueItem[]) => {
    if (!activeRequest) return;

    let baseUrl = activeRequest.url.split("?")[0];
    const enabledParams = updatedParams.filter((p) => p.enabled && p.key);

    if (enabledParams.length > 0) {
      const searchParams = new URLSearchParams();
      enabledParams.forEach((p) => searchParams.append(p.key, p.value));
      baseUrl = `${baseUrl}?${searchParams.toString()}`;
    }

    onUpdateRequest({
      ...activeRequest,
      url: baseUrl,
      params: updatedParams,
    });
  };

  const handleFormatJson = () => {
    if (!activeRequest || !activeRequest.bodyRaw) return;
    try {
      const parsed = JSON.parse(activeRequest.bodyRaw);
      const formatted = JSON.stringify(parsed, null, 2);
      onUpdateRequest({
        ...activeRequest,
        bodyRaw: formatted,
      });
      setJsonError(null);
    } catch (err: any) {
      setJsonError(`Invalid JSON: ${err.message}`);
    }
  };

  const handleResetRequest = () => {
    if (!activeRequest) return;
    onUpdateRequest({
      ...activeRequest,
      url: "https://deve-seis-integracao.voxtecnologia.com.br/v1",
      method: "GET",
      params: [],
      headers: [
        { id: "h1", key: "Content-Type", value: "application/json", enabled: true }
      ],
      bodyType: "none",
      bodyRaw: ""
    });
    if (onResetResponse) {
      onResetResponse();
    }
  };

  if (!activeRequest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#15181b] text-neutral-500 select-none border-b border-[#24282c] rounded-xl p-6">
        <CodeIcon className="w-12 h-12 mb-3 text-[#ff6c37]/50" />
        <h4 className="font-bold text-neutral-300 text-sm mb-1">Nenhuma requisição aberta</h4>
        <p className="text-xs text-neutral-500 max-w-sm text-center mb-4">
          Abra uma nova aba de teste de API para começar a disparar payloads e ver as respostas em tempo real.
        </p>
        <button
          onClick={onAddTab}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#ff6c37] hover:bg-[#e05624] text-white rounded-lg text-xs font-bold shadow-lg shadow-[#ff6c37]/10 transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Nova Requisição</span>
        </button>
      </div>
    );
  }

  const defaultTestsList = [
    { key: "status_200", label: "Status code is 200 OK", active: true },
    { key: "response_time", label: "Response time is less than 300ms", active: false },
    { key: "is_json", label: "Response content is JSON", active: true },
    { key: "has_data", label: "Response contains non-empty 'data' field", active: false },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#15181b] overflow-hidden border-b border-[#24282c]" id="request-builder">
      {/* TABS HEADER ROW */}
      <div className="flex items-center justify-between bg-[#0c0e10] border-b border-[#1f2226] h-10 px-1 select-none">
        <div className="flex items-center space-x-0.5 h-full overflow-x-auto scrollbar-none">
          {!isSidebarOpen && onToggleSidebar && (
            <motion.button
              type="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              title="Abrir barra lateral"
              className="p-1.5 my-auto ml-1 mr-1.5 bg-[#ff6c37]/15 hover:bg-[#ff6c37]/25 border border-[#ff6c37]/40 text-[#ff6c37] rounded-md transition-all flex items-center justify-center cursor-pointer flex-shrink-0 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              whileHover={{ backgroundColor: "rgba(21, 24, 27, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className={`group flex items-center space-x-2 h-full px-3 text-xs border-r border-[#1f2226] cursor-pointer select-none transition relative ${
                activeTabId === tab.id
                  ? "bg-[#15181b] text-white font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {/* Animated Tab Indicator Line */}
              {activeTabId === tab.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute top-0 left-0 right-0 h-[2px] bg-[#ff6c37]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              
              <span className={`text-[8px] px-1.5 py-0.5 font-bold rounded-full border uppercase tracking-wide flex-shrink-0 ${
                tab.method === "GET" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                tab.method === "POST" ? "bg-[#ff6c37]/10 text-[#ff6c37] border-[#ff6c37]/20" :
                tab.method === "PUT" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {tab.method}
              </span>
              <span className="max-w-[120px] truncate">{tab.name}</span>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="p-0.5 rounded-full hover:bg-neutral-800 text-neutral-500 hover:text-white transition"
                title="Close Tab"
              >
                <XIcon className="w-3 h-3" />
              </motion.button>
            </motion.div>
          ))}

          {/* Add Tab trigger */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(38, 38, 38, 0.5)" }}
            whileTap={{ scale: 0.9 }}
            onClick={onAddTab}
            className="p-1.5 ml-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition"
            title="Open New Tab"
          >
            <PlusIcon className="w-4 h-4" />
          </motion.button>
        </div>
      </div>



      {/* PRIMARY URL & METHOD EDITOR INPUT BAR */}
      <div className="p-3 border-b border-[#1f2226] flex flex-col space-y-2 bg-[#15181b]">
        {/* Row 1: Method Select & Fast Access Modals buttons */}
        <div className="flex border border-[#24282c] rounded-xl bg-[#121416] shadow-sm overflow-hidden h-9 items-center w-fit">
          {/* Method Select Wrapper */}
          <div className="relative h-full border-r border-[#24282c] bg-[#1c2024] hover:bg-[#24282c] transition rounded-l-xl flex items-center min-w-[105px]">
            <select
              value={activeRequest.method}
              onChange={(e) => onUpdateRequest({ ...activeRequest, method: e.target.value as MethodType })}
              className="appearance-none bg-transparent pl-4 pr-7 text-xs font-black h-full w-full focus:outline-none cursor-pointer transition select-none rounded-l-xl text-left"
              style={{
                color: activeRequest.method === "GET" ? "#10b981" : // emerald-500
                       activeRequest.method === "POST" ? "#ff6c37" : // orange
                       activeRequest.method === "PUT" ? "#3b82f6" : // blue-500
                       activeRequest.method === "DELETE" ? "#f43f5e" : // rose-500
                       activeRequest.method === "PATCH" ? "#a855f7" : // purple-500
                       "#a3a3a3"
              }}
            >
              <option value="GET" className="bg-[#121416] text-[#10b981]">GET</option>
              <option value="POST" className="bg-[#121416] text-[#ff6c37]">POST</option>
              <option value="PUT" className="bg-[#121416] text-[#3b82f6]">PUT</option>
              <option value="DELETE" className="bg-[#121416] text-[#f43f5e]">DELETE</option>
              <option value="PATCH" className="bg-[#121416] text-[#a855f7]">PATCH</option>
              <option value="OPTIONS" className="bg-[#121416] text-neutral-400">OPTIONS</option>
            </select>
            <div className="absolute right-2.5 pointer-events-none flex items-center">
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#ff6c37]" />
            </div>
          </div>

          {/* Toggle buttons directly inside URL bar area for fast access */}
          <button
            type="button"
            onClick={() => setIsParamsModalOpen(true)}
            className="px-4 h-full bg-[#1c2024] border-r border-[#24282c] text-xs font-bold transition flex items-center gap-1.5 text-neutral-300 hover:text-neutral-100 hover:bg-[#24282c] select-none"
          >
            <SlidersIcon className="w-3.5 h-3.5 text-[#ff6c37]" />
            <span>Parâmetros</span>
            {activeRequest.params.length > 0 && (
              <span className="bg-[#ff6c37]/20 text-[#ff6c37] border border-[#ff6c37]/30 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {activeRequest.params.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsHeadersModalOpen(true)}
            className="px-4 h-full bg-[#1c2024] border-r border-[#24282c] text-xs font-bold transition flex items-center gap-1.5 text-neutral-300 hover:text-neutral-100 hover:bg-[#24282c] select-none"
          >
            <GlobeIcon className="w-3.5 h-3.5 text-[#ff6c37]" />
            <span>Headers</span>
            {activeRequest.headers.length > 0 && (
              <span className="bg-[#ff6c37]/20 text-[#ff6c37] border border-[#ff6c37]/30 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {activeRequest.headers.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsTestsModalOpen(true)}
            className="px-4 h-full bg-[#1c2024] text-xs font-bold transition flex items-center gap-1.5 text-neutral-300 hover:text-neutral-100 hover:bg-[#24282c] select-none rounded-r-xl"
          >
            <CheckSquareIcon className="w-3.5 h-3.5 text-[#ff6c37]" />
            <span>Asserções</span>
          </button>
        </div>

        {/* Row 2: URL Input */}
        <div className="flex border border-[#24282c] rounded-xl bg-[#121416] focus-within:ring-1 focus-within:ring-[#ff6c37]/50 shadow-sm overflow-hidden h-9 items-center w-full">
          <div className="bg-[#1c2024] px-4 text-[10px] font-mono text-neutral-400 border-r border-[#24282c] h-full flex items-center select-none font-bold uppercase tracking-wider">
            URL
          </div>
          <input
            type="text"
            value={activeRequest.url}
            onChange={(e) => onUpdateRequest({ ...activeRequest, url: e.target.value })}
            placeholder="Insira a URL de requisição (ex: {{base_url}}/api/v1/users/profile)"
            className="flex-1 px-3 py-1.5 font-mono text-xs text-neutral-100 bg-transparent focus:outline-none placeholder-neutral-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSendRequest();
            }}
          />
        </div>
      </div>

      {/* PRIMARY REQUEST BODY PANEL */}
      <div className="flex-1 p-4 bg-[#15181b] overflow-y-auto no-scrollbar flex flex-col min-h-0">
        <div className="flex flex-col w-full h-auto">
          {/* Actions banner */}
          <div className="flex flex-col items-start gap-1.5 mb-2 flex-shrink-0">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
              Corpo do JSON
            </span>
            <button
              type="button"
              onClick={handleFormatJson}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-[#1c2024] hover:bg-[#24282c] border border-[#24282c] text-neutral-300 hover:text-neutral-100 font-bold rounded-md transition shadow-xs select-none"
            >
              <SparklesIcon className="w-3 h-3 text-[#ff6c37]" />
              <span>Formatar JSON</span>
            </button>
          </div>

          <div className="flex gap-3 w-full pb-3 items-stretch">
            {/* Sidebar Buttons */}
            <div className="flex flex-col gap-2 w-8 flex-shrink-0 select-none justify-start pt-1 items-center">
              {/* Send Button */}
              <button
                type="button"
                onClick={onSendRequest}
                disabled={loading}
                title="Enviar requisição"
                className={`w-8 h-8 bg-[#ff6c37] hover:bg-[#e05624] text-white rounded-full flex items-center justify-center transition shadow-lg shadow-[#ff6c37]/10 select-none ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <PlayIcon className="w-3.5 h-3.5 fill-white text-white translate-x-[0.5px]" />
                )}
              </button>

              {/* Preview button */}
              <button
                type="button"
                onClick={onSendRequest}
                title="Visualizar"
                className="w-8 h-8 bg-[#1c2024] hover:bg-[#24282c] border border-neutral-700/30 text-neutral-300 rounded-full flex items-center justify-center transition"
              >
                <EyeIcon className="w-3.5 h-3.5" />
              </button>

              {/* Add to Collection */}
              <button
                type="button"
                onClick={() => alert("Adicionado à coleção temporária com sucesso!")}
                title="Salvar"
                className="w-8 h-8 bg-[#1c2024] hover:bg-[#24282c] border border-neutral-700/30 text-neutral-300 rounded-full flex items-center justify-center transition"
              >
                <SaveIcon className="w-3.5 h-3.5" />
              </button>

              {/* Reset Request */}
              <button
                type="button"
                onClick={handleResetRequest}
                title="Resetar"
                className="w-8 h-8 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center transition"
              >
                <RotateCcwIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* JSON Area */}
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={activeRequest.bodyRaw}
                onChange={(e) => {
                  onUpdateRequest({ ...activeRequest, bodyRaw: e.target.value, bodyType: "raw-json" });
                  if (jsonError) setJsonError(null);
                }}
                placeholder="Informar o JSON"
                className="w-full min-h-[160px] bg-[#121416] text-neutral-200 font-mono text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#ff6c37] leading-relaxed border border-[#24282c] resize-none overflow-hidden no-scrollbar"
              />
            </div>
          </div>

          {jsonError && (
            <div className="mt-2 text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-lg p-2 font-semibold flex-shrink-0">
              {jsonError}
            </div>
          )}

          {/* Small bottom spacer to guarantee slight breathing room without empty gaps */}
          <div className="h-3 w-full flex-shrink-0" />
        </div>
      </div>

      {/* MODALS */}
      {/* Params Modal */}
      {isParamsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsParamsModalOpen(false)}
          />
          <div className="relative bg-[#15181b] border border-[#24282c] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#24282c] flex items-center justify-between bg-[#0c0e10]/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-[#ff6c37]/10 rounded-lg">
                  <SlidersIcon className="w-4 h-4 text-[#ff6c37]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">Parâmetros de Query (Query Params)</h3>
                  <p className="text-[10px] text-neutral-400">Parâmetros adicionados à URL da requisição (ex: ?chave=valor)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsParamsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <KeyValueTable
                items={activeRequest.params}
                onChange={handleParamsChange}
                placeholderKey="Chave do parâmetro"
                placeholderValue="Valor do parâmetro"
              />
            </div>
            <div className="px-5 py-3.5 bg-[#0c0e10]/40 border-t border-[#24282c] flex justify-end">
              <button
                onClick={() => setIsParamsModalOpen(false)}
                className="h-8 px-4 bg-[#ff6c37] hover:bg-[#e05624] text-white text-xs font-bold rounded-lg transition"
              >
                Salvar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Headers Modal */}
      {isHeadersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsHeadersModalOpen(false)}
          />
          <div className="relative bg-[#15181b] border border-[#24282c] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#24282c] flex items-center justify-between bg-[#0c0e10]/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-[#ff6c37]/10 rounded-lg">
                  <GlobeIcon className="w-4 h-4 text-[#ff6c37]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">Cabeçalhos HTTP (Request Headers)</h3>
                  <p className="text-[10px] text-neutral-400">Metadados customizados enviados com a requisição</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsHeadersModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <KeyValueTable
                items={activeRequest.headers}
                onChange={(updated) => onUpdateRequest({ ...activeRequest, headers: updated })}
                placeholderKey="Header Key"
                placeholderValue="Header Value"
              />
            </div>
            <div className="px-5 py-3.5 bg-[#0c0e10]/40 border-t border-[#24282c] flex justify-end">
              <button
                onClick={() => setIsHeadersModalOpen(false)}
                className="h-8 px-4 bg-[#ff6c37] hover:bg-[#e05624] text-white text-xs font-bold rounded-lg transition"
              >
                Salvar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tests Modal */}
      {isTestsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsTestsModalOpen(false)}
          />
          <div className="relative bg-[#15181b] border border-[#24282c] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#24282c] flex items-center justify-between bg-[#0c0e10]/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-[#ff6c37]/10 rounded-lg">
                  <CheckSquareIcon className="w-4 h-4 text-[#ff6c37]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">Assertivas Automáticas (Auto Assertions)</h3>
                  <p className="text-[10px] text-neutral-400">Testes automatizados executados imediatamente após a resposta</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTestsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="bg-[#121416] p-3.5 rounded-xl border border-[#24282c] text-xs text-neutral-400 leading-relaxed mb-1">
                Ao finalizar a requisição, as seguintes asserções serão rodadas automaticamente. Você poderá verificar os logs e os status na aba de resposta abaixo.
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                  Asserções Ativas
                </span>
                
                {defaultTestsList.map((test) => (
                  <div key={test.key} className="flex items-center space-x-3 p-2.5 border border-[#24282c] rounded-xl bg-[#121416] hover:bg-neutral-800/20 transition text-xs">
                    <CheckSquareIcon className="w-4 h-4 text-[#ff6c37] flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-neutral-200">{test.label}</span>
                      <span className="text-[10px] text-neutral-500 block font-mono font-normal">
                        {`pm.test("${test.label}", () => pm.expect(res.status).toBe(...))`}
                      </span>
                    </div>
                    <span className="text-[9px] bg-[#ff6c37]/10 text-[#ff6c37] border border-[#ff6c37]/20 rounded-md px-1.5 py-0.2 uppercase tracking-wide font-extrabold">
                      Auto
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-3.5 bg-[#0c0e10]/40 border-t border-[#24282c] flex justify-end">
              <button
                onClick={() => setIsTestsModalOpen(false)}
                className="h-8 px-4 bg-[#ff6c37] hover:bg-[#e05624] text-white text-xs font-bold rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
