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

import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import ErrorIcon from 'common/img/error-inline.svg';
import styles from './noResultsForFilter.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  checkQuery: {
    id: 'NoResultsForFilter.checkQuery',
    defaultMessage: 'Check your query and try again',
  },
});

export const NoResultsForFilter = injectIntl(
  ({ intl: { formatMessage }, filter, notFoundMessage, notFoundAdditionalMessage }) => (
    <div className={cx('no-results-for-filter')}>
      <p className={cx('no-results-for-filter-text')}>
        <i className={cx('no-results-for-filter-icon')}>{Parser(ErrorIcon)}</i>
        {Parser(
          formatMessage(notFoundMessage, {
            filter: `<span className=${cx('no-results-for-filter-expression')}>${filter}</span>`,
          }),
        )}
      </p>
      <p className={cx('no-results-for-filter-hint')}>
        {formatMessage(notFoundAdditionalMessage || messages.checkQuery)}
      </p>
    </div>
  ),
);

NoResultsForFilter.propTypes = {
  filter: PropTypes.string.isRequired,
  notFoundMessage: PropTypes.object.isRequired,
  noItemsAdditionalMessage: PropTypes.object,
};
