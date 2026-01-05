import { useEffect, MutableRefObject } from 'react';

const BORDER = 2;

export const useDescriptionModalResize = (textareaRef: MutableRefObject<HTMLTextAreaElement>) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + BORDER}px`;

      window.dispatchEvent(new Event('resize'));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const handleResize = () => {
      window.dispatchEvent(new Event('resize'));
    };

    const resizeObserver = new ResizeObserver(handleResize);

    resizeObserver.observe(textarea);

    return () => {
      resizeObserver.disconnect();
    };
  }, [textareaRef.current]);
};
