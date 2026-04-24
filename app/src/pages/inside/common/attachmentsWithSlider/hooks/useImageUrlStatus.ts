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

import { useEffect, useState } from 'react';

export const EXTERNAL_IMAGE_STATUS = {
  INLINE: 'inline',
  PENDING: 'pending',
  OK: 'ok',
  ERROR: 'error',
} as const;

export type ExternalImageStatus = (typeof EXTERNAL_IMAGE_STATUS)[keyof typeof EXTERNAL_IMAGE_STATUS];

function resolveStatusSync(url: string | undefined): ExternalImageStatus {
  if (!url?.trim()) {
    return EXTERNAL_IMAGE_STATUS.ERROR;
  }

  if (url.startsWith('data:')) {
    return EXTERNAL_IMAGE_STATUS.INLINE;
  }

  return EXTERNAL_IMAGE_STATUS.PENDING;
}

export function useImageUrlStatus(url: string | undefined): ExternalImageStatus {
  const [status, setStatus] = useState<ExternalImageStatus>(() => resolveStatusSync(url));

  useEffect(() => {
    const initial = resolveStatusSync(url);

    if (initial !== EXTERNAL_IMAGE_STATUS.PENDING) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(initial);

      return;
    }

    if (!url) {
      return;
    }

     
    setStatus(EXTERNAL_IMAGE_STATUS.PENDING);

    let cancelled = false;
    const img = new Image();

    img.onload = () => {
      if (!cancelled) {
        setStatus(EXTERNAL_IMAGE_STATUS.OK);
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setStatus(EXTERNAL_IMAGE_STATUS.ERROR);
      }
    };
    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [url]);

  return status;
}
