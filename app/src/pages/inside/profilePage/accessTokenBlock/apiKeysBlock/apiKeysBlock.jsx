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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useDispatch } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import { BlockContainerBody, BlockContainerHeader } from 'pages/inside/profilePage/blockContainer';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { daysFromNow } from 'common/utils';
import styles from './apiKeysBlock.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  generateApiKey: {
    id: 'AccessTokenBlock.ApiKeysBlock.generateButton',
    defaultMessage: 'Generate API Key',
  },
  description: {
    id: 'AccessTokenBlock.ApiKeysBlock.description',
    defaultMessage:
      'In order to provide security for your own domain password, you can use a user key — to verify your account to be able to log with agent.',
  },
  headerNameCol: {
    id: 'AccessTokenBlock.ApiKeysBlock.headerNameCol',
    defaultMessage: 'API key name',
  },
  headerDateCol: {
    id: 'AccessTokenBlock.ApiKeysBlock.headerDateCol',
    defaultMessage: 'created',
  },
  revoke: {
    id: 'AccessTokenBlock.ApiKeysBlock.revoke',
    defaultMessage: 'Revoke',
  },
});

export const ApiKeysBlock = ({ apiKeys }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  return (
    <div className={cx('api-keys-block')}>
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
      <div className={cx('api-keys-block')}>
        <BlockContainerHeader>
          <div className={cx('name-col')}>{formatMessage(messages.headerNameCol)}</div>
          <div className={cx('date-col')}>{formatMessage(messages.headerDateCol)}</div>
          <div className={cx('revoke-col')} />
        </BlockContainerHeader>
        <ScrollWrapper autoHeight autoHeightMax={370}>
          <BlockContainerBody>
            {apiKeys.map((key) => (
              <div key={key.name} className={cx('key-item')}>
                <div className={cx('name-col')}>{key.name}</div>
                <div className={cx('date-col')}>{daysFromNow(key.created_at)}</div>
                <div className={cx('revoke-col')}>
                  <button
                    className={cx('revoke-button')}
                    onClick={() => {
                      dispatch(
                        showModalAction({
                          id: 'revokeApiKeyModal',
                          data: { ...key },
                        }),
                      );
                    }}
                    title={formatMessage(messages.revoke)}
                  >
                    <FormattedMessage {...messages.revoke} />
                  </button>
                </div>
              </div>
            ))}
          </BlockContainerBody>
        </ScrollWrapper>
      </div>
    </div>
  );
};
ApiKeysBlock.propTypes = {
  apiKeys: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      created_at: PropTypes.number.isRequired,
    }),
  ),
};
ApiKeysBlock.defaultProps = {
  apiKeys: [],
};
