/*
 * Copyright 2024 EPAM Systems
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
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { RETENTION_POLICY } from 'common/constants/retentionPolicy';
import { withModal, ModalLayout } from 'components/main/modal';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import { useFetchRetentionPolicy } from '../hooks';
import styles from './unmarkAsImportantModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  unmarkAsImportant: {
    id: 'UnmarkAsImportantModal.unmarkAsImportant',
    defaultMessage: 'Unmark as Important',
  },
  unmark: {
    id: 'UnmarkAsImportantModal.unmark',
    defaultMessage: 'Unmark',
  },
  descriptionNote: {
    id: 'UnmarkAsImportantModal.descriptionNote',
    defaultMessage: 'Are you sure you want to unmark the important attribute from this launch?',
  },
  note: {
    id: 'UnmarkAsImportantModal.note',
    defaultMessage: 'In the future, this launch will be processed by the basic retention policy.',
  },
});

const UnmarkAsImportantModal = ({ data }) => {
  const { formatMessage } = useIntl();

  const { activeProject, launch, onSuccess } = data;

  const { fetchRetentionPolicy } = useFetchRetentionPolicy(
    RETENTION_POLICY.REGULAR,
    activeProject,
    launch,
    onSuccess,
  );

  const onSubmit = (closeModal) => {
    fetchRetentionPolicy();
    closeModal();
  };

  const okButton = {
    text: formatMessage(messages.unmark),
    onClick: onSubmit,
    danger: true,
    eventInfo: LAUNCHES_MODAL_EVENTS.CLICK_UNMARK_AS_IMPORTANT_BTN_MODAL,
  };

  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.unmarkAsImportant)}
      okButton={okButton}
      cancelButton={cancelButton}
    >
      <div className={cx('content')}>
        <p>{formatMessage(messages.descriptionNote)}</p>
        <p>{formatMessage(messages.note)}</p>
      </div>
    </ModalLayout>
  );
};
UnmarkAsImportantModal.propTypes = {
  data: PropTypes.object,
};

export default withModal('unmarkAsImportantModal')(UnmarkAsImportantModal);
