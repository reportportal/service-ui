import { useState, useCallback } from 'react';
import { isEmpty, isNumber } from 'es-toolkit/compat';

import { EXPANDED_FOLDERS_IDS } from 'common/constants/localStorageKeys';
import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';
import { TransformedFolder } from 'controllers/testCase';

const BASE_STORAGE_KEY = EXPANDED_FOLDERS_IDS as string;

const getFolderAndDescendantIds = (folder: TransformedFolder): number[] => {
  const ids = [folder.id];

  if (!isEmpty(folder.folders)) {
    folder.folders.forEach((subFolder) => {
      ids.push(...getFolderAndDescendantIds(subFolder));
    });
  }

  return ids;
};

export const useStorageFolders = (instanceKey?: INSTANCE_KEYS) => {
  const storageKey = instanceKey ? `${BASE_STORAGE_KEY}_${instanceKey}` : BASE_STORAGE_KEY;

  const [expandedIds, setExpandedIds] = useState<number[]>(() => {
    try {
      const parsed = getStorageItem(storageKey) as number[] | null;

      if (!parsed) return [];

      if (Array.isArray(parsed) && parsed.every((id) => isNumber(id))) {
        return parsed;
      }

      return [];
    } catch {
      return [];
    }
  });

  const onToggleFolder = useCallback(
    (folder: TransformedFolder) => {
      setExpandedIds((prevIds) => {
        const isExpanded = prevIds.includes(folder.id);
        let newIds: number[];

        if (isExpanded) {
          const idsToRemove = getFolderAndDescendantIds(folder);

          newIds = prevIds.filter((id) => !idsToRemove.includes(id));
        } else {
          newIds = [...prevIds, folder.id];
        }

        setStorageItem(storageKey, newIds);

        return newIds;
      });
    },
    [storageKey],
  );

  return {
    expandedIds,
    onToggleFolder,
  };
};
