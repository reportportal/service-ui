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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { DragNDropIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import type { ExtendedTestCase, TestCasePriority } from 'types/testCase';
import { EXTERNAL_TREE_DROP_TYPE } from 'pages/inside/common/expandedOptions/constants';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useDraggableRow } from 'components/main/draggableTableRow';

import { TestCaseNameCell } from '../testCaseNameCell';

import styles from './draggableTestCaseNameCell.scss';

const cx = createClassnames(styles);

export interface ExternalTreeDropItem extends Record<string, unknown> {
  id: number | string;
  type: string;
  isExternal: true;
  testCase: ExtendedTestCase;
  folderId?: number;
}

export type RowDropPlacement = 'before' | 'after';

export interface TestCaseRowReorder {
  canDrop: (draggedTestCaseId: number, targetTestCaseId: number) => boolean;
  onDrop: (
    draggedTestCaseId: number,
    targetTestCaseId: number,
    placement: RowDropPlacement,
  ) => void;
}

const ROW_SELECTOR = '.test-case-table-row-global';
const DROP_BEFORE_CLASS = 'test-case-row-drop-before';
const DROP_AFTER_CLASS = 'test-case-row-drop-after';

const getPlacement = (row: HTMLElement | null, monitor: DropTargetMonitor): RowDropPlacement => {
  const offset = monitor.getClientOffset();

  if (!row || !offset) {
    return 'after';
  }

  const { top, height } = row.getBoundingClientRect();

  return offset.y < top + height / 2 ? 'before' : 'after';
};

interface DraggableTestCaseNameCellProps {
  testCase: ExtendedTestCase;
  priority: TestCasePriority;
  name: string;
  tags: string[];
  searchQuery?: string;
  // Reordering inside the list (Custom order); without it rows are not drop targets
  reorder?: TestCaseRowReorder;
}

export const DraggableTestCaseNameCell = ({
  testCase,
  priority,
  name,
  tags,
  searchQuery,
  reorder,
}: DraggableTestCaseNameCellProps) => {
  const { canManageTestCases } = useUserPermissions();
  const rowRef = useRef<HTMLElement | null>(null);
  const [placement, setPlacement] = useState<RowDropPlacement | null>(null);

  const dragItem: ExternalTreeDropItem = useMemo(
    () => ({
      id: testCase.id,
      type: EXTERNAL_TREE_DROP_TYPE,
      isExternal: true as const,
      testCase,
      folderId: testCase.testFolder?.id,
    }),
    [testCase],
  );

  const { dragSourceRef, handleDragHandleMouseDown } = useDraggableRow<ExternalTreeDropItem>({
    type: EXTERNAL_TREE_DROP_TYPE,
    item: dragItem,
    canDrag: canManageTestCases,
    rowSelector: ROW_SELECTOR,
  });

  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: EXTERNAL_TREE_DROP_TYPE,
      canDrop: (item: ExternalTreeDropItem) =>
        Boolean(reorder?.canDrop(Number(item.id), testCase.id)),
      hover: (item: ExternalTreeDropItem, monitor) => {
        if (monitor.canDrop()) {
          setPlacement(getPlacement(rowRef.current, monitor));
        }
      },
      drop: (item: ExternalTreeDropItem, monitor) => {
        reorder?.onDrop(Number(item.id), testCase.id, getPlacement(rowRef.current, monitor));
      },
      collect: (monitor) => ({ isOver: monitor.isOver() && monitor.canDrop() }),
    }),
    [reorder, testCase.id],
  );

  const cellRef = useCallback(
    (node: HTMLElement | null) => {
      dragSourceRef(node);
      rowRef.current = node?.closest<HTMLElement>(ROW_SELECTOR) ?? null;
    },
    [dragSourceRef],
  );

  useEffect(() => {
    dropRef(reorder ? rowRef.current : null);
  }, [dropRef, reorder]);

  useEffect(() => {
    const row = rowRef.current;

    row?.classList.toggle(DROP_BEFORE_CLASS, isOver && placement === 'before');
    row?.classList.toggle(DROP_AFTER_CLASS, isOver && placement === 'after');
  }, [isOver, placement]);

  return (
    <div ref={cellRef}>
      <TestCaseNameCell
        displayId={testCase.displayId}
        priority={priority}
        name={name}
        tags={tags}
        searchQuery={searchQuery}
      />
      {canManageTestCases && (
        <div className={cx('drag-handle')} onMouseDown={handleDragHandleMouseDown}>
          <DragNDropIcon />
        </div>
      )}
    </div>
  );
};
