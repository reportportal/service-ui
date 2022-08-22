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

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { projectIdSelector } from 'controllers/pages';
import { AsyncMultipleAutocomplete } from 'componentLibrary/autocompletes/asyncMultipleAutocomplete';
import { SystemMessage } from 'componentLibrary/systemMessage';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './launchNamesContainer.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  launchNamesPlaceholder: {
    id: 'AddEditNotificationCaseModal.launchNamesPlaceholder',
    defaultMessage: 'Launch name',
  },
  launchNamesNote: {
    id: 'AddEditNotificationCaseModal.launchNamesNote',
    defaultMessage: 'Send notifications on the finish of selected launches',
  },
  launchNamesMessageCaption: {
    id: 'AddEditNotificationCaseModal.launchNamesMessageCaption',
    defaultMessage:
      'Notification won’t work for the highlighted launch until you add the Launch to ReportPortal',
  },
  launchNamesMessageText: {
    id: 'AddEditNotificationCaseModal.launchNamesMessageText',
    defaultMessage: 'The Launch you want to analyze is not in the database yet',
  },
});

export const LaunchNamesContainer = ({ ...rest }) => {
  const { formatMessage } = useIntl();
  const activeProject = useSelector(projectIdSelector);
  const [showMessage, setShowMessage] = useState(false);

  const handleSystemMessage = (items, storedItems) =>
    setShowMessage(items.length !== Object.keys(storedItems).length);

  return (
    <>
      <AsyncMultipleAutocomplete
        placeholder={formatMessage(messages.launchNamesPlaceholder)}
        getURI={URLS.launchNameSearch(activeProject)}
        createWithoutConfirmation
        creatable
        highlightUnStoredItem
        handleUnStoredItemCb={handleSystemMessage}
        {...rest}
      />
      <span className={cx('helper-text')}>{formatMessage(messages.launchNamesNote)}</span>
      {showMessage && (
        <div className={cx('system-message')}>
          <SystemMessage
            mode="warning"
            header={formatMessage(COMMON_LOCALE_KEYS.warning)}
            caption={formatMessage(messages.launchNamesMessageCaption)}
          >
            <span className={cx('system-message-description')}>
              {formatMessage(messages.launchNamesMessageText)}
            </span>
          </SystemMessage>
        </div>
      )}
    </>
  );
};
