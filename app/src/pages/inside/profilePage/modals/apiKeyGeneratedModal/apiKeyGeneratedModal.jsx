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
import { useTracking } from 'react-tracking';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Input } from 'components/inputs/input';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { BigButton } from 'components/buttons/bigButton';
import { PROFILE_EVENTS } from 'analyticsEvents/profilePageEvent';
import styles from './apiKeyGeneratedModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'ApiKeyGeneratedModal.header',
    defaultMessage: 'API key generated',
  },
  description: {
    id: 'ApiKeyGeneratedModal.description',
    defaultMessage: 'Copy the API Key and store it in a safe place.',
  },
  descriptionNote: {
    id: 'ApiKeyGeneratedModal.descriptionNote',
    defaultMessage: 'You won’t be able to see your Key once you click "Close" button.',
  },
  loaderText: {
    id: 'ApiKeyGeneratedModal.loaderText',
    defaultMessage: 'GENERATING',
  },
  successNotification: {
    id: 'ApiKeyGeneratedModal.successNotification',
    defaultMessage: 'API Key has been copied successfully',
  },
});

function ApiKeyGenerated({ data }) {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const { apiKey } = data;

  const onCopy = () => {
    dispatch(
      showNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: formatMessage(messages.successNotification),
      }),
    );
    trackEvent(PROFILE_EVENTS.CLICK_COPY_TO_CLIPBOARD_BUTTON);
  };

  const copyButton = (
    <CopyToClipboard text={apiKey} onCopy={onCopy}>
      <BigButton color="booger">{formatMessage(COMMON_LOCALE_KEYS.COPY_TO_CLIPBOARD)}</BigButton>
    </CopyToClipboard>
  );

  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CLOSE),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.header)}
      customButton={copyButton}
      cancelButton={cancelButton}
      closeConfirmation={{ confirmationWarning: '' }}
    >
      <div className={cx('description')}>{formatMessage(messages.description)}</div>
      <div className={cx('description-note')}>{formatMessage(messages.descriptionNote)}</div>
      <div className={cx('input')}>
        <Input readonly value={apiKey} />
      </div>
    </ModalLayout>
  );
}
ApiKeyGenerated.propTypes = {
  data: PropTypes.shape({
    apiKey: PropTypes.string.isRequired,
  }),
};

export const ApiKeyGeneratedModal = withModal('apiKeyGeneratedModal')(ApiKeyGenerated);
