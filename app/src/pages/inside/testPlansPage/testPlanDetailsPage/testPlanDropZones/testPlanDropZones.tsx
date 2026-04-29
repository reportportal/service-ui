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

import { useIntl } from 'react-intl';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useDragLayer, DragLayerMonitor } from 'react-dnd';

import { createClassnames } from 'common/utils';
import { TransformedFolder } from 'controllers/testCase';
import { TestCase } from 'types/testCase';
import {
  FOLDER_DRAG_TYPE,
  TEST_CASE_DRAG_TYPE,
  DragItem,
  FolderDragItem,
  TestCaseDragItem,
} from 'pages/inside/common/testLibrarySidePanel/constants';

import { DropZone } from './dropZone';
import { messages } from './messages';

import styles from './testPlanDropZones.scss';

const cx = createClassnames(styles);

interface TestPlanDropZonesProps {
  onAddTestCasesToTestPlan: (testCases: TestCase[]) => void;
  onAddTestCasesAndCreateLaunch: (testCases: TestCase[]) => void;
  onAddFolderToTestPlan: (folder: TransformedFolder) => void;
  onAddFolderAndCreateLaunch: (folder: TransformedFolder) => void;
}

export const TestPlanDropZones = ({
  onAddTestCasesToTestPlan,
  onAddTestCasesAndCreateLaunch,
  onAddFolderToTestPlan,
  onAddFolderAndCreateLaunch,
}: TestPlanDropZonesProps): ReactNode => {
  const { formatMessage } = useIntl();
  const { isDragging, itemType } = useDragLayer((monitor: DragLayerMonitor) => ({
    isDragging: monitor.isDragging(),
    itemType: monitor.getItemType(),
  }));

  const isDraggingItems =
    isDragging && (itemType === TEST_CASE_DRAG_TYPE || itemType === FOLDER_DRAG_TYPE);

  if (!isDraggingItems) {
    return null;
  }

  const handleAddDrop = (item: DragItem, droppedItemType: string | symbol | null) => {
    if (droppedItemType === FOLDER_DRAG_TYPE) {
      onAddFolderToTestPlan((item as FolderDragItem).folder);
    } else {
      onAddTestCasesToTestPlan((item as TestCaseDragItem).testCases);
    }
  };

  const handleAddAndCreateLaunchDrop = (
    item: DragItem,
    droppedItemType: string | symbol | null,
  ) => {
    if (droppedItemType === FOLDER_DRAG_TYPE) {
      onAddFolderAndCreateLaunch((item as FolderDragItem).folder);
    } else {
      onAddTestCasesAndCreateLaunch((item as TestCaseDragItem).testCases);
    }
  };

  return createPortal(
    <div className={cx('test-plan-drop-zones')}>
      <DropZone
        variant="add-launch"
        title={formatMessage(messages.addAndCreateLaunchTitle)}
        subtitle={formatMessage(messages.addAndCreateLaunchHint)}
        onDrop={handleAddAndCreateLaunchDrop}
      />
      <DropZone
        variant="add"
        title={formatMessage(messages.addToTestPlanTitle)}
        subtitle={formatMessage(messages.addToTestPlanHint)}
        showIcon
        onDrop={handleAddDrop}
      />
      <DropZone
        variant="cancel"
        title={formatMessage(messages.cancelAddingTitle)}
        subtitle={formatMessage(messages.cancelAddingHint)}
      />
    </div>,
    document.body,
  );
};
