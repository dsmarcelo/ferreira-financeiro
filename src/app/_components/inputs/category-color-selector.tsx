"use client";

import { Label } from "@/components/ui/label";
import { FieldError } from "../forms/field-error";

const CATEGORY_COLORS = [
  { name: "red", label: "Vermelho", color: "bg-red-500" },
  { name: "orange", label: "Laranja", color: "bg-orange-500" },
  { name: "amber", label: "Âmbar", color: "bg-amber-500" },
  { name: "yellow", label: "Amarelo", color: "bg-yellow-500" },
  { name: "lime", label: "Lima", color: "bg-lime-500" },
  { name: "green", label: "Verde", color: "bg-green-500" },
  { name: "emerald", label: "Esmeralda", color: "bg-emerald-500" },
  { name: "teal", label: "Azul-esverdeado", color: "bg-teal-500" },
  { name: "cyan", label: "Ciano", color: "bg-cyan-500" },
  { name: "sky", label: "Azul-claro", color: "bg-sky-500" },
  { name: "blue", label: "Azul", color: "bg-blue-500" },
  { name: "indigo", label: "Índigo", color: "bg-indigo-500" },
  { name: "violet", label: "Violeta", color: "bg-violet-500" },
  { name: "purple", label: "Roxo", color: "bg-purple-500" },
  { name: "fuchsia", label: "Fúcsia", color: "bg-fuchsia-500" },
  { name: "pink", label: "Rosa", color: "bg-pink-500" },
  { name: "rose", label: "Rosa-escuro", color: "bg-rose-500" },
  { name: "gray", label: "Cinza", color: "bg-gray-500" },
  { name: "slate", label: "Ardósia", color: "bg-slate-500" },
  { name: "zinc", label: "Zinco", color: "bg-zinc-500" },
] as const;

interface CategoryColorSelectorProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  messages?: string[];
}

export function CategoryColorSelector({
  selectedColor,
  setSelectedColor,
  messages,
}: CategoryColorSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Cor da Categoria</Label>
      <input type="hidden" name="color" value={selectedColor} />
      <div className="grid grid-cols-5 gap-2">
        {CATEGORY_COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => setSelectedColor(color.name)}
            className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${color.color
              } ${selectedColor === color.name
                ? "border-gray-900 ring-2 ring-gray-400 ring-offset-2"
                : "border-gray-300"
              }`}
            title={color.label}
            aria-label={`Selecionar cor ${color.label}`}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Cor selecionada: {CATEGORY_COLORS.find(c => c.name === selectedColor)?.label}
      </p>
      <FieldError messages={messages} />
    </div>
  );
}