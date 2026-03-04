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

import { useEffect, MutableRefObject } from 'react';

const BORDER = 2;

export const useTextareaAutoResize = (
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>,
) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight + BORDER}px`;
        window.dispatchEvent(new Event('resize'));
      }
    }, 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textareaRef.current]);
};
