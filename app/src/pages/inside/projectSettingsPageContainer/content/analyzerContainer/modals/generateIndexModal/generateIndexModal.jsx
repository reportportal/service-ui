/*
 * Copyright 2022 EPAM Systems
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
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetchProjectAction } from 'controllers/project';
import { projectIdSelector } from 'controllers/pages';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { withModal } from 'components/main/modal';
import { Modal } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import styles from './generateIndexModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  generateIndexHeader: {
    id: 'GenerateIndexModal.headerGenerateIndexModal',
    defaultMessage: 'Generate index',
  },
  contentHeaderMessage: {
    id: 'GenerateIndexModal.contentHeaderMessage',
    defaultMessage: 'Are you sure to generate index in the search engine?',
  },
  noteBlockTitle: {
    id: 'GenerateIndexModal.noteBlockTitle',
    defaultMessage: 'Note:',
  },
  noteBlockText: {
    id: 'GenerateIndexModal.noteBlockText',
    defaultMessage: 'You will receive an e-mail after the end of the process.',
  },
  generateButtonText: {
    id: 'GenerateIndexModal.generateButtonText',
    defaultMessage: 'Generate',
  },
  generateSuccessNotification: {
    id: 'GenerateIndexModal.generateSuccessNotification',
    defaultMessage: 'Index generation is in progress',
  },
});

const GenerateIndexModal = ({ data }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const projectId = useSelector(projectIdSelector);

  const onClickGenerate = () => {
    fetch(URLS.projectIndex(projectId), { method: 'put' })
      .then(() => {
        dispatch(
          showNotification({
            message: formatMessage(messages.generateSuccessNotification),
            type: NOTIFICATION_TYPES.SUCCESS,
          }),
        );
        dispatch(fetchProjectAction(projectId));
      })
      .catch((error) => dispatch(showDefaultErrorNotification(error)));
    dispatch(hideModalAction());
  };

  const okButton = {
    text: formatMessage(messages.generateButtonText),
    onClick: onClickGenerate,
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <Modal
      title={data.modalTitle || formatMessage(messages.generateIndexHeader)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      {data.modalDescription || formatMessage(messages.contentHeaderMessage)}
      <div className={cx('note-block')}>
        <p className={cx('note-title')}>{formatMessage(messages.noteBlockTitle)}</p>
        <p className={cx('note-text')}>{formatMessage(messages.noteBlockText)}</p>
      </div>
    </Modal>
  );
};
GenerateIndexModal.propTypes = {
  data: PropTypes.shape({
    modalTitle: PropTypes.string,
    modalDescription: PropTypes.string,
  }),
};
GenerateIndexModal.defaultProps = {
  data: {
    modalTitle: '',
    modalDescription: '',
  },
};

export default withModal('generateIndexModalWindow')(GenerateIndexModal);
