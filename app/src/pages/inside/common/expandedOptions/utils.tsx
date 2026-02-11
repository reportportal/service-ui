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

import { createClassnames } from 'common/utils';
import { TransformedFolder } from 'controllers/testCase';

import styles from './folder/folder.scss';

const cx = createClassnames(styles);

export const hasMatchInTree = (folder: TransformedFolder, query: string): boolean => {
  if (!query) return true;

  const lowerQuery = query.toLowerCase().trim();
  if (folder.name.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  return (folder.folders ?? []).some((child) => hasMatchInTree(child, lowerQuery));
};

export const hasChildMatch = (folder: TransformedFolder, query: string): boolean => {
  if (!query) return false;

  const lowerQuery = query.toLowerCase().trim();
  return (folder.folders ?? []).some((child) => hasMatchInTree(child, lowerQuery));
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

export const highlightText = (text: string, query: string): ReactNode => {
  if (!query || !text) return text;

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return text;

  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

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
