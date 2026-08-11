import React from "react";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { KeyValueItem } from "../types";

interface KeyValueTableProps {
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  placeholderKey?: string;
  placeholderValue?: string;
}

export default function KeyValueTable({
  items,
  onChange,
  placeholderKey = "Key",
  placeholderValue = "Value",
}: KeyValueTableProps) {
  const updateItem = (id: string, field: keyof KeyValueItem, val: any) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    });
    onChange(updated);
  };

  const deleteItem = (id: string) => {
    const filtered = items.filter((item) => item.id !== id);
    onChange(filtered);
  };

  const addItem = () => {
    const newItem: KeyValueItem = {
      id: Math.random().toString(36).substring(2, 9),
      key: "",
      value: "",
      description: "",
      enabled: true,
    };
    onChange([...items, newItem]);
  };

  return (
    <div className="space-y-2 select-none" id="key-value-table-container">
      <div className="overflow-x-auto border border-[#24282c] rounded-xl bg-[#121416]">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-[#0c0e10] border-b border-[#1f2226] text-neutral-400 font-bold tracking-wider uppercase text-[10px]">
              <th className="py-2 px-3 w-12 text-center">Use</th>
              <th className="py-2 px-3 w-1/2 border-r border-[#1f2226]">Chave (Key)</th>
              <th className="py-2 px-3 w-1/2">Valor (Value)</th>
              <th className="py-2 px-3 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2226]">
            {items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-neutral-800/10 transition ${
                    !item.enabled ? "opacity-50 bg-[#0c0e10]/20" : ""
                  }`}
                >
                  {/* Enable Checkbox */}
                  <td className="py-1 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => updateItem(item.id, "enabled", !item.enabled)}
                      className="p-1 rounded text-neutral-500 hover:text-[#ff6c37] transition inline-flex items-center justify-center"
                    >
                      {item.enabled ? (
                        <CheckSquare className="w-4 h-4 text-[#ff6c37]" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-600" />
                      )}
                    </button>
                  </td>

                  {/* Key */}
                  <td className="py-1 px-2 border-r border-[#1f2226]">
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => updateItem(item.id, "key", e.target.value)}
                      placeholder={placeholderKey}
                      className="w-full bg-transparent px-1.5 py-1 font-mono text-xs text-neutral-200 placeholder-neutral-600 border-none focus:outline-none"
                    />
                  </td>

                  {/* Value */}
                  <td className="py-1 px-2">
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateItem(item.id, "value", e.target.value)}
                      placeholder={placeholderValue}
                      className="w-full bg-transparent px-1.5 py-1 font-mono text-xs text-neutral-200 placeholder-neutral-600 border-none focus:outline-none"
                    />
                  </td>

                  {/* Action delete */}
                  <td className="py-1 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                      title="Excluir linha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 px-3 text-center text-neutral-500 text-[11px]">
                  Nenhum parâmetro adicionado ainda. Clique no botão abaixo para criar a primeira linha de chave-valor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1c2024] hover:bg-[#24282c] text-neutral-300 hover:text-white border border-neutral-700/30 rounded-lg text-xs font-semibold shadow-sm transition"
      >
        <Plus className="w-3.5 h-3.5 text-[#ff6c37]" />
        <span>Adicionar Linha</span>
      </button>
    </div>
  );
}
