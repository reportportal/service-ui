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

import { ReactNode } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { TreeDragItem, TreeDropPosition } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { getParentFoldersIds } from 'common/utils/folderUtils';
import { TransformedFolder } from 'controllers/testCase';
import { ExtendedTestCase } from 'types/testCase';

import styles from './folder/folder.scss';
import type { TestCaseFolderActionCallback } from './types';

const cx = createClassnames(styles);

export const hasMatchInTree = (folder: TransformedFolder, query: string): boolean => {
  if (!query) return true;

  const lowerQuery = query.toLowerCase().trim();
  if (folder?.name?.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  return (folder?.folders ?? []).some((child) => hasMatchInTree(child, lowerQuery));
};

export const hasChildMatch = (folder: TransformedFolder, query: string): boolean => {
  if (!query) return false;

  const lowerQuery = query.toLowerCase().trim();
  return (folder?.folders ?? []).some((child) => hasMatchInTree(child, lowerQuery));
};

export const collectFoldersToExpand = (
  folders: TransformedFolder[],
  query: string,
  result: number[] = [],
): number[] => {
  if (!query) return result;

  folders.forEach((folder) => {
    const childrenMatch = hasChildMatch(folder, query);

    if (childrenMatch) {
      result.push(folder.id);
    }

    if (!isEmpty(folder.folders)) {
      collectFoldersToExpand(folder.folders, query, result);
    }
  });

  return result;
};

export const getExpandableFolderIds = (
  folders: TransformedFolder[],
  result: number[] = [],
): number[] => {
  folders.forEach((folder) => {
    if (!isEmpty(folder.folders)) {
      result.push(folder.id);

      getExpandableFolderIds(folder.folders, result);
    }
  });

  return result;
};

interface GetHiddenActiveFolderIndicatorIdParams {
  folders: TransformedFolder[];
  activeFolderId: number | null;
  expandedIds: number[];
}

const flattenFolderTree = (folders: TransformedFolder[]): TransformedFolder[] => {
  const result: TransformedFolder[] = [];

  const getFoldersRecursively = (list: TransformedFolder[]) => {
    list.forEach((folder) => {
      result.push(folder);
      getFoldersRecursively(folder.folders ?? []);
    });
  };

  getFoldersRecursively(folders);

  return result;
};

export const getHiddenActiveFolderIndicatorId = ({
  folders,
  activeFolderId,
  expandedIds,
}: GetHiddenActiveFolderIndicatorIdParams): number | null => {
  if (activeFolderId === null) {
    return null;
  }

  const ancestorIds = getParentFoldersIds(activeFolderId, flattenFolderTree(folders)).slice(1);
  const expandedSet = new Set(expandedIds);

  return [...ancestorIds].reverse().find((id) => !expandedSet.has(id)) ?? null;
};

export const highlightText = (text: string, query: string): ReactNode => {
  if (!query || !text) return text;

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return text;

  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`); // NOSONAR

  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  const nodes = parts.reduce<{ nodes: ReactNode[]; counter: number }>(
    (acc, part) => {
      if (!part) return acc;

      const currentKey = acc.counter;

      const isMatch = part.toLowerCase() === trimmedQuery.toLowerCase();

      const newNode = isMatch ? (
        <span key={`highlight-${currentKey}`} className={cx('highlight')}>
          {part}
        </span>
      ) : (
        <span key={`text-${currentKey}`}>{part}</span>
      );

      return {
        nodes: [...acc.nodes, newNode],
        counter: acc.counter + 1,
      };
    },
    { nodes: [], counter: 0 },
  );

  return <>{nodes.nodes}</>;
};

export const createTestCaseDropHandler = (action: TestCaseFolderActionCallback | undefined) => {
  return (draggedItem: TreeDragItem, targetId: string | number, _position: TreeDropPosition) => {
    const item = draggedItem as TreeDragItem & { testCase?: ExtendedTestCase };
    if (item.testCase && action) {
      void action(item.testCase, Number(targetId));
    }
  };
};
