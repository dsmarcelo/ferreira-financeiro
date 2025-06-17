"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "./field-error";
import { updateCategory, type ActionResponse } from "@/server/actions/category-actions";
import type { ExpenseCategory } from "@/server/db/schema/expense-category";
import { DeleteCategoryButton } from "../buttons/delete-category-button";
import { CategoryColorSelector } from "../inputs/category-color-selector";

const initialState: ActionResponse = {
  message: "",
};

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

interface EditCategoryFormProps {
  category: ExpenseCategory;
}

export function EditCategoryForm({ category }: EditCategoryFormProps) {
  const updateCategoryWithId = updateCategory.bind(null, category.id);
  const [state, formAction, pending] = useActionState(updateCategoryWithId, initialState);
  const [selectedColor, setSelectedColor] = useState(category.color);

  return (
    <div className="mx-auto max-w-screen-md px-4">
      <div className="flex justify-end">
        <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
      </div>
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Categoria</Label>
          <Input
            type="text"
            id="name"
            name="name"
            defaultValue={category.name}
            placeholder="Digite o nome da categoria"
            required
            className="w-full"
          />
          <FieldError messages={state?.errors?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={category.description ?? ""}
            placeholder="Digite uma descrição para a categoria"
            rows={3}
            className="w-full min-h-[80px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
          />
          <FieldError messages={state?.errors?.description} />
        </div>

        <CategoryColorSelector
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          messages={state?.errors?.color}
        />

        {state?.message && (
          <p
            aria-live="polite"
            className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}
          >
            {state.message}
          </p>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Button type="button" variant="outline" className="flex-1" asChild>
            <a href="/categorias">Cancelar</a>
          </Button>
        </div>
      </form>
    </div>
  );
}