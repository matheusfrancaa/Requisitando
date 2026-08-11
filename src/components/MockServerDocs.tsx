import React from "react";
import { X, Play, Copy, Server, Check, Key } from "lucide-react";
import { ApiRequest, MethodType } from "../types";

interface MockServerDocsProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRequest: (req: ApiRequest) => void;
}

export default function MockServerDocs({ isOpen, onClose, onLoadRequest }: MockServerDocsProps) {
  if (!isOpen) return null;

  const mockEndpoints: {
    name: string;
    method: MethodType;
    path: string;
    description: string;
    bodySample?: string;
    responseSample: string;
    requestConfig: ApiRequest;
  }[] = [
    {
      name: "Autenticação Login",
      method: "POST",
      path: "/api/v1/auth/login",
      description: "Autentica usuários utilizando um banco de dados simulado. Retorna um token JWT para autorizar as demais chamadas.",
      bodySample: JSON.stringify({
        username: "admin_user",
        password: "SecureP@ssw0rd!"
      }, null, 2),
      responseSample: JSON.stringify({
        status: "success",
        data: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          expires_in: 3600,
          user: {
            id: 84920,
            username: "admin_user",
            roles: ["admin", "editor"],
            is_active: true
          }
        }
      }, null, 2),
      requestConfig: {
        id: "req-login",
        name: "Autenticação Login",
        method: "POST",
        url: "{{base_url}}/api/v1/auth/login",
        params: [],
        headers: [
          { id: "h1", key: "Content-Type", value: "application/json", enabled: true }
        ],
        bodyType: "raw-json",
        bodyRaw: JSON.stringify({ username: "{{username}}", password: "{{password}}", device_info: { client_id: "web_app_v2", os_type: "macOS" } }, null, 2),
      }
    },
    {
      name: "Configurações",
      method: "PUT",
      path: "/api/v1/users/settings",
      description: "Atualiza visualizações personalizadas ou triggers no banco de dados simulado.",
      bodySample: JSON.stringify({
        theme: "dark",
        notifications: {
          email: true,
          push: false
        }
      }, null, 2),
      responseSample: JSON.stringify({
        status: "success",
        message: "Settings updated successfully",
        data: {
          theme: "dark",
          notifications: {
            email: true,
            push: false
          },
          updated_at: "2026-08-04T09:45:44-07:00"
        }
      }, null, 2),
      requestConfig: {
        id: "req-settings",
        name: "Configurações",
        method: "PUT",
        url: "{{base_url}}/api/v1/users/settings",
        params: [],
        headers: [
          { id: "h6", key: "Content-Type", value: "application/json", enabled: true }
        ],
        bodyType: "raw-json",
        bodyRaw: JSON.stringify({ theme: "dark", notifications: { email: true, push: false } }, null, 2)
      }
    },
    {
      name: "Encerrar Sessão",
      method: "DELETE",
      path: "/api/v1/sessions/current",
      description: "Encerra a sessão ativa do usuário no workspace de testes de API.",
      responseSample: JSON.stringify({
        status: "success",
        message: "Session terminated successfully",
        data: {
          session_id: "sess_98234ab109f",
          terminated_at: "2026-08-04T09:45:44-07:00"
        }
      }, null, 2),
      requestConfig: {
        id: "req-sessions",
        name: "Encerrar Sessão",
        method: "DELETE",
        url: "{{base_url}}/api/v1/sessions/current",
        params: [],
        headers: [
          { id: "h7", key: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", enabled: true }
        ],
        bodyType: "none",
        bodyRaw: ""
      }
    }
  ];

  const getBadgeColor = (method: MethodType) => {
    switch (method) {
      case "GET": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "POST": return "bg-[#ff6c37]/10 text-[#ff6c37] border-[#ff6c37]/20";
      case "PUT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DELETE": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-[#15181b] border-l border-[#24282c] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-150 select-none">
      {/* Header */}
      <div className="bg-[#0c0e10] text-white p-4 flex items-center justify-between border-b border-[#1f2226]">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-[#ff6c37]" />
          <h3 className="font-bold text-sm tracking-tight">Referência de Endpoints Mock</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Docs Body scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#0c0e10]">
        <div className="p-3 bg-[#121416] text-neutral-400 rounded-xl border border-[#24282c] text-[11px] leading-relaxed">
          <span className="font-bold text-[#ff6c37] block mb-1">⚡ Servidor Mock de Testes Ativo</span>
          Nosso back-end integrado expõe quatro endpoints para testes rápidos de autorização e envio de payloads JSON reais com validação automática de assertivas.
        </div>

        <div className="space-y-4">
          {mockEndpoints.map((ep, i) => (
            <div key={i} className="bg-[#15181b] border border-[#24282c] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-bold border rounded px-1.5 py-0.2 uppercase ${getBadgeColor(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-200">{ep.path}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-neutral-400 mt-1">{ep.name}</h4>
                </div>

                <button
                  onClick={() => {
                    onLoadRequest(ep.requestConfig);
                    onClose();
                  }}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#ff6c37] hover:bg-[#e05624] text-white text-[11px] font-bold rounded-lg transition"
                  title="Import to workspace"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Carregar</span>
                </button>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">{ep.description}</p>

              {ep.bodySample && (
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">
                    Payload de Exemplo
                  </span>
                  <pre className="bg-[#121416] text-neutral-300 font-mono text-[10px] rounded-lg p-2 overflow-x-auto border border-[#24282c]">
                    {ep.bodySample}
                  </pre>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">
                  Resposta Esperada (200 OK)
                </span>
                <pre className="bg-[#121416] text-neutral-300 font-mono text-[10px] rounded-lg p-2 overflow-x-auto border border-[#24282c]">
                  {ep.responseSample}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0c0e10] border-t border-[#1f2226] p-3 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-[#1c2024] hover:bg-[#24282c] border border-neutral-700/30 text-white text-xs font-bold rounded-lg transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
