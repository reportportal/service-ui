/*
 * Copyright 2019 EPAM Systems
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

import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { NoItemMessage } from 'components/main/noItemMessage';
import styles from './notFound.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  launchNotFound: {
    id: 'LaunchesPage.launchNotFound',
    defaultMessage: 'Launch is not found',
  },
  notFoundDescription: {
    id: 'LaunchesPage.checkQuery',
    defaultMessage: 'Failed to load data for launches table',
  },
  itemNotFound: {
    id: 'LaunchesPage.itemNotFound',
    defaultMessage: 'Item is not found',
  },
});

export const NotFound = injectIntl(({ intl: { formatMessage }, isItemNotFound }) => (
  <div className={cx('launch-not-found')}>
    <NoItemMessage
      message={formatMessage(isItemNotFound ? messages.itemNotFound : messages.launchNotFound)}
    />
    <p className={cx('launch-not-found-hint')}>{formatMessage(messages.notFoundDescription)}</p>
  </div>
));
