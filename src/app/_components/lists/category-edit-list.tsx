"use client";
import React, { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { getCategoryColorClasses } from "@/lib/utils";
import type { ExpenseCategory } from "@/server/db/schema/expense-category";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, TouchSensor } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { DragEndEvent } from "@dnd-kit/core";
import Link from "next/link";

interface CategoryEditListProps {
  categories: ExpenseCategory[];
}

export default function CategoryEditList({ categories }: CategoryEditListProps) {
  const [items, setItems] = useState<ExpenseCategory[]>(categories);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      // Persist new order
      await fetch("/api/categorias/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newItems.map((c) => c.id) }),
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((category) => (
            <SortableItem key={category.id} id={category.id} category={category} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// Sortable item wrapper
interface SortableItemProps {
  id: number;
  category: ExpenseCategory;
}

function SortableItem({ id, category }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex w-full items-center gap-2">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab flex items-center justify-center px-2 py-4 hover:bg-muted rounded-lg select-none"
        style={{ touchAction: 'none' }}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <Link href={`/categorias/editar/${category.id}`} className="w-full">
      <Card className={`relative ${getCategoryColorClasses(category.color)} w-full hover:bg-muted hover:shadow-lg`}>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Edit className="h-3 w-3" />
        </div>
        <CardHeader className="p-2 px-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.emoji || "💸"}</span>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </div>
              {category.description && (
                <CardDescription>{category.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      </Link>
    </div>
  );
}