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
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';

import styles from './itemCounter.scss';

const cx = classNames.bind(styles);

export const ItemCounter = ({ activePage, pageSize, itemCount }) => {
  const endIndex = activePage * pageSize;
  const startIndex = endIndex - pageSize;
  return (
    <div className={cx('item-counter')}>
      {`${startIndex + 1} - ${endIndex < itemCount ? endIndex : itemCount}`}{' '}
      <FormattedMessage id="Common.of" defaultMessage="of" /> {itemCount}
    </div>
  );
};
ItemCounter.propTypes = {
  activePage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
};
