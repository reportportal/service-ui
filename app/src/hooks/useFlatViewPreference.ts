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

import { useEffect, useRef, useState } from 'react';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';

const FLAT_VIEW_STORAGE_KEY = 'folderTreeFlatView';

const getFlatViewStorageKey = (instanceKey: TMS_INSTANCE_KEY) =>
  `${FLAT_VIEW_STORAGE_KEY}_${instanceKey}`;

export const useFlatViewPreference = (instanceKey: TMS_INSTANCE_KEY) => {
  const storageKey = getFlatViewStorageKey(instanceKey);
  const [isFlatView, setIsFlatView] = useState<boolean>(() =>
    Boolean(getStorageItem(storageKey)),
  );
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;

      return;
    }

    setStorageItem(storageKey, isFlatView);
  }, [isFlatView, storageKey]);

  useEffect(() => {
    setIsFlatView(Boolean(getStorageItem(storageKey)));
  }, [storageKey]);

  return {
    isFlatView,
    setIsFlatView,
  };
};
