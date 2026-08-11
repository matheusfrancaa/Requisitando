import React, { useState } from "react";
import { X, Plus, Trash2, Globe, HelpCircle, Save, CheckSquare, Square } from "lucide-react";
import { Environment, EnvVariable } from "../types";

interface EnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  environments: Environment[];
  onChange: (environments: Environment[]) => void;
}

export default function EnvironmentModal({
  isOpen,
  onClose,
  environments,
  onChange,
}: EnvironmentModalProps) {
  const [selectedEnvId, setSelectedEnvId] = useState<string>(environments[0]?.id || "");
  const [newEnvName, setNewEnvName] = useState("");

  if (!isOpen) return null;

  const selectedEnv = environments.find((e) => e.id === selectedEnvId) || environments[0];

  const handleAddEnvironment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim()) return;
    const newId = "env-" + Math.random().toString(36).substring(2, 9);
    const newEnv: Environment = {
      id: newId,
      name: newEnvName.trim(),
      variables: [
        { id: "v-" + Math.random().toString(36).substring(2, 9), key: "base_url", value: "https://api.example.com", enabled: true },
      ],
    };
    onChange([...environments, newEnv]);
    setSelectedEnvId(newId);
    setNewEnvName("");
  };

  const handleDeleteEnvironment = (id: string) => {
    if (environments.length <= 1) {
      alert("Você deve manter pelo menos uma configuração de ambiente.");
      return;
    }
    const filtered = environments.filter((e) => e.id !== id);
    onChange(filtered);
    if (selectedEnvId === id) {
      setSelectedEnvId(filtered[0].id);
    }
  };

  const handleAddVariable = () => {
    if (!selectedEnv) return;
    const newVar: EnvVariable = {
      id: "v-" + Math.random().toString(36).substring(2, 9),
      key: "nova_variavel",
      value: "",
      enabled: true,
    };
    const updated = environments.map((env) => {
      if (env.id === selectedEnv.id) {
        return { ...env, variables: [...env.variables, newVar] };
      }
      return env;
    });
    onChange(updated);
  };

  const handleUpdateVariable = (varId: string, field: keyof EnvVariable, val: any) => {
    if (!selectedEnv) return;
    const updated = environments.map((env) => {
      if (env.id === selectedEnv.id) {
        const updatedVars = env.variables.map((v) => {
          if (v.id === varId) {
            return { ...v, [field]: val };
          }
          return v;
        });
        return { ...env, variables: updatedVars };
      }
      return env;
    });
    onChange(updated);
  };

  const handleDeleteVariable = (varId: string) => {
    if (!selectedEnv) return;
    const updated = environments.map((env) => {
      if (env.id === selectedEnv.id) {
        return { ...env, variables: env.variables.filter((v) => v.id !== varId) };
      }
      return env;
    });
    onChange(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#15181b] border border-[#24282c] w-full max-w-4xl h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0c0e10] text-white px-4 py-3.5 flex items-center justify-between border-b border-[#1f2226]">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-[#ff6c37]" />
            <h3 className="font-bold text-sm tracking-tight">Gerenciador de Variáveis de Ambiente</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Notice bar */}
        <div className="bg-[#121416] border-b border-[#1f2226] px-4 py-2.5 flex items-center space-x-2 text-neutral-400 text-[11px] leading-relaxed">
          <HelpCircle className="w-4 h-4 text-[#ff6c37] flex-shrink-0" />
          <span>
            <strong>Dica de Uso:</strong> Use as variáveis nas URLs, cabeçalhos ou corpos JSON com chaves duplas (ex: <code>{"{{base_url}}"}</code>). Uma chave <code>base_url</code> em branco apontará para o servidor mock local integrado automaticamente!
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel: List of environments */}
          <div className="w-64 border-r border-[#1f2226] bg-[#0c0e10] p-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block px-1">
                Ambientes
              </span>
              
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition font-semibold ${
                      selectedEnvId === env.id
                        ? "bg-[#ff6c37]/10 text-[#ff6c37] border border-[#ff6c37]/20"
                        : "text-neutral-400 hover:bg-neutral-800/40"
                    }`}
                    onClick={() => setSelectedEnvId(env.id)}
                  >
                    <span>{env.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEnvironment(env.id);
                      }}
                      className="p-1 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition"
                      title="Excluir Ambiente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Environment form */}
            <form onSubmit={handleAddEnvironment} className="border-t border-[#1f2226] pt-3 mt-2">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-1 px-1">
                Novo Ambiente
              </span>
              <div className="flex space-x-1">
                <input
                  type="text"
                  placeholder="Ex: Produção"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  className="bg-[#121416] border border-[#24282c] text-xs rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-[#ff6c37]/50 text-neutral-200 placeholder-neutral-600"
                />
                <button
                  type="submit"
                  className="bg-[#ff6c37] hover:bg-[#e05624] text-white p-1.5 rounded-lg transition flex-shrink-0"
                  title="Criar Ambiente"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right panel: Table of environment variables */}
          <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden bg-[#121416]">
            {selectedEnv ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-200">{selectedEnv.name}</h4>
                    <p className="text-[10px] text-neutral-500 font-medium">Configure variáveis de chave-valor</p>
                  </div>
                  <button
                    onClick={handleAddVariable}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-[#ff6c37] hover:bg-[#e05624] text-white text-xs font-bold rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Variável</span>
                  </button>
                </div>

                {/* Variables Scroll Grid */}
                <div className="flex-1 overflow-y-auto border border-[#24282c] rounded-xl bg-[#15181b]">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0c0e10] border-b border-[#1f2226] text-neutral-400 font-semibold uppercase text-[10px]">
                        <th className="py-2 px-3 w-14 text-center">Ativa</th>
                        <th className="py-2 px-3 w-2/5 border-r border-[#1f2226]">Chave</th>
                        <th className="py-2 px-3 w-3/5">Valor Secreto</th>
                        <th className="py-2 px-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f2226]">
                      {selectedEnv.variables.length > 0 ? (
                        selectedEnv.variables.map((v) => (
                          <tr
                            key={v.id}
                            className={`hover:bg-[#121416]/50 transition ${
                              !v.enabled ? "opacity-50 bg-[#0c0e10]/20" : ""
                            }`}
                          >
                            {/* Toggle checkbox */}
                            <td className="py-1 px-2 text-center">
                              <button
                                onClick={() => handleUpdateVariable(v.id, "enabled", !v.enabled)}
                                className="p-1 rounded-lg text-neutral-500 hover:text-[#ff6c37] transition inline-flex items-center justify-center"
                              >
                                {v.enabled ? (
                                  <CheckSquare className="w-4 h-4 text-[#ff6c37]" />
                                ) : (
                                  <Square className="w-4 h-4 text-neutral-600" />
                                )}
                              </button>
                            </td>

                            {/* Variable Key */}
                            <td className="py-1 px-2 border-r border-[#1f2226]">
                              <input
                                type="text"
                                value={v.key}
                                onChange={(e) => handleUpdateVariable(v.id, "key", e.target.value)}
                                className="w-full bg-transparent px-1.5 py-1 font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none"
                                placeholder="chave_da_variavel"
                              />
                            </td>

                            {/* Variable Value */}
                            <td className="py-1 px-2">
                              <input
                                type="text"
                                value={v.value}
                                onChange={(e) => handleUpdateVariable(v.id, "value", e.target.value)}
                                className="w-full bg-transparent px-1.5 py-1 font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none"
                                placeholder="valor_secreto_aqui"
                              />
                            </td>

                            {/* Actions Delete */}
                            <td className="py-1 px-2 text-center">
                              <button
                                onClick={() => handleDeleteVariable(v.id)}
                                className="p-1 text-neutral-500 hover:text-red-400 rounded-lg transition"
                                title="Excluir variável"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-neutral-500 text-[11px]">
                            Nenhuma variável cadastrada neste ambiente. Clique em Adicionar Variável para começar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
                Selecione ou crie um ambiente no painel à esquerda.
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-[#0c0e10] px-4 py-3 flex justify-end border-t border-[#1f2226]">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#ff6c37] hover:bg-[#e05624] text-white text-xs font-bold rounded-lg transition shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar e Fechar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
