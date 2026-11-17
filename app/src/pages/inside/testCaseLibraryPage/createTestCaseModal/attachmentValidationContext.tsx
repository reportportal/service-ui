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

import { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react';

interface AttachmentValidationContextValue {
  addBlocker: () => void;
  removeBlocker: () => void;
  hasBlockingAttachments: boolean;
}

const AttachmentValidationContext = createContext<AttachmentValidationContextValue | null>(null);

export const AttachmentValidationProvider = ({ children }: PropsWithChildren) => {
  const [blockingCount, setBlockingCount] = useState(0);

  const addBlocker = useCallback(() => setBlockingCount((c) => c + 1), []);
  const removeBlocker = useCallback(() => setBlockingCount((c) => Math.max(0, c - 1)), []);

  return (
    <AttachmentValidationContext.Provider
      value={{ addBlocker, removeBlocker, hasBlockingAttachments: blockingCount > 0 }}
    >
      {children}
    </AttachmentValidationContext.Provider>
  );
};

export const useAttachmentValidation = (): AttachmentValidationContextValue => {
  const context = useContext(AttachmentValidationContext);

  if (!context) {
    return {
      addBlocker: () => undefined,
      removeBlocker: () => undefined,
      hasBlockingAttachments: false,
    };
  }

  return context;
};
