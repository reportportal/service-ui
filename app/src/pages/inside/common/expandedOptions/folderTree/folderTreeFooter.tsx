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

import { messages } from '../messages';

import styles from './folderTreeFooter.scss';

const cx = createClassnames(styles);

interface FolderTreeFooterProps {
  isFlatView: boolean;
  isExpandAllDisabled: boolean;
  isCollapseAllDisabled: boolean;
  onFlatViewChange: (value: boolean) => void;
  onExpandAll: VoidFn;
  onCollapseAll: VoidFn;
}

export const FolderTreeFooter = ({
  isFlatView,
  isExpandAllDisabled,
  isCollapseAllDisabled,
  onFlatViewChange,
  onExpandAll,
  onCollapseAll,
}: FolderTreeFooterProps) => {
  const { formatMessage } = useIntl();

  const handleFlatViewChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFlatViewChange(event.currentTarget.checked);
  };

  return (
    <div className={cx('folder-tree-footer')}>
      <Toggle
        value={isFlatView}
        className={cx('folder-tree-footer__toggle')}
        onChange={handleFlatViewChange}
      >
        {formatMessage(messages.flatView)}
      </Toggle>
      {!isFlatView && (
        <div className={cx('folder-tree-footer__actions')}>
          <Button variant="text" disabled={isExpandAllDisabled} onClick={onExpandAll}>
            {formatMessage(messages.expandAll)}
          </Button>
          <Button variant="text" disabled={isCollapseAllDisabled} onClick={onCollapseAll}>
            {formatMessage(messages.collapseAll)}
          </Button>
        </div>
      )}
    </div>
  );
};
