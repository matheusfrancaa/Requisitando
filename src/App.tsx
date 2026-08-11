import React, { useState, useEffect } from "react";
import { 
  ApiRequest, 
  ApiResponse, 
  Environment, 
  Collection, 
  HistoryItem,
  KeyValueItem
} from "./types";
import { 
  initialEnvironments, 
  initialRequests, 
  initialCollections, 
  initialHistory 
} from "./data/initialData";
import { dispatchClientSideRequest } from "./lib/clientDispatcher";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import RequestEditor from "./components/RequestEditor";
import ResponseViewer from "./components/ResponseViewer";
import EnvironmentModal from "./components/EnvironmentModal";
import MockServerDocs from "./components/MockServerDocs";
import { motion, AnimatePresence } from "motion/react";
import { 
  Network, 
  ShieldCheck, 
  Activity, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Server, 
  RefreshCw,
  History
} from "lucide-react";

export default function App() {
  // Navigation tabs (workspaces, network, reports)
  const [activeHeaderTab, setActiveHeaderTab] = useState("workspaces");

  // Environmental variable configurations
  const [environments, setEnvironments] = useState<Environment[]>(() => {
    const saved = localStorage.getItem("req_environments");
    return saved ? JSON.parse(saved) : initialEnvironments;
  });
  const [selectedEnvId, setSelectedEnvId] = useState<string>(() => {
    const saved = localStorage.getItem("req_selectedEnvId");
    return saved ? JSON.parse(saved) : "env-local";
  });

  // Collections & request definitions
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem("req_collections");
    return saved ? JSON.parse(saved) : initialCollections;
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("req_history");
    return saved ? JSON.parse(saved) : initialHistory;
  });

  // Workspace tab controls
  const [tabs, setTabs] = useState<ApiRequest[]>(() => {
    const saved = localStorage.getItem("req_tabs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // filter out "User Settings" / "req-settings" to satisfy user request "fechar esse User Settings"
        return parsed.filter((t: any) => t.id !== "req-settings" && t.name !== "User Settings");
      } catch (e) {
        // fallback
      }
    }
    return [initialRequests[0]];
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const saved = localStorage.getItem("req_activeTabId");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed === "req-settings") return "req-login";
        return parsed;
      } catch (e) {}
    }
    return "req-login";
  });

  // Cache responses by tab ID
  const [tabResponses, setTabResponses] = useState<Record<string, ApiResponse>>(() => {
    const saved = localStorage.getItem("req_tabResponses");
    return saved ? JSON.parse(saved) : {};
  });
  const [loading, setLoading] = useState(false);

  // Modals & Panels visibility state
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isMockDocsOpen, setIsMockDocsOpen] = useState(false);
  const [historyPromptRequest, setHistoryPromptRequest] = useState<ApiRequest | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("req_isSidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("req_isSidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // Resizable layout state
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem("req_sidebarWidth");
    return saved ? parseInt(saved, 10) : 230;
  });
  const [topHeightPercent, setTopHeightPercent] = useState<number>(() => {
    const saved = localStorage.getItem("req_topHeightPercent");
    return saved ? parseInt(saved, 10) : 55;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingSplit, setIsResizingSplit] = useState(false);

  // Mouse & Touch events handler for resizes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        const newWidth = Math.max(180, Math.min(480, e.clientX));
        setSidebarWidth(newWidth);
      }
      if (isResizingSplit) {
        const mainContainer = document.getElementById("main-workspace-container");
        if (mainContainer) {
          const rect = mainContainer.getBoundingClientRect();
          const relativeY = e.clientY - rect.top;
          const percentage = Math.max(20, Math.min(80, (relativeY / rect.height) * 100));
          setTopHeightPercent(percentage);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingSplit(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      if (isResizingSidebar) {
        const newWidth = Math.max(180, Math.min(480, touch.clientX));
        setSidebarWidth(newWidth);
      }
      if (isResizingSplit) {
        const mainContainer = document.getElementById("main-workspace-container");
        if (mainContainer) {
          const rect = mainContainer.getBoundingClientRect();
          const relativeY = touch.clientY - rect.top;
          const percentage = Math.max(20, Math.min(80, (relativeY / rect.height) * 100));
          setTopHeightPercent(percentage);
        }
      }
    };

    if (isResizingSidebar || isResizingSplit) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isResizingSidebar, isResizingSplit]);

  // Sync state variables with localStorage to persist user configurations
  useEffect(() => {
    localStorage.setItem("req_environments", JSON.stringify(environments));
  }, [environments]);

  useEffect(() => {
    localStorage.setItem("req_selectedEnvId", JSON.stringify(selectedEnvId));
  }, [selectedEnvId]);

  useEffect(() => {
    localStorage.setItem("req_collections", JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem("req_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("req_tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem("req_activeTabId", JSON.stringify(activeTabId));
  }, [activeTabId]);

  useEffect(() => {
    localStorage.setItem("req_tabResponses", JSON.stringify(tabResponses));
  }, [tabResponses]);

  useEffect(() => {
    localStorage.setItem("req_sidebarWidth", String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem("req_topHeightPercent", String(topHeightPercent));
  }, [topHeightPercent]);

  // Metrics for report tabulation
  const [reportsData, setReportsData] = useState({
    totalSent: 12,
    passedAssertions: 24,
    totalAssertions: 24,
    averageTimeMs: 125,
    methodCount: { GET: 5, POST: 4, PUT: 2, DELETE: 1 } as Record<string, number>,
  });

  // Resolve base URL and env variables on startup or env change
  const resolveVariables = (text: string): string => {
    if (!text) return "";
    let resolved = text;
    const activeEnv = environments.find((e) => e.id === selectedEnvId) || environments[0];
    if (activeEnv) {
      activeEnv.variables.forEach((v) => {
        if (v.enabled) {
          let value = v.value;
          // Fallback empty base_url to current window origin so mock API is functional automatically
          if (v.key === "base_url" && !value) {
            value = window.location.origin;
          }
          const regex = new RegExp(`{{\\s*${v.key}\\s*}}`, "g");
          resolved = resolved.replace(regex, value);
        }
      });
    }
    return resolved;
  };

  // Switch tabs
  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
  };

  // Close request tab
  const handleCloseTab = (id: string) => {
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    
    // Switch active tab if current was closed
    if (activeTabId === id && remaining.length > 0) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  // Add a clean standard GET tab
  const handleAddTab = () => {
    const newId = "req-new-" + Math.random().toString(36).substring(2, 9);
    const newRequest: ApiRequest = {
      id: newId,
      name: "New Request",
      method: "GET",
      url: "{{base_url}}/api/v1/users/profile",
      params: [],
      headers: [],
      bodyType: "none",
      bodyRaw: "",
    };
    setTabs([...tabs, newRequest]);
    setActiveTabId(newId);
  };

  // Update current active request configuration
  const handleUpdateRequest = (updated: ApiRequest) => {
    setTabs(tabs.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Select request from sidebar (History / Collections)
  const handleSelectRequest = (req: ApiRequest) => {
    // Open prompt modal asking if user wants to load history request
    setHistoryPromptRequest(req);
  };

  const confirmLoadHistoryRequest = (req: ApiRequest) => {
    const existing = tabs.find((t) => t.id === req.id || (t.url === req.url && t.method === req.method));
    if (existing) {
      // Update existing tab with history parameters
      setTabs(tabs.map(t => t.id === existing.id ? { ...req, id: existing.id } : t));
      setActiveTabId(existing.id);
    } else {
      // Open in a new tab
      const tabId = req.id || "req-" + Math.random().toString(36).substring(2, 9);
      const newTab = { ...req, id: tabId };
      setTabs([...tabs, newTab]);
      setActiveTabId(tabId);
    }
  };

  // Load request from mock server documentation drawer
  const handleLoadRequestFromDocs = (req: ApiRequest) => {
    handleSelectRequest(req);
    setIsMockDocsOpen(false);
  };

  // Add new folder/collection
  const handleAddCollection = () => {
    const name = prompt("Enter Collection Name:", "Staging Services");
    if (!name) return;
    const newCollection: Collection = {
      id: "coll-" + Math.random().toString(36).substring(2, 9),
      name,
      requests: [],
    };
    setCollections([...collections, newCollection]);
  };

  // Add new request definition inside collection
  const handleAddRequestToCollection = (collectionId?: string) => {
    const name = prompt("Enter Request Name:", "Custom Get Info");
    if (!name) return;
    const targetCollId = collectionId || collections[0]?.id;
    if (!targetCollId) return;

    const newRequest: ApiRequest = {
      id: "req-" + Math.random().toString(36).substring(2, 9),
      name,
      method: "GET",
      url: "{{base_url}}/api/v1/users/profile",
      params: [],
      headers: [],
      bodyType: "none",
      bodyRaw: "",
      collectionId: targetCollId
    };

    setCollections(collections.map(c => {
      if (c.id === targetCollId) {
        return { ...c, requests: [...c.requests, newRequest] };
      }
      return c;
    }));

    // Instantly open the newly created request
    handleSelectRequest(newRequest);
  };

  // Delete history item
  const handleDeleteHistoryItem = (id: string) => {
    setHistory(history.filter(h => h.id !== id));
  };

  // Clear history list
  const handleClearHistory = () => {
    setHistory([]);
  };

  // Perform actual request execution through server-side secure CORS proxy!
  const handleSendRequest = async () => {
    const activeRequest = tabs.find((t) => t.id === activeTabId);
    if (!activeRequest) return;

    setLoading(true);

    try {
      // 1. Substitute variables in URL
      const resolvedUrl = resolveVariables(activeRequest.url);
      
      // 2. Build headers object from enabled items (resolving variable blocks)
      const reqHeaders: Record<string, string> = {};
      activeRequest.headers.forEach((h) => {
        if (h.enabled && h.key) {
          reqHeaders[h.key] = resolveVariables(h.value);
        }
      });

      // 3. Resolve body content if present
      let resolvedBody: any = undefined;
      if (activeRequest.bodyType !== "none" && activeRequest.bodyRaw) {
        const substitutedBody = resolveVariables(activeRequest.bodyRaw);
        if (activeRequest.bodyType === "raw-json") {
          try {
            resolvedBody = JSON.parse(substitutedBody);
          } catch (e) {
            resolvedBody = substitutedBody; // Fallback as raw text if JSON is malformed
          }
        } else {
          resolvedBody = substitutedBody;
        }
      }

      // 4. Send request through our secure /api/proxy endpoint, fallback to client dispatcher if 404/static host
      let responseData: ApiResponse;

      try {
        const proxyResponse = await fetch("/api/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: resolvedUrl,
            method: activeRequest.method,
            headers: reqHeaders,
            body: resolvedBody,
          }),
        });

        if (proxyResponse.ok) {
          responseData = await proxyResponse.json();
        } else {
          // If proxy is missing or returning 404 (e.g., static hosting like Netlify), use client-side dispatcher
          responseData = await dispatchClientSideRequest(
            resolvedUrl,
            activeRequest.method,
            reqHeaders,
            resolvedBody
          );
        }
      } catch (err) {
        // Network error trying to reach /api/proxy -> use client-side dispatcher
        responseData = await dispatchClientSideRequest(
          resolvedUrl,
          activeRequest.method,
          reqHeaders,
          resolvedBody
        );
      }

      // 5. Cache response for this active tab
      setTabResponses((prev) => ({
        ...prev,
        [activeRequest.id]: responseData,
      }));

      // 6. Append this run to the workspace History log
      const shortUrl = activeRequest.url.replace("{{base_url}}", "");
      const newHistoryItem: HistoryItem = {
        id: "hist-" + Math.random().toString(36).substring(2, 9),
        name: activeRequest.name,
        method: activeRequest.method,
        url: shortUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: responseData.status,
        time: responseData.time,
        requestConfig: { ...activeRequest }, // Clone request snapshot
      };
      setHistory((prev) => [newHistoryItem, ...prev]);

      // 7. Update metrics reports state dynamically
      setReportsData((prev) => {
        const updatedCounts = { ...prev.methodCount };
        updatedCounts[activeRequest.method] = (updatedCounts[activeRequest.method] || 0) + 1;

        // Auto audit simple tests
        const is200 = responseData.status === 200;
        const isJson = typeof responseData.body === "object";
        const passedTestsCount = (is200 ? 1 : 0) + (isJson ? 1 : 0) + (responseData.time < 300 ? 1 : 0);

        return {
          totalSent: prev.totalSent + 1,
          passedAssertions: prev.passedAssertions + passedTestsCount,
          totalAssertions: prev.totalAssertions + 3,
          averageTimeMs: Math.round((prev.averageTimeMs * prev.totalSent + responseData.time) / (prev.totalSent + 1)),
          methodCount: updatedCounts,
        };
      });

    } catch (error: any) {
      // Handle network connection failures
      const errorResponse: ApiResponse = {
        status: 0,
        statusText: "Network Error",
        headers: {},
        body: {
          error: "Failed to dispatch request",
          message: error.message || "The sandbox container refused or could not forward the request.",
          tip: "Ensure your server dev server is running, base_url is resolved, and the internet network connection is active."
        },
        time: 0,
        size: 0,
      };

      setTabResponses((prev) => ({
        ...prev,
        [activeRequest.id]: errorResponse,
      }));

      // Append failed attempt to the workspace History log
      const shortUrl = activeRequest.url.replace("{{base_url}}", "");
      const newHistoryItem: HistoryItem = {
        id: "hist-" + Math.random().toString(36).substring(2, 9),
        name: activeRequest.name,
        method: activeRequest.method,
        url: shortUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 0,
        time: 0,
        requestConfig: { ...activeRequest }, // Clone request snapshot
      };
      setHistory((prev) => [newHistoryItem, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const currentTabResponse = tabResponses[activeTabId] || null;

  const startSidebarResize = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  };

  const startSplitResize = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizingSplit(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0c0e] text-[#e3e6e8] font-sans antialiased overflow-hidden">
      {/* HEADER SECTION */}
      <Header 
        userEmail="matheus.franca@voxtecnologia.com.br" 
      />

      {/* MAIN WORKSPACE VIEW */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR CONTROLS & RESIZER ANIMATED WRAPPER */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.div
              key="sidebar-container"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: sidebarWidth + 5, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={
                isResizingSidebar
                  ? { duration: 0 }
                  : { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }
              }
              className="h-full flex flex-shrink-0 overflow-hidden"
            >
              <Sidebar
                history={history}
                onSelectRequest={handleSelectRequest}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onClearHistory={handleClearHistory}
                activeRequestId={activeTabId}
                onOpenMockServersDocs={() => setIsMockDocsOpen(true)}
                width={sidebarWidth}
                isOpen={true}
                onToggleSidebar={() => setIsSidebarOpen(false)}
              />

              {/* VERTICAL DRAG HANDLE (SIDEBAR RESIZER) */}
              <div
                onMouseDown={startSidebarResize}
                onTouchStart={startSidebarResize}
                className={`w-[5px] hover:w-[7px] bg-[#1f2226] hover:bg-[#ff6c37]/70 transition-colors cursor-col-resize h-full flex-shrink-0 relative flex items-center justify-center select-none ${
                  isResizingSidebar ? "bg-[#ff6c37] w-[7px]" : ""
                }`}
                title="Arraste para redimensionar lateral"
              >
                {/* Subtle grab dots inside handle */}
                <div className="flex flex-col gap-1 pointer-events-none opacity-40 group-hover:opacity-100">
                  <div className="w-[2px] h-[2px] rounded-full bg-neutral-400" />
                  <div className="w-[2px] h-[2px] rounded-full bg-neutral-400" />
                  <div className="w-[2px] h-[2px] rounded-full bg-neutral-400" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN EDITING WORKSPACE CONTAINER */}
        <main 
          id="main-workspace-container"
          className="flex-1 flex flex-col min-w-0 bg-[#0a0c0e] p-3 overflow-hidden"
        >
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* TOP ROW: Request Config Panel */}
            <div 
              style={{ height: `${topHeightPercent}%` }}
              className="flex-shrink-0 flex flex-col bg-[#15181b] rounded-xl border border-[#24282c] overflow-hidden shadow-lg min-h-[160px]"
            >
              <RequestEditor
                tabs={tabs}
                activeTabId={activeTabId}
                onSelectTab={handleSelectTab}
                onCloseTab={handleCloseTab}
                onAddTab={handleAddTab}
                onUpdateRequest={handleUpdateRequest}
                onSendRequest={handleSendRequest}
                onResetResponse={() => {
                  setTabResponses((prev) => {
                    const next = { ...prev };
                    delete next[activeTabId];
                    return next;
                  });
                }}
                loading={loading}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
              />
            </div>

            {/* HORIZONTAL DRAG HANDLE (SPLIT RESIZER) */}
            <div
              onMouseDown={startSplitResize}
              onTouchStart={startSplitResize}
              className={`h-[10px] hover:h-[14px] bg-transparent hover:bg-[#ff6c37]/10 transition-all cursor-row-resize my-1 rounded-lg flex items-center justify-center select-none relative group ${
                isResizingSplit ? "bg-[#ff6c37]/20" : ""
              }`}
              title="Arraste para redimensionar vertical"
            >
              <div className="w-14 h-[4px] rounded-full bg-[#1f2226] group-hover:bg-[#ff6c37] transition-colors flex items-center justify-center gap-0.5">
                <div className="w-[1.5px] h-[1.5px] rounded-full bg-neutral-400" />
                <div className="w-[1.5px] h-[1.5px] rounded-full bg-neutral-400" />
                <div className="w-[1.5px] h-[1.5px] rounded-full bg-neutral-400" />
              </div>
            </div>

            {/* BOTTOM ROW: Response Inspector Panel */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-[120px]">
              <ResponseViewer 
                response={currentTabResponse} 
                loading={loading} 
              />
            </div>

          </div>
        </main>
      </div>

      {/* GLOBAL MODALS */}
      <EnvironmentModal
        isOpen={isEnvModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        environments={environments}
        onChange={setEnvironments}
      />

      <MockServerDocs
        isOpen={isMockDocsOpen}
        onClose={() => setIsMockDocsOpen(false)}
        onLoadRequest={handleLoadRequestFromDocs}
      />

      {/* HISTORY LOAD CONFIRMATION MODAL */}
      {historyPromptRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121416] border border-[#ff6c37]/50 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4 text-neutral-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff6c37]/15 border border-[#ff6c37]/40 text-[#ff6c37] flex items-center justify-center font-bold flex-shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Carregar Requisição do Histórico</h3>
                <p className="text-xs text-neutral-400">Deseja que retorne essas informações para a tela de requisição?</p>
              </div>
            </div>

            <div className="bg-[#0c0e10] p-3 rounded-lg border border-[#24282c] font-mono text-xs space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-center ${
                  historyPromptRequest.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                  historyPromptRequest.method === 'POST' ? 'bg-[#ff6c37]/20 text-[#ff6c37]' :
                  historyPromptRequest.method === 'PUT' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  {historyPromptRequest.method}
                </span>
                <span className="text-neutral-200 font-semibold truncate text-[11px] font-sans">{historyPromptRequest.name}</span>
              </div>
              <div className="text-[10px] text-neutral-400 truncate pl-0.5">
                {historyPromptRequest.url}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setHistoryPromptRequest(null)}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmLoadHistoryRequest(historyPromptRequest);
                  setHistoryPromptRequest(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#ff6c37] hover:bg-[#e05b28] text-white shadow-lg shadow-[#ff6c37]/20 transition flex items-center space-x-2 cursor-pointer active:scale-95"
              >
                <span>Retornar Informações</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
