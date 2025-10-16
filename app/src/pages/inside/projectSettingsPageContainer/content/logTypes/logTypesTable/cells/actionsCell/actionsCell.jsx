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

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { BaseIconButton, EditIcon, DeleteIcon, Tooltip } from '@reportportal/ui-kit';
import { messages } from '../../../messages';
import styles from './actionsCell.scss';

const cx = classNames.bind(styles);

export const ActionsCell = ({ logType }) => {
  const { formatMessage } = useIntl();

  const handleEdit = () => {
    // TODO: Implement edit functionality
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
  };

  const deleteButton = (
    <BaseIconButton onClick={handleDelete} disabled={logType.is_system}>
      <DeleteIcon />
    </BaseIconButton>
  );

  return (
    <div className={cx('actions')}>
      <BaseIconButton onClick={handleEdit}>
        <EditIcon />
      </BaseIconButton>
      {logType.is_system ? (
        <Tooltip
          wrapperClassName={cx('tooltip-wrapper')}
          content={formatMessage(messages.systemLogTypeTooltip)}
          placement="bottom-end"
        >
          {deleteButton}
        </Tooltip>
      ) : (
        deleteButton
      )}
    </div>
  );
};

ActionsCell.propTypes = {
  logType: PropTypes.object,
};
