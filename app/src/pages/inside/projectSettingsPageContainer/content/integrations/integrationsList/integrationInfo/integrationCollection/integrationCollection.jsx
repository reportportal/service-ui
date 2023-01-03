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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import moment from 'moment';
import { IntegrationCollectionItem } from './integrationCollectionItem';
import styles from './integrationCollection.scss';

const cx = classNames.bind(styles);

export const IntegrationCollection = ({ items, disabled, openIntegration }) => {
  const sortedItems = items.sort((a, b) => b.creationDate - a.creationDate);

  return (
    <div className={cx('instances-list-wrapper')}>
      <ul className={cx('instances-list')}>
        {sortedItems.map((item) => (
          <IntegrationCollectionItem
            key={item.id}
            item={item}
            id={item.id}
            disabled={disabled}
            title={item.name}
            creator={item.creator}
            creationInfo={moment(item.creationDate).format('ll')}
            openIntegration={openIntegration}
          />
        ))}
      </ul>
    </div>
  );
};

IntegrationCollection.propTypes = {
  items: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
  openIntegration: PropTypes.func,
};

IntegrationCollection.defaultProps = {
  disabled: false,
  openIntegration: () => {},
};
