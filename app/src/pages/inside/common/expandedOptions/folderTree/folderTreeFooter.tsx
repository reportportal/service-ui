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

import { ChangeEvent } from 'react';
import { useIntl } from 'react-intl';
import { Button, Toggle } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { FOLDER_TREE_VIEW_CONTROL_ELEMENT_NAME } from 'analyticsEvents/testCaseLibraryPageEvents';

import { messages } from '../messages';
import { FolderTreeViewControlHandler } from '../types';

import styles from './folderTreeFooter.scss';

const cx = createClassnames(styles);

interface FolderTreeFooterProps {
  isFlatView: boolean;
  isExpandAllDisabled: boolean;
  isCollapseAllDisabled: boolean;
  showBottomFade?: boolean;
  onFlatViewChange: (value: boolean) => void;
  onExpandAll: VoidFn;
  onCollapseAll: VoidFn;
  onTrackViewControl?: FolderTreeViewControlHandler;
}

export const FolderTreeFooter = ({
  isFlatView,
  isExpandAllDisabled,
  isCollapseAllDisabled,
  showBottomFade = false,
  onFlatViewChange,
  onExpandAll,
  onCollapseAll,
  onTrackViewControl,
}: FolderTreeFooterProps) => {
  const { formatMessage } = useIntl();

  const handleFlatViewChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.checked;
    if (nextValue && nextValue !== isFlatView) {
      onTrackViewControl?.(FOLDER_TREE_VIEW_CONTROL_ELEMENT_NAME.FLAT_VIEW_ACTIVE);
    }
    onFlatViewChange(nextValue);
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
      <Toggle
        value={isFlatView}
        className={cx('folder-tree-footer__toggle')}
        onChange={handleFlatViewChange}
      >
        {formatMessage(messages.flatView)}
      </Toggle>
      {!isFlatView && (
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
