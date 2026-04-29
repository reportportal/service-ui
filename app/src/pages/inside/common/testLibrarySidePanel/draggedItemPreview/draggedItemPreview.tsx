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
import { FolderIcon } from '@reportportal/ui-kit';
import { DragLayer } from '@reportportal/ui-kit/sortable';

import { createClassnames } from 'common/utils';

import {
  FOLDER_DRAG_TYPE,
  TEST_CASE_DRAG_TYPE,
  FolderDragItem,
  TestCaseDragItem,
} from '../constants';
import { messages } from '../messages';

import styles from './draggedItemPreview.scss';

const cx = createClassnames(styles);

export const DraggedItemPreview = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <div className={cx('dragged-item-preview')} data-auto={'dragged-item-preview'}>
        <>
          <span className={cx('dragged-item-preview__icon', 'dragged-item-preview__icon--leading')}>
            <FolderIcon />
          </span>
          <span className={cx('dragged-item-preview__text')}>Folder name</span>
        </>
      </div>
      <DragLayer
        type={TEST_CASE_DRAG_TYPE}
        previewClassName={cx('dragged-item-preview')}
        renderPreview={(item) => {
          const testCaseItem = item as unknown as TestCaseDragItem;

          return (
            <>
              <span className={cx('dragged-item-preview__text')}>
                {testCaseItem.isMulti
                  ? formatMessage(messages.testCasesCount, { count: testCaseItem.ids.length })
                  : testCaseItem.testCases[0]?.name}
              </span>
            </>
          );
        }}
      />
      <DragLayer
        type={FOLDER_DRAG_TYPE}
        previewClassName={cx('dragged-item-preview')}
        renderPreview={(item) => {
          const folderItem = item as unknown as FolderDragItem;

          return (
            <>
              {!folderItem.isMulti && (
                <span
                  className={cx(
                    'dragged-item-preview__icon',
                    'dragged-item-preview__icon--leading',
                  )}
                >
                  <FolderIcon />
                </span>
              )}
              {!folderItem.isMulti && (
                <span className={cx('dragged-item-preview__text')}>{folderItem.folder.name}</span>
              )}
              <span className={cx('dragged-item-preview__count')}>
                {formatMessage(messages.testCasesCount, {
                  count: folderItem.testCasesCount as string,
                })}
              </span>
            </>
          );
        }}
      />
    </>
  );
};
