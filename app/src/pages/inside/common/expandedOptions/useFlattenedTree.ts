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

import { useMemo } from 'react';
import { isEmpty, times } from 'es-toolkit/compat';

import { TransformedFolder } from 'controllers/testCase';

import { hasMatchInTree } from './utils';

export interface FlatFolderNode {
  folder: TransformedFolder;
  depth: number;
  parentId: number | null;
  siblingIndex: number;
  hasChildren: boolean;
  isOpen: boolean;
  isDirectMatch: boolean;
  hasAncestorDirectMatch: boolean;
  connectorDepths: number[];
  isLastChild: boolean;
}

interface FlattenTreeOptions {
  folders: TransformedFolder[];
  expandedIds: number[];
  searchQuery: string;
  depth?: number;
  parentId?: number | null;
  hasAncestorDirectMatch?: boolean;
}

const flattenTree = ({
  folders,
  expandedIds,
  searchQuery,
  depth = 0,
  parentId = null,
  hasAncestorDirectMatch = false,
}: FlattenTreeOptions): FlatFolderNode[] => {
  const lowerQuery = searchQuery.toLowerCase().trim();
  let siblingIndex = 0;

  return folders.reduce<FlatFolderNode[]>((result, folder) => {
    if (searchQuery && !hasAncestorDirectMatch) {
      const isDirectMatch = folder.name.toLowerCase().includes(lowerQuery);

      if (!isDirectMatch && !hasMatchInTree(folder, searchQuery)) {
        return result;
      }
    }

    const hasChildren = !isEmpty(folder.folders);
    const isOpen = expandedIds.includes(folder.id);
    const isDirectMatch = searchQuery ? folder.name.toLowerCase().includes(lowerQuery) : false;

    result.push({
      folder,
      depth,
      parentId,
      siblingIndex,
      hasChildren,
      isOpen,
      isDirectMatch,
      hasAncestorDirectMatch,
      connectorDepths: [],
      isLastChild: false,
    });

    siblingIndex += 1;

    if (isOpen && hasChildren) {
      result.push(
        ...flattenTree({
          folders: folder.folders,
          expandedIds,
          searchQuery,
          depth: depth + 1,
          parentId: folder.id,
          hasAncestorDirectMatch: isDirectMatch || hasAncestorDirectMatch,
        }),
      );
    }

    return result;
  }, []);
};

export interface ConnectorNode {
  depth: number;
  connectorDepths: number[];
  isLastChild: boolean;
}

export const getConnectorDepths = <T extends ConnectorNode>(nodes: T[]) => {
  const depthStack: number[] = [];

  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    const { depth } = node;

    if (depth === 0) {
      depthStack.length = 0;

      continue;
    }

    while (depthStack.length > 0 && depthStack[depthStack.length - 1] > depth) {
      depthStack.pop();
    }

    const hasSiblingAfter = depthStack.length > 0 && depthStack[depthStack.length - 1] === depth;
    const hasVisibleChildren = i + 1 < nodes.length && nodes[i + 1].depth > depth;

    node.connectorDepths = depth > 1 ? times(depth - 1, (depthIndex) => depthIndex + 1) : [];
    node.isLastChild = !hasSiblingAfter && !hasVisibleChildren;

    if (!hasSiblingAfter) {
      depthStack.push(depth);
    }
  }
};

export const useFlattenedTree = (
  folders: TransformedFolder[],
  expandedIds: number[],
  searchQuery: string,
): FlatFolderNode[] =>
  useMemo(() => {
    const result = flattenTree({
      folders,
      expandedIds,
      searchQuery,
    });

    getConnectorDepths(result);

    return result;
  }, [folders, expandedIds, searchQuery]);
