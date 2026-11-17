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
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import Parser from 'html-react-parser';
import { Modal } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { deleteLogTypeAction, projectKeySelector } from 'controllers/project';
import { PROJECT_SETTINGS_LOG_TYPES_EVENTS } from 'components/main/analytics/events/ga4Events/projectSettingsPageEvents';
import { messages } from '../messages';
import styles from './deleteLogTypeModal.scss';

const cx = classNames.bind(styles);

export const DeleteLogTypeModal = ({ logType }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const projectKey = useSelector(projectKeySelector);

  const handleDelete = () => {
    const onSuccess = () => {
      trackEvent(PROJECT_SETTINGS_LOG_TYPES_EVENTS.CLICK_DELETE_IN_MODAL);
      dispatch(hideModalAction());
    };

    dispatch(deleteLogTypeAction(logType.id, projectKey, onSuccess));
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    variant: 'danger',
    onClick: handleDelete,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.deleteModalTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('modal-content')}>
        {Parser(
          formatMessage(messages.deleteModalMessage, {
            name: logType.name,
            b: (chunks) => `<b>${chunks}</b>`,
          }),
        )}
      </div>
    </Modal>
  );
};

DeleteLogTypeModal.propTypes = {
  logType: PropTypes.object.isRequired,
};
