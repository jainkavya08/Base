"use client";

import { useMemo } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from "@/lib/store";
import { 
  WidgetHabits, 
  WidgetPomodoro, 
  WidgetTodos, 
  WidgetReminders, 
  WidgetFinance 
} from "./widgets";
import Link from "next/link";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const WIDGET_COMPONENTS: Record<string, React.FC<{ size: 'small' | 'large' }>> = {
  habits: WidgetHabits,
  pomodoro: WidgetPomodoro,
  todos: WidgetTodos,
  reminders: WidgetReminders,
  finance: WidgetFinance,
};

function SortableWidget({ id, size }: { id: string, size: 'small' | 'large' }) {
  const { toggleWidgetSize } = useAppStore();
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
  };

  const Component = WIDGET_COMPONENTS[id];
  if (!Component) return null;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "bg-surface-card rounded-2xl p-6 shadow-sm border border-transparent transition-colors group relative cursor-grab active:cursor-grabbing",
        size === 'large' ? 'col-span-1 md:col-span-2 row-span-2' : 'col-span-1 row-span-1',
        isDragging && 'opacity-50 z-50 border-border scale-105 shadow-xl'
      )}
      {...attributes} 
      {...listeners}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); toggleWidgetSize(id); }}
          className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
        >
          {size === 'large' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Invisible link overlay to make the whole card clickable but still draggable */}
      <Link href={`/${id === 'home' ? '' : id}`} className="absolute inset-0 z-10" />
      
      <div className="relative z-0 h-full pointer-events-none">
        <Component size={size} />
      </div>
    </div>
  );
}

export function BentoGrid() {
  const { widgets, updateWidgetOrder } = useAppStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over.id);
      
      updateWidgetOrder(arrayMove(widgets, oldIndex, newIndex));
    }
  };

  const widgetIds = useMemo(() => widgets.map(w => w.id), [widgets]);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-6">
        <SortableContext 
          items={widgetIds}
          strategy={rectSortingStrategy}
        >
          {widgets.map((widget) => (
            <SortableWidget key={widget.id} id={widget.id} size={widget.size} />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
