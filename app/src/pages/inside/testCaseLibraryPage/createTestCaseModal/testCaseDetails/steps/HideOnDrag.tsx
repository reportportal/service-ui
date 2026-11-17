import { ReactNode, useEffect } from 'react';

import { useHideOnDrag } from './useHideOnDrag';

interface HideOnDragProps {
  isDragging: boolean;
  children: ReactNode;
  index: number;
  draggingIndex: number | null;
  onDraggingChange: (index: number | null) => void;
}

export const HideOnDrag = ({
  isDragging,
  children,
  index,
  draggingIndex,
  onDraggingChange,
}: HideOnDragProps) => {
  const shouldHide = useHideOnDrag({ isDragging });

  useEffect(() => {
    if (isDragging) {
      onDraggingChange(index);
    } else if (draggingIndex === index) {
      onDraggingChange(null);
    }
  }, [isDragging, index, draggingIndex, onDraggingChange]);

  if (shouldHide) return null;

  return <>{children}</>;
};
