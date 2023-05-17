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
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { useDispatch } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import styles from './noApiKeysBlock.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'AccessTokenBlock.noApiKeys.header',
    defaultMessage: 'No API Keys',
  },
  generateApiKey: {
    id: 'AccessTokenBlock.noApiKeys.generateButton',
    defaultMessage: 'Generate API Key',
  },
  description: {
    id: 'NoApiKeysBlock.noApiKeys.description',
    defaultMessage:
      'In order to provide security for your own domain password, you can use a user key — to verify your account to be able to log with agent.',
  },
});

export const NoApiKeysBlock = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  return (
    <div className={cx('no-api-keys-block')}>
      <div className={cx('image-holder')} />
      <div className={cx('header')}>
        <FormattedMessage {...messages.header} />
      </div>
      <div className={cx('description')}>
        <FormattedMessage {...messages.description} />
      </div>
      <button
        className={cx('generate-button')}
        onClick={() => {
          dispatch(showModalAction({ id: 'generateApiKeyModal' }));
        }}
        title={formatMessage(messages.generateApiKey)}
      >
        <FormattedMessage {...messages.generateApiKey} />
      </button>
    </div>
  );
};
