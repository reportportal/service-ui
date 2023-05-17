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

import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { LoaderBlock } from 'pages/inside/profilePage/modals/loaderBlock';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { deleteApiKeysAction } from 'controllers/user';
import styles from './revokeApiKeyModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'RevokeApiKeyModal.header',
    defaultMessage: 'Revoke API key',
  },
  description: {
    id: 'RevokeApiKeyModal.description',
    defaultMessage: 'Are you sure you want to revoke API Key "{name}"?',
  },
  revoke: {
    id: 'RevokeApiKeyModal.revoke',
    defaultMessage: 'Revoke',
  },
  successNotification: {
    id: 'RevokeApiKeyModal.successNotification',
    defaultMessage: 'API Key has been revoked successfully',
  },
  notificationFail: {
    id: 'RevokeApiKeyModal.notificationFail',
    defaultMessage: 'API Key revoke failed',
  },
  loaderText: {
    id: 'RevokeApiKeyModal.loaderText',
    defaultMessage: 'REVOKING',
  },
});

const RevokeApiKey = ({ data }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { name, id } = data;
  const [loading, setLoading] = useState(false);

  const onRevoke = (closeModal) => {
    setLoading(true);
    dispatch(
      deleteApiKeysAction({
        apiKeyId: id,
        successMessage: formatMessage(messages.successNotification),
        errorMessage: formatMessage(messages.notificationFail),
        onSuccess: () => closeModal(),
      }),
    );
  };

  const revokeButton = {
    text: formatMessage(messages.revoke),
    onClick: (closeModal) => {
      setLoading(true);
      onRevoke(closeModal);
    },
    danger: true,
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.header)}
      okButton={loading ? null : revokeButton}
      cancelButton={loading ? null : cancelButton}
    >
      {loading ? (
        <LoaderBlock text={formatMessage(messages.loaderText)} className={cx('loader-block')} />
      ) : (
        <div className={cx('description')}>
          <FormattedMessage {...messages.description} values={{ name }} />
        </div>
      )}
    </ModalLayout>
  );
};
RevokeApiKey.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

export const RevokeApiKeyModal = withModal('revokeApiKeyModal')(
  connect(null, {
    deleteApiKeysAction,
  })(RevokeApiKey),
);
