import { useEffect, useState } from 'react';

const HIDE_DELAY_MS = 50;

export const useHideOnDrag = (isDragging: boolean): boolean => {
  const [shouldHide, setShouldHide] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isDragging) {
      timeoutId = setTimeout(() => setShouldHide(true), HIDE_DELAY_MS);
    } else {
      setShouldHide(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isDragging]);

  return shouldHide;
};
