/*
 * Copyright 2025 EPAM Systems
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

import { useCallback, useState, useEffect } from 'react';
import { isNumber } from 'es-toolkit/compat';

import { EXPANDED_FOLDERS_IDS } from 'common/constants/localStorageKeys';
import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { TransformedFolder } from 'controllers/testCase';

const getStorageKey = (instanceKey: TMS_INSTANCE_KEY) => `${EXPANDED_FOLDERS_IDS}_${instanceKey}`;

const getAllChildIds = (folder: TransformedFolder): number[] => {
  const childIds: number[] = [];

  const collectChildren = (currentFolder: TransformedFolder) => {
    if (currentFolder.folders && currentFolder.folders.length > 0) {
      currentFolder.folders.forEach((childFolder) => {
        childIds.push(childFolder.id);
        collectChildren(childFolder);
      });
    }
  };

  collectChildren(folder);

  return childIds;
};

export const useManualLaunchFolderExpansion = () => {
  const storageKey = getStorageKey(TMS_INSTANCE_KEY.MANUAL_LAUNCH);

  const [expandedIds, setExpandedIds] = useState<number[]>(() => {
    const stored = getStorageItem(storageKey) as string | null;

    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (Array.isArray(parsed) && parsed.every(isNumber)) {
        return parsed;
      }

      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setStorageItem(storageKey, expandedIds);
  }, [expandedIds, storageKey]);

  const onToggleFolder = useCallback((folder: TransformedFolder) => {
    setExpandedIds((prevIds) => {
      const isExpanded = prevIds.includes(folder.id);

      if (isExpanded) {
        const childIds = getAllChildIds(folder);

        return prevIds.filter((id) => id !== folder.id && !childIds.includes(id));
      } else {
        return [...prevIds, folder.id];
      }
    });
  }, []);

  return {
    expandedIds,
    onToggleFolder,
  };
};
