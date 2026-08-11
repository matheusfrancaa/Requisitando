import React from "react";
import { 
  History, 
  Search, 
  Layers, 
  Trash2, 
  ChevronLeft
} from "lucide-react";
import { ApiRequest, Collection, HistoryItem, MethodType } from "../types";

interface SidebarProps {
  history: HistoryItem[];
  onSelectRequest: (request: ApiRequest) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  activeRequestId?: string;
  onOpenMockServersDocs?: () => void;
  width?: number;
  isOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function Sidebar({
  history,
  onSelectRequest,
  onDeleteHistoryItem,
  onClearHistory,
  activeRequestId,
  width = 288,
  isOpen = true,
  onToggleSidebar
}: SidebarProps) {
  const [searchFilter, setSearchFilter] = React.useState("");

  const getMethodBadgeColor = (method: MethodType) => {
    switch (method) {
      case "GET":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "POST":
        return "bg-[#ff6c37]/10 text-[#ff6c37] border border-[#ff6c37]/20";
      case "PUT":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "DELETE":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20";
    }
  };

  const filteredHistory = history.filter(item => 
    item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.url.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <aside 
      style={{ width: `${width}px`, minWidth: `${width}px` }}
      className="bg-[#0c0e10] flex flex-col h-full select-none flex-shrink-0" 
      id="sidebar"
    >
      {/* Workspace Header */}
      <div className="p-3 border-b border-[#1f2226] bg-[#0c0e10] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#ff6c37]" />
          <span className="font-bold text-xs text-neutral-100 tracking-tight">Minhas Requisições</span>
        </div>

        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Recolher barra lateral"
            className="p-1 rounded-md bg-[#ff6c37]/15 hover:bg-[#ff6c37]/25 border border-[#ff6c37]/40 text-[#ff6c37] hover:text-[#ff6c37] transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter request Input */}
      <div className="p-2 border-b border-[#1f2226] bg-[#0c0e10]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Filtrar requisições..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-[#121416] border border-[#24282c] text-[11px] rounded-lg py-1.5 pl-8 pr-6 focus:outline-none focus:ring-1 focus:ring-[#ff6c37]/50 placeholder-neutral-500 text-neutral-200"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter("")}
              className="text-[10px] text-neutral-400 hover:text-neutral-200 absolute right-2.5 top-1.5 font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main sidebar content */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {/* HISTORY LIST */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
              <span>Execuções Recentes</span>
              <button 
                onClick={onClearHistory}
                className="text-[9px] text-neutral-500 hover:text-red-400 font-normal normal-case transition"
              >
                Limpar tudo
              </button>
            </div>
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs relative ${
                  activeRequestId === item.requestConfig.id
                    ? "bg-[#15181b] border border-[#24282c] shadow-lg text-white font-semibold"
                    : "hover:bg-neutral-800/40 text-neutral-300"
                }`}
                onClick={() => onSelectRequest(item.requestConfig)}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-center flex-shrink-0 w-11 ${getMethodBadgeColor(item.method)}`}>
                    {item.method}
                  </span>
                  <div className="truncate text-left">
                    <div className="font-semibold truncate">{item.name}</div>
                    <div className="text-[9px] text-neutral-500 font-mono truncate">{item.url}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 pl-1">
                  {item.status !== undefined && (
                    <span className={`text-[9px] font-mono font-bold ${
                      item.status >= 200 && item.status < 300 
                        ? "text-emerald-400" 
                        : item.status >= 300 && item.status < 400
                          ? "text-blue-400"
                          : item.status >= 400 && item.status < 500
                            ? "text-amber-400"
                            : "text-rose-400"
                    }`}>
                      {item.status === 0 ? "ERR" : item.status}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition"
                    title="Excluir do histórico"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500 text-xs">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-500" />
            <p>Nenhuma requisição recente</p>
          </div>
        )}
      </div>
    </aside>
  );
}
