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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './retriesCounter.scss';

const cx = classNames.bind(styles);

const formatStatusClassName = (status = '') => `status-${status.toLowerCase()}`;

const getRetries = (testItem) => [...testItem.retries, testItem];

export const RetriesCounter = ({ testItem, onLabelClick }) => {
  const retries = getRetries(testItem);
  return (
    <div className={cx('retries-counter')}>
      <div className={cx('retries-statuses')}>
        {retries.map((retry) => (
          <div
            key={retry.id}
            className={cx('status-indicator', formatStatusClassName(retry.status))}
          />
        ))}
      </div>
      <div className={cx('retries-label')}>
        <div className={cx('desktop-label')} onClick={onLabelClick}>
          <FormattedMessage
            id="RetriesCounter.label"
            defaultMessage="{count} retries"
            values={{ count: retries.length }}
          />
        </div>
        <div className={cx('mobile-label')}>
          <FormattedMessage
            id="RetriesCounter.label"
            defaultMessage="{count} retries"
            values={{ count: retries.length }}
          />
        </div>
      </div>
    </div>
  );
};
RetriesCounter.propTypes = {
  testItem: PropTypes.object.isRequired,
  retries: PropTypes.arrayOf(PropTypes.object),
  onLabelClick: PropTypes.func,
};
RetriesCounter.defaultProps = {
  retries: [],
  onLabelClick: () => {},
};
