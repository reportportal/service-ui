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

import { memo, useCallback, useMemo } from 'react';
import { CheckmarkIcon, DragNDropIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TestCase } from 'types/testCase';
import { useDraggableRow } from 'components/main/draggableTableRow';

import { DepthAwareCheckbox } from '../depthAwareCheckbox';
import { TEST_CASE_DRAG_TYPE, TestCaseDragItem } from '../constants';
import { useTestCaseDragOpacity } from '../hooks/useDragOpacity';

import styles from './selectableTestCase.scss';

const cx = createClassnames(styles);

interface SelectableTestCaseItemProps {
  testCase: TestCase;
  isSelected: boolean;
  isAddedToTestPlan: boolean;
  depth: number;
  canDrag: boolean;
  folderId: number;
  selectedTestCases: TestCase[];
  onToggle: (id: number) => void;
}

export const SelectableTestCase = memo(
  ({
    testCase,
    isSelected,
    isAddedToTestPlan,
    depth,
    canDrag,
    folderId,
    selectedTestCases,
    onToggle,
  }: SelectableTestCaseItemProps) => {
    const handleChange = useCallback(() => {
      onToggle(testCase.id);
    }, [onToggle, testCase.id]);

    const dragItem: TestCaseDragItem = useMemo(() => {
      const shouldDragSelection = isSelected && selectedTestCases.length > 1;
      const items = shouldDragSelection ? selectedTestCases : [testCase];

      return {
        ids: items.map(({ id }) => id),
        testCases: items,
        isMulti: items.length > 1,
      };
    }, [isSelected, selectedTestCases, testCase]);

    const isDimmed = useTestCaseDragOpacity(testCase.id, folderId);

    const { dragSourceRef, handleDragHandleMouseDown } = useDraggableRow<TestCaseDragItem>({
      type: TEST_CASE_DRAG_TYPE,
      item: dragItem,
      canDrag,
      rowSelector: '.selectable-test-case-global',
    });

    return (
      <li ref={dragSourceRef} className={cx('selectable-test-case', 'selectable-test-case-global', { 'selectable-test-case--dimmed': isDimmed })}>
        <div className={cx('selectable-test-case__content')}>
          {!isAddedToTestPlan && (
            <DepthAwareCheckbox
              depth={depth}
              isChecked={isSelected}
              isDisabled={isAddedToTestPlan}
              onChange={handleChange}
            />
          )}
          <span
            className={cx('selectable-test-case__name', {
              'selectable-test-case__name--added': isAddedToTestPlan,
            })}
            title={testCase.name}
          >
            {testCase.name}
          </span>
          <span
            className={cx('selectable-test-case__indicator', {
              'selectable-test-case__indicator--draggable': canDrag,
            })}
            onMouseDown={canDrag ? handleDragHandleMouseDown : undefined}
          >
            {isAddedToTestPlan ? <CheckmarkIcon /> : <DragNDropIcon />}
          </span>
        </div>
      </li>
    );
  },
);
