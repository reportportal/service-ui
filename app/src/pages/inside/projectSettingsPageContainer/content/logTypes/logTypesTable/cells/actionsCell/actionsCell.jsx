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
import { useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import { BaseIconButton, EditIcon, DeleteIcon, Tooltip } from '@reportportal/ui-kit';
import { showModalAction } from 'controllers/modal';
import { PROJECT_SETTINGS_LOG_TYPES_EVENTS } from 'components/main/analytics/events/ga4Events/projectSettingsPageEvents';
import { EditLogTypeModal } from '../../../modals/editLogTypeModal';
import { messages } from '../../../messages';
import styles from './actionsCell.scss';

const cx = classNames.bind(styles);

export const ActionsCell = ({ logType }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const handleEdit = () => {
    trackEvent(PROJECT_SETTINGS_LOG_TYPES_EVENTS.CLICK_EDIT_ICON);
    dispatch(
      showModalAction({
        component: <EditLogTypeModal logType={logType} />,
      }),
    );
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
