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
import { useIntl, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { useDispatch } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import { docsReferences } from 'common/utils/referenceDictionary';
import { PROFILE_EVENTS } from 'analyticsEvents/profilePageEvent';
import { ENTER_KEY_CODE } from 'common/constants/keyCodes';
import styles from './noApiKeysBlock.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'ApiKeys.noApiKeys.header',
    defaultMessage: 'No API Keys',
  },
  generateApiKey: {
    id: 'ApiKeys.noApiKeys.generateButton',
    defaultMessage: 'Generate API Key',
  },
  description: {
    id: 'ApiKeys.noApiKeys.description',
    defaultMessage:
      'In order to provide security for your own domain password, you can use a user key — to verify your account to be able to report with agent.',
  },
  documentation: {
    id: 'ApiKeys.noApiKeys.documentation',
    defaultMessage: 'Documentation',
  },
});

export const NoApiKeysBlock = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const onGenerateClick = () => {
    dispatch(showModalAction({ id: 'generateApiKeyModal' }));
    trackEvent(PROFILE_EVENTS.CLICK_GENERATE_API_KEY_BUTTON());
  };

  const onDocumentationClick = () => {
    trackEvent(PROFILE_EVENTS.CLICK_DOCUMENTATION_LINK());
  };

  const onDocumentationKeyDown = ({ keyCode }) => {
    if (keyCode === ENTER_KEY_CODE) {
      trackEvent(PROFILE_EVENTS.CLICK_DOCUMENTATION_LINK());
    }
  };

  return (
    <div className={cx('no-api-keys-block')}>
      <div className={cx('image-holder')} />
      <div className={cx('header')}>{formatMessage(messages.header)}</div>
      <div className={cx('description')}>{formatMessage(messages.description)}</div>
      <div className={cx('generate-button')}>
        <GhostButton onClick={onGenerateClick} title={formatMessage(messages.generateApiKey)}>
          {formatMessage(messages.generateApiKey)}
        </GhostButton>
      </div>
      <div
        className={cx('documentation')}
        onClick={onDocumentationClick}
        onKeyDown={onDocumentationKeyDown}
        title={formatMessage(messages.documentation)}
      >
        <a
          className={cx('documentation-link')}
          href={docsReferences.authorizationWithUsersApiKeyForAgents}
          target="_blank"
        >
          {formatMessage(messages.documentation)}
        </a>
      </div>
    </div>
  );
};
