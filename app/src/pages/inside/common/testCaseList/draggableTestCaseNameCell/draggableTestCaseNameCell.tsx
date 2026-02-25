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
import { DragNDropIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
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

interface DraggableTestCaseNameCellProps {
  testCase: ExtendedTestCase;
  priority: TestCasePriority;
  name: string;
  tags: string[];
}

export const DraggableTestCaseNameCell = ({
  testCase,
  priority,
  name,
  tags,
}: DraggableTestCaseNameCellProps) => {
  const { canMoveTestCase } = useUserPermissions();

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
    canDrag: canMoveTestCase,
    rowSelector: '.test-case-table-row-global',
  });

  return (
    <div ref={dragSourceRef} >
        <TestCaseNameCell
          priority={priority}
          name={name}
          tags={tags}
          dragHandle={
            canMoveTestCase ? (
              <div className={cx('drag-handle')} onMouseDown={handleDragHandleMouseDown}>
                <DragNDropIcon />
              </div>
            ) : undefined
          }
        />
    </div>
  );
};
