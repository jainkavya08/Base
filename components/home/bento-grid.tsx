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
        "bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-150 group relative cursor-grab active:cursor-grabbing hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#1A1A1A]",
        size === 'large' ? 'col-span-1 md:col-span-2 min-h-[220px] sm:row-span-2' : 'col-span-1 min-h-[180px] row-span-1',
        isDragging && 'opacity-60 z-50 scale-105 shadow-[8px_8px_0px_0px_#1A1A1A]'
      )}
      {...attributes} 
      {...listeners}
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); toggleWidgetSize(id); }}
          className="w-7 h-7 rounded-[3px] bg-[#FDFAF4] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A] hover:bg-[#FFE14D] transition-colors"
          title={size === 'large' ? "Minimize" : "Maximize"}
        >
          {size === 'large' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
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
