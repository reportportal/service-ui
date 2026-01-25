import { ReactNode } from 'react';

import { useHideOnDrag } from './useHideOnDrag';

interface HideOnDragProps {
  isDragging: boolean;
  children: ReactNode;
}

export const HideOnDrag = ({ isDragging, children }: HideOnDragProps) => {
  const shouldHide = useHideOnDrag({ isDragging });

  if (shouldHide) return null;

  return <>{children}</>;
};
