/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

export interface UseDraggableRowParams<T> {
  type: string;
  item: T;
  canDrag?: boolean;
  rowSelector?: string;
  customDraggingClass?: string;
}

export const useDraggableRow = <T extends Record<string, unknown>>({
  type,
  item,
  canDrag = true,
  rowSelector = '[role="row"], tr',
  customDraggingClass = 'is-dragging-row',
}: UseDraggableRowParams<T>) => {
  const isDragFromHandle = useRef(false);

  const [{ isDragging }, dragRef, dragPreviewRef] = useDrag(
    () => ({
      type,
      item: () => item,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: () => canDrag && isDragFromHandle.current,
    }),
    [item, canDrag, type],
  );

  useEffect(() => {
    dragPreviewRef(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreviewRef]);

  const rowRef = useRef<HTMLElement | null>(null);

  const dragSourceRef = useCallback(
    (node: HTMLElement | null) => {
      rowRef.current = node;
      dragRef(node);
    },
    [dragRef],
  );

  const handleDragHandleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    isDragFromHandle.current = true;
  }, []);

  useEffect(() => {
    const row = rowRef.current?.closest<HTMLElement>(rowSelector) ?? null;
    if (row) {
      if (isDragging) {
        row.classList.add(customDraggingClass);
      } else {
        row.classList.remove(customDraggingClass);
      }
    }
    if (!isDragging) {
      isDragFromHandle.current = false;
    }
  }, [isDragging, rowSelector, customDraggingClass]);

  return {
    isDragging,
    dragSourceRef,
    handleDragHandleMouseDown,
  };
};
