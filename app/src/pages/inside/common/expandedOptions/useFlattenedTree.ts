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
  isFlatView?: boolean;
  hideEmptyFoldersInFlatView?: boolean;
}

interface FolderContext {
  folder: TransformedFolder;
  siblingIndex: number;
  depth: number;
  parentId: number | null;
  hasAncestorDirectMatch: boolean;
  expandedIds: number[];
  searchQuery: string;
  lowerQuery: string;
  isFlatView: boolean;
  hideEmptyFoldersInFlatView: boolean;
}

const buildFlatNode = (
  {
    folder,
    depth,
    parentId,
    siblingIndex,
    hasAncestorDirectMatch,
    expandedIds,
    isFlatView,
  }: FolderContext,
  hasChildren: boolean,
  isDirectMatch: boolean,
): FlatFolderNode => ({
  folder,
  depth: isFlatView ? 0 : depth,
  parentId: isFlatView ? null : parentId,
  siblingIndex,
  hasChildren: !isFlatView && hasChildren,
  isOpen: !isFlatView && expandedIds.includes(folder.id),
  isDirectMatch,
  hasAncestorDirectMatch,
  connectorDepths: [],
  isLastChild: isFlatView,
});

const flattenChildrenInFlatView = ({
  folder,
  expandedIds,
  searchQuery,
  hideEmptyFoldersInFlatView,
}: FolderContext): FlatFolderNode[] =>
  flattenTree({
    folders: folder.folders,
    expandedIds,
    searchQuery,
    isFlatView: true,
    hideEmptyFoldersInFlatView,
  });

const flattenChildrenInTreeView = (
  { folder, expandedIds, searchQuery, depth, hasAncestorDirectMatch }: FolderContext,
  isDirectMatch: boolean,
): FlatFolderNode[] =>
  flattenTree({
    folders: folder.folders,
    expandedIds,
    searchQuery,
    depth: depth + 1,
    parentId: folder.id,
    hasAncestorDirectMatch: isDirectMatch || hasAncestorDirectMatch,
  });

const isHiddenBySearch = (
  { folder, searchQuery, isFlatView, hasAncestorDirectMatch }: FolderContext,
  isDirectMatch: boolean,
): boolean => {
  if (!searchQuery || isDirectMatch || isFlatView) {
    return false;
  }

  return !hasAncestorDirectMatch && !hasMatchInTree(folder, searchQuery);
};

const processFolder = (
  ctx: FolderContext,
): { nodes: FlatFolderNode[]; contributed: boolean } => {
  const { folder, searchQuery, lowerQuery, isFlatView, hideEmptyFoldersInFlatView, expandedIds } =
    ctx;
  const hasChildren = !isEmpty(folder?.folders);
  const folderName = folder?.name ?? '';
  const isDirectMatch = searchQuery ? folderName.toLowerCase().includes(lowerQuery) : false;

  if (searchQuery && !isDirectMatch && isFlatView) {
    return { nodes: hasChildren ? flattenChildrenInFlatView(ctx) : [], contributed: false };
  }

  if (isHiddenBySearch(ctx, isDirectMatch)) {
    return { nodes: [], contributed: false };
  }

  const isEmptyInFlatView =
    isFlatView && hideEmptyFoldersInFlatView && (folder?.testsCount ?? 0) === 0;
  const nodes: FlatFolderNode[] = [];

  if (!isEmptyInFlatView) {
    nodes.push(buildFlatNode(ctx, hasChildren, isDirectMatch));
  }

  if (isFlatView && hasChildren) {
    nodes.push(...flattenChildrenInFlatView(ctx));
  } else if (hasChildren && expandedIds.includes(folder.id)) {
    nodes.push(...flattenChildrenInTreeView(ctx, isDirectMatch));
  }

  return { nodes, contributed: !isEmptyInFlatView };
};

const flattenTree = ({
  folders,
  expandedIds,
  searchQuery,
  depth = 0,
  parentId = null,
  hasAncestorDirectMatch = false,
  isFlatView = false,
  hideEmptyFoldersInFlatView = false,
}: FlattenTreeOptions): FlatFolderNode[] => {
  const lowerQuery = searchQuery.toLowerCase().trim();
  const result: FlatFolderNode[] = [];
  let siblingIndex = 0;

  folders.forEach((folder) => {
    const { nodes, contributed } = processFolder({
      folder,
      siblingIndex,
      depth,
      parentId,
      hasAncestorDirectMatch,
      expandedIds,
      searchQuery,
      lowerQuery,
      isFlatView,
      hideEmptyFoldersInFlatView,
    });

    result.push(...nodes);

    if (contributed) {
      siblingIndex += 1;
    }
  });

  return result;
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
  isFlatView = false,
  hideEmptyFoldersInFlatView = false,
): FlatFolderNode[] =>
  useMemo(() => {
    const result = flattenTree({
      folders,
      expandedIds,
      searchQuery,
      isFlatView,
      hideEmptyFoldersInFlatView,
    });

    if (!isFlatView) {
      getConnectorDepths(result);
    }

    return result;
  }, [folders, expandedIds, searchQuery, isFlatView, hideEmptyFoldersInFlatView]);
