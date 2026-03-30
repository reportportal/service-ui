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

import { useRef, useEffect, useMemo, CSSProperties, MutableRefObject } from 'react';
import { useSelector } from 'react-redux';
import { useVirtualizer } from '@tanstack/react-virtual';
import { size } from 'es-toolkit/compat';

import { transformedFoldersSelector } from 'controllers/testCase';
import { BubblesLoader } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';

import { usePanelActions, usePanelState } from '../testLibraryPanelContext';
import { useFolderTestCases } from '../hooks/useFolderTestCases';
import { SelectableFolderRow } from './selectableFolderRow';
import { SelectableTestCaseRow } from './selectableTestCaseRow';
import { LoadingRow } from './loadingRow';
import { LoadMoreRow } from './loadMoreRow';
import { useFlattenedSelectableTree, getRowKey, type FlatSelectableRow } from './useFlattenedSelectableTree';
import { ROW_HEIGHT_PX } from '../../expandedOptions/folder/connectorLines';

import treeStyles from '../../expandedOptions/folder/folder.scss';
import styles from './selectableFolderTree.scss';

const cx = createClassnames(styles, treeStyles);

type FetchNextPageMap = Map<number, () => void>;

interface FolderFetcherProps {
  folderId: number;
  testsCount: number;
  fetchNextPageMapRef: MutableRefObject<FetchNextPageMap>;
}

const FolderFetcher = ({ folderId, testsCount, fetchNextPageMapRef }: FolderFetcherProps) => {
  const { fetchNextPage } = useFolderTestCases({ folderId, isOpen: true, testsCount });

  useEffect(() => {
    const map = fetchNextPageMapRef.current;
    
    map.set(folderId, fetchNextPage);

    return () => {
      map.delete(folderId);
    };
  }, [folderId, fetchNextPage, fetchNextPageMapRef]);

  return null;
};

export const SelectableFolderTree = () => {
  const folders = useSelector(transformedFoldersSelector);
  const { setScrollElement } = usePanelActions();
  const { expandedFolderIds, testCasesMap, shouldHideAddedTestCases, testPlanIdsByFolderId, isTestPlanDataComplete } = usePanelState();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fetchNextPageMapRef = useRef<FetchNextPageMap>(new Map());

  const flatRows = useFlattenedSelectableTree({
    folders,
    expandedFolderIds,
    testCasesMap,
    shouldHideAddedTestCases,
    testPlanIdsByFolderId,
  });

  const expandedFoldersWithTests = useMemo(
    () =>
      flatRows.reduce<{ folderId: number; testsCount: number }[]>((result, row) => {
        if (row.type === 'folder' && row.isOpen && row.folder.testsCount > 0) {
          result.push({ folderId: row.folder.id, testsCount: row.folder.testsCount });
        }

        return result;
      }, []),
    [flatRows],
  );

  const virtualizer = useVirtualizer({
    count: size(flatRows),
    overscan: 15,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
  });

  useEffect(() => {
    if (scrollRef.current) {
      setScrollElement(scrollRef.current);
    }
  }, [setScrollElement]);

  const renderRow = (row: FlatSelectableRow, nextRowDepth: number, style: CSSProperties) => {
    const key = getRowKey(row);

    switch (row.type) {
      case 'folder':
        return <SelectableFolderRow key={key} row={row} nextRowDepth={nextRowDepth} style={style} />;
      case 'testCase':
        return <SelectableTestCaseRow key={key} row={row} nextRowDepth={nextRowDepth} style={style} />;
      case 'loading':
        return <LoadingRow key={key} row={row} nextRowDepth={nextRowDepth} style={style} />;
      case 'loadMore':
        return (
          <LoadMoreRow
            key={key}
            row={row}
            nextRowDepth={nextRowDepth}
            fetchNextPageMapRef={fetchNextPageMapRef}
            style={style}
          />
        );
    }
  };

  if (shouldHideAddedTestCases && !isTestPlanDataComplete) {
    return (
      <div className={cx('selectable-folder-tree__loader')}>
        <BubblesLoader />
      </div>
    );
  }

  return (
    <div className={cx('selectable-folder-tree')}>
      {expandedFoldersWithTests.map(({ folderId, testsCount }) => (
        <FolderFetcher
          key={folderId}
          folderId={folderId}
          testsCount={testsCount}
          fetchNextPageMapRef={fetchNextPageMapRef}
        />
      ))}
      <div ref={scrollRef} className={cx('selectable-folder-tree__scroll-container')}>
        <div
          className={cx('folders-tree', 'selectable-folder-tree__outer')}
          role="tree"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = flatRows[virtualRow.index];
            const nextRow = flatRows[virtualRow.index + 1];
            const nextRowDepth = nextRow?.depth ?? 0;

            return renderRow(row, nextRowDepth, {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            });
          })}
        </div>
      </div>
    </div>
  );
};
