'use client';

import { GripVertical } from 'lucide-react';
import type { DragEvent, ReactNode } from 'react';
import { useState } from 'react';

export interface AppSortableItemProps {
  id: string;
  children: ReactNode;
  isDragging?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: DragEvent<HTMLDivElement>) => void;
}

export function AppSortableItem({
  id,
  children,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
}: Readonly<AppSortableItemProps>) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative flex items-center gap-2 transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      data-id={id}
    >
      <button
        type='button'
        aria-label='Drag to reorder'
        className='text-muted-foreground hover:text-foreground focus-visible:ring-primary cursor-grab rounded-md p-1 transition-colors outline-none focus-visible:ring-2 active:cursor-grabbing'
      >
        <GripVertical size={16} />
      </button>
      <div className='min-w-0 flex-1'>{children}</div>
    </div>
  );
}

export interface AppSortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  containerClassName?: string;
}

export function AppSortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  containerClassName = 'space-y-3',
}: Readonly<AppSortableListProps<T>>) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => (e: DragEvent<HTMLDivElement>) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetId: string) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const sourceId = draggedId ?? e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      return;
    }
    const oldIndex = items.findIndex(item => item.id === sourceId);
    const newIndex = items.findIndex(item => item.id === targetId);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      onReorder(newItems);
    }
    setDraggedId(null);
  };

  return (
    <div className={containerClassName}>
      {items.map((item, index) => (
        <AppSortableItem
          key={item.id}
          id={item.id}
          isDragging={draggedId === item.id}
          onDragStart={handleDragStart(item.id)}
          onDragOver={handleDragOver}
          onDrop={handleDrop(item.id)}
        >
          {renderItem(item, index)}
        </AppSortableItem>
      ))}
    </div>
  );
}
