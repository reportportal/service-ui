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

import { KeyboardEvent, memo, useCallback } from 'react';
import { CheckmarkIcon, DragNDropIcon, TestCaseIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TestCase } from 'types/testCase';
import { useDraggableRow } from 'components/main/draggableTableRow';

import { DepthAwareCheckbox } from '../depthAwareCheckbox';
import { DragItem } from '../constants';
import { useTestCaseDragOpacity } from '../hooks/useDragOpacity';
import { startDragOnKeyboard } from '../utils';
import { useTestCaseDragPayload } from './useTestCaseDragPayload';

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

    const { type: dragType, item: dragItem } = useTestCaseDragPayload({
      testCase,
      isSelected,
      selectedTestCases,
      folderId,
    });

    const isDimmed = useTestCaseDragOpacity(testCase.id, folderId);

    const { dragSourceRef, handleDragHandleMouseDown, startDragFromHandle } =
      useDraggableRow<DragItem>({
        type: dragType,
        item: dragItem,
        canDrag,
        rowSelector: '.selectable-test-case-global',
      });

    const handleDragHandleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) =>
        startDragOnKeyboard(event, startDragFromHandle, canDrag),
      [canDrag, startDragFromHandle],
    );

    return (
      <li
        ref={dragSourceRef}
        className={cx('selectable-test-case', 'selectable-test-case-global', {
          'selectable-test-case--dimmed': isDimmed,
        })}
      >
        <div className={cx('selectable-test-case__content')}>
          {!isAddedToTestPlan && (
            <DepthAwareCheckbox
              depth={depth}
              isChecked={isSelected}
              isDisabled={isAddedToTestPlan}
              onChange={handleChange}
            />
          )}
          <TestCaseIcon className={cx('selectable-test-case__icon')} />
          <span
            className={cx('selectable-test-case__name', {
              'selectable-test-case__name--added': isAddedToTestPlan,
            })}
            title={testCase.name}
          >
            {testCase.name}
          </span>
          <button
            type="button"
            aria-label="Drag to reorder"
            disabled={!canDrag}
            className={cx('selectable-test-case__indicator', {
              'selectable-test-case__indicator--draggable': canDrag,
            })}
            onMouseDown={canDrag ? handleDragHandleMouseDown : undefined}
            onKeyDown={handleDragHandleKeyDown}
          >
            {isAddedToTestPlan ? <CheckmarkIcon /> : <DragNDropIcon />}
          </button>
        </div>
      </li>
    );
  },
);
