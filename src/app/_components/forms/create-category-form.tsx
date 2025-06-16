"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FieldError } from "./field-error";
import { createCategory, type ActionResponse } from "@/server/actions/category-actions";

const initialState: ActionResponse = {
  message: "",
};

export function CreateCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, initialState);

  return (
    <div className="mx-auto max-w-screen-md px-4">
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Categoria</Label>
          <Input
            type="text"
            id="name"
            name="name"
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
            placeholder="Digite uma descrição para a categoria"
            rows={3}
            className="w-full min-h-[80px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
          />
          <FieldError messages={state?.errors?.description} />
        </div>

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
            {pending ? "Criando..." : "Criar Categoria"}
          </Button>
          <Button type="button" variant="outline" className="flex-1" asChild>
            <a href="/categorias">Cancelar</a>
          </Button>
        </div>
      </form>
    </div>
  );
}