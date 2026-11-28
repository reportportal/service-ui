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
import { useIntl } from 'react-intl';
import {
  Button,
  FlatViewIcon,
  SegmentedControl,
  SubfoldersIcon,
  TreeViewIcon,
} from '@reportportal/ui-kit';
import type {
  SegmentedControlOption,
  SegmentedControlValue,
} from '@reportportal/ui-kit/segmentedControl';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { FolderTreeViewMode } from 'common/utils/folderUtils';
import { FOLDER_TREE_VIEW_CONTROL_ELEMENT_NAME } from 'analyticsEvents/testCaseLibraryPageEvents';

import { messages } from '../messages';
import { FolderTreeViewControlHandler } from '../types';

import styles from './folderTreeFooter.scss';

const cx = createClassnames(styles);

const VIEW_MODE_OPTIONS = [
  { value: FolderTreeViewMode.TREE, icon: <TreeViewIcon />, tooltip: messages.treeView },
  { value: FolderTreeViewMode.FLAT, icon: <FlatViewIcon />, tooltip: messages.flatView },
  {
    value: FolderTreeViewMode.SUBFOLDERS,
    icon: <SubfoldersIcon />,
    tooltip: messages.subfoldersView,
  },
];

interface FolderTreeFooterProps {
  viewMode: FolderTreeViewMode;
  viewModes: FolderTreeViewMode[];
  isExpandAllDisabled: boolean;
  isCollapseAllDisabled: boolean;
  showBottomFade?: boolean;
  onViewModeChange: (viewMode: FolderTreeViewMode) => void;
  onExpandAll: VoidFn;
  onCollapseAll: VoidFn;
  onTrackViewControl?: FolderTreeViewControlHandler;
}

export const FolderTreeFooter = ({
  viewMode,
  viewModes,
  isExpandAllDisabled,
  isCollapseAllDisabled,
  showBottomFade = false,
  onViewModeChange,
  onExpandAll,
  onCollapseAll,
  onTrackViewControl,
}: FolderTreeFooterProps) => {
  const { formatMessage } = useIntl();

  const viewModeOptions = useMemo<SegmentedControlOption[]>(
    () =>
      VIEW_MODE_OPTIONS.filter(({ value }) => viewModes.includes(value)).map(
        ({ value, icon, tooltip }) => ({
          value,
          icon,
          tooltip: formatMessage(tooltip),
          selected: value === viewMode,
        }),
      ),
    [viewModes, viewMode, formatMessage],
  );

  const handleViewModeChange = (value: SegmentedControlValue) => {
    const nextViewMode = value as FolderTreeViewMode;

    if (nextViewMode === viewMode) {
      return;
    }

    if (nextViewMode === FolderTreeViewMode.FLAT) {
      onTrackViewControl?.(FOLDER_TREE_VIEW_CONTROL_ELEMENT_NAME.FLAT_VIEW_ACTIVE);
    }

    onViewModeChange(nextViewMode);
  };

  const handleExpandAll = () => {
    onTrackViewControl?.(FOLDER_TREE_VIEW_CONTROL_ELEMENT_NAME.EXPAND_ALL);
    onExpandAll();
  };

  const handleCollapseAll = () => {
    onTrackViewControl?.(FOLDER_TREE_VIEW_CONTROL_ELEMENT_NAME.COLLAPSE_ALL);
    onCollapseAll();
  };

  return (
    <div
      className={cx('folder-tree-footer', {
        'folder-tree-footer--fade-bottom': showBottomFade,
      })}
    >
      <SegmentedControl
        options={viewModeOptions}
        ariaLabel={formatMessage(messages.viewMode)}
        onChange={handleViewModeChange}
      />
      {viewMode !== FolderTreeViewMode.FLAT && (
        <div className={cx('folder-tree-footer__actions')}>
          <Button variant="text" disabled={isExpandAllDisabled} onClick={handleExpandAll}>
            {formatMessage(messages.expandAll)}
          </Button>
          <Button variant="text" disabled={isCollapseAllDisabled} onClick={handleCollapseAll}>
            {formatMessage(messages.collapseAll)}
          </Button>
        </div>
      )}
    </div>
  );
};
