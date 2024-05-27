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
import { useDispatch } from 'react-redux';
import Parser from 'html-react-parser';
import { defineMessages, useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal, ModalLayout } from 'components/main/modal';
import { hideModalAction } from 'controllers/modal';
import InfoYellowIcon from './icon/info-yellow-inline.svg';
import { useFetchRetentionPolicy } from '../hooks';
import styles from './markAsImportantModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  markAsImportant: {
    id: 'MarkAsImportantModal.markAsImportant',
    defaultMessage: 'Mark as Important',
  },
  descriptionNote: {
    id: 'MarkAsImportantModal.descriptionNote',
    defaultMessage: 'This launch will be stored forever and can be deleted only manually.',
  },
  note: {
    id: 'MarkAsImportantModal.note',
    defaultMessage:
      'Please, be aware with the number of important launches to prevent running out of memory for regular launches.',
  },
  description: {
    id: 'MarkAsImportantModal.description',
    defaultMessage:
      'If all your memory space is used for important launches and a new important launch is coming, they will be deleted in reverse chronological order, starting with the oldest launches.',
  },
});
const MarkAsImportantModal = ({ data }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const { activeProject, launch, updateLaunchLocally } = data;

  const { fetchRetentionPolicy } = useFetchRetentionPolicy(
    true,
    activeProject,
    launch,
    updateLaunchLocally,
  );

  const onSubmit = (closeModal) => {
    fetchRetentionPolicy();
    closeModal();
  };

  const okButton = {
    text: formatMessage(messages.markAsImportant),
    onClick: onSubmit,
  };

  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.markAsImportant)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('content')}>
        <p>{formatMessage(messages.descriptionNote)}</p>
        <div className={cx('note')}>
          <i>{Parser(InfoYellowIcon)}</i>
          <p>{formatMessage(messages.note)}</p>
        </div>
        <p className={cx('description')}>{formatMessage(messages.description)}</p>
      </div>
    </ModalLayout>
  );
};
MarkAsImportantModal.propTypes = {
  data: PropTypes.object,
};

export default withModal('markAsImportantModal')(MarkAsImportantModal);
