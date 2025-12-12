import { useState, useCallback } from 'react';
import { isNumber } from 'es-toolkit/compat';

import { EXPANDED_FOLDERS_IDS } from 'common/constants/localStorageKeys';
import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';
import { TransformedFolder } from 'controllers/testCase';

const getFolderAndDescendantIds = (folder: TransformedFolder) =>
  (folder.folders || []).reduce(
    (result, subFolders) => {
      result.push(...getFolderAndDescendantIds(subFolders));

      return result;
    },
    [folder.id],
  );

export const useStorageFolders = (instanceKey?: INSTANCE_KEYS) => {
  const storageKey = instanceKey ? `${EXPANDED_FOLDERS_IDS}_${instanceKey}` : EXPANDED_FOLDERS_IDS;

  const [expandedIds, setExpandedIds] = useState(() => {
    try {
      const parsed = getStorageItem(storageKey) as number[] | null;

      return Array.isArray(parsed) && parsed.every(isNumber) ? parsed : [];
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
