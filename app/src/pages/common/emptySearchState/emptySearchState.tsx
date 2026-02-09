/*
 * Copyright 2026 EPAM Systems
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

import { useIntl } from 'react-intl';
import { SearchIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import { EmptySearchStateProps } from './types';
import { messages } from './messages';

import styles from './emptySearchState.scss';

const cx = createClassnames(styles);

export const EmptySearchState = ({ title, message }: EmptySearchStateProps) => {
  const { formatMessage } = useIntl();

  return (
    <li className={cx('empty-search-state')}>
      <div className={cx('empty-search-state__icon')}>
        <SearchIcon />
      </div>
      <div className={cx('empty-search-state__title')}>
        {title || formatMessage(messages.noResultsFound)}
      </div>
      <div className={cx('empty-search-state__message')}>
        {message || formatMessage(messages.noResultsMessage)}
      </div>
    </li>
  );
};
