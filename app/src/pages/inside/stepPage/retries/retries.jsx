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
import { RetriesList } from './retriesList';
import { StackTrace } from './stackTrace';
import styles from './retries.scss';

const cx = classNames.bind(styles);

export const Retries = ({
  testItemId,
  retries,
  selectedId,
  logItem,
  selectedIndex,
  loading,
  onRetrySelect,
  collapsed,
}) => (
  <div className={cx('retries')}>
    <div className={cx('list')}>
      <RetriesList retries={retries} selectedId={selectedId} onRetrySelect={onRetrySelect} />
    </div>
    <div className={cx('details', { collapsed })}>
      <StackTrace
        retryId={selectedId}
        testItemId={testItemId}
        index={selectedIndex}
        message={logItem ? logItem.message : ''}
        loading={loading}
      />
    </div>
  </div>
);
Retries.propTypes = {
  testItemId: PropTypes.number.isRequired,
  retries: PropTypes.arrayOf(PropTypes.object),
  selectedId: PropTypes.number.isRequired,
  logItem: PropTypes.object,
  selectedIndex: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  onRetrySelect: PropTypes.func,
  collapsed: PropTypes.bool.isRequired,
};
Retries.defaultProps = {
  retries: [],
  logItem: {},
  loading: false,
  onRetrySelect: () => {},
};
