/*
 * Copyright 2025 EPAM Systems
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

import { PropsWithChildren } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import isNumber from 'lodash.isnumber';

import { Button, PlusIcon, DragAndDropIcon, DragNDropIcon, DeleteIcon } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import styles from './attachmentArea.scss';

const cx = classNames.bind(styles) as typeof classNames;

const messages = defineMessages({
  attachments: {
    id: 'createTestCaseModal.attachments',
    defaultMessage: 'Attachments',
  },
  dropFilesHere: {
    id: 'createTestCaseModal.dropFilesHere',
    defaultMessage: 'Drop files here or press',
  },
});

interface AttachmentAreaProps {
  isDraggable?: boolean;
  index?: number;
  isNumberable?: boolean;
  onRemove?: () => void;
  isDragAndDropIconVisible?: boolean;
  isAttachmentBlockVisible?: boolean;
}

export const AttachmentArea = ({
  isDraggable = false,
  index,
  isNumberable = true,
  children,
  onRemove,
  isDragAndDropIconVisible = true,
  isAttachmentBlockVisible = true,
}: PropsWithChildren<AttachmentAreaProps>) => {
  const { formatMessage } = useIntl();

  const areaNumber = isNumber(index) ? index + 1 : '';

  return (
    <div className={cx('attachment-area')}>
      {isNumberable && (
        <div className={cx('attachment-area__number')}>
          <div className={cx('attachment-area__drag')}>
            {areaNumber}
            {isDraggable && (
              <Button variant="text" adjustWidthOn="content">
                <DragNDropIcon />
              </Button>
            )}
          </div>
          {onRemove && (
            <Button variant="text" adjustWidthOn="content" onClick={onRemove}>
              <DeleteIcon />
            </Button>
          )}
        </div>
      )}
      <div className={cx('attachment-area__fields-container')}>
        <div className={cx('attachment-area__fields')}>{children}</div>
        {isAttachmentBlockVisible && (
          <div className={cx('attachment-area__attachment')}>
            <span>{formatMessage(messages.attachments)}</span>
            <div className={cx('attachment-area__add-attachment')}>
              <span>
                {isDragAndDropIconVisible && <DragAndDropIcon />}{' '}
                {formatMessage(messages.dropFilesHere)}
              </span>
              <Button variant="text" icon={<PlusIcon />} adjustWidthOn="content">
                {formatMessage(COMMON_LOCALE_KEYS.ADD)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
