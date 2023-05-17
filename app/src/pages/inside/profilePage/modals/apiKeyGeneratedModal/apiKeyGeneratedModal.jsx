/*
 * Copyright 2023 EPAM Systems
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
import { useDispatch } from 'react-redux';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Input } from 'components/inputs/input';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import styles from './apiKeyGeneratedModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'ApiKeyGeneratedModal.header',
    defaultMessage: 'API key generated',
  },
  description: {
    id: 'ApiKeyGeneratedModal.description',
    defaultMessage:
      'Copy the API Key and store it in a safe place. \n' +
      'You won’t be able to see your Key once you click Close button.',
  },
  loaderText: {
    id: 'ApiKeyGeneratedModal.loaderText',
    defaultMessage: 'GENERATING',
  },
  successNotification: {
    id: 'ApiKeyGeneratedModal.successNotification',
    defaultMessage: 'API Key has been copied successfully',
  },
  notificationFail: {
    id: 'ApiKeyGeneratedModal.successNotificationFail',
    defaultMessage: 'API Key copy failed',
  },
});

const ApiKeyGenerated = ({ data }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { token } = data;

  const copyToClipBoard = async (copy) => {
    try {
      await navigator.clipboard.writeText(copy);
      dispatch(
        showNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: formatMessage(messages.successNotification),
        }),
      );
    } catch (err) {
      dispatch(
        showNotification({
          type: NOTIFICATION_TYPES.ERROR,
          message: formatMessage(messages.notificationFail),
        }),
      );
    }
  };

  const copyButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.COPY_TO_CLIPBOARD),
    onClick: () => {
      copyToClipBoard(token);
    },
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.header)}
      okButton={copyButton}
      cancelButton={cancelButton}
      closeConfirmation={{ confirmationWarning: '' }}
    >
      <div className={cx('description')}>
        <FormattedMessage {...messages.description} />
      </div>
      <div className={cx('input')}>
        <Input readonly value={token} />
      </div>
    </ModalLayout>
  );
};
ApiKeyGenerated.propTypes = {
  data: PropTypes.shape({
    token: PropTypes.string.isRequired,
  }),
};

export const ApiKeyGeneratedModal = withModal('apiKeyGeneratedModal')(ApiKeyGenerated);
