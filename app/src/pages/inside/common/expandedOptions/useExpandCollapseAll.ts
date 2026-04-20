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

import { useCallback, useMemo } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { VoidFn } from '@reportportal/ui-kit/common';

import { TransformedFolder } from 'controllers/testCase';

import { getExpandableFolderIds } from './utils';

interface UseExpandCollapseAllParams {
  filteredFolders: TransformedFolder[];
  effectiveExpandedIds: number[];
  hasFolderSidebarFilters: boolean;
  setExpandedIds: (ids: number[]) => void;
  setAllExpandedInFilter: VoidFn;
  setAllCollapsedInFilter: VoidFn;
}

export const useExpandCollapseAll = ({
  filteredFolders,
  effectiveExpandedIds,
  hasFolderSidebarFilters,
  setExpandedIds,
  setAllExpandedInFilter,
  setAllCollapsedInFilter,
}: UseExpandCollapseAllParams) => {
  const visibleExpandableIds = useMemo(
    () => getExpandableFolderIds(filteredFolders),
    [filteredFolders],
  );

  const isExpandAllDisabled = useMemo(
    () =>
      isEmpty(visibleExpandableIds) ||
      visibleExpandableIds.every((id) => effectiveExpandedIds.includes(id)),
    [visibleExpandableIds, effectiveExpandedIds],
  );

  const isCollapseAllDisabled = useMemo(
    () =>
      isEmpty(visibleExpandableIds) ||
      visibleExpandableIds.every((id) => !effectiveExpandedIds.includes(id)),
    [visibleExpandableIds, effectiveExpandedIds],
  );

  const handleExpandAll = useCallback(() => {
    if (hasFolderSidebarFilters) {
      setAllExpandedInFilter();

      return;
    }

    setExpandedIds([...new Set([...effectiveExpandedIds, ...visibleExpandableIds])]);
  }, [
    hasFolderSidebarFilters,
    setAllExpandedInFilter,
    setExpandedIds,
    effectiveExpandedIds,
    visibleExpandableIds,
  ]);

  const handleCollapseAll = useCallback(() => {
    if (hasFolderSidebarFilters) {
      setAllCollapsedInFilter();

      return;
    }

    const visibleIdSet = new Set(visibleExpandableIds);

    setExpandedIds(effectiveExpandedIds.filter((id) => !visibleIdSet.has(id)));
  }, [
    hasFolderSidebarFilters,
    setAllCollapsedInFilter,
    setExpandedIds,
    effectiveExpandedIds,
    visibleExpandableIds,
  ]);

  return {
    visibleExpandableIds,
    isExpandAllDisabled,
    isCollapseAllDisabled,
    handleExpandAll,
    handleCollapseAll,
  };
};
