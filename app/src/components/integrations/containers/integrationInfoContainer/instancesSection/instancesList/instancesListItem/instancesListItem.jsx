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
import classNames from 'classnames/bind';
import ArrowIcon from 'common/img/arrow-right-inline.svg';
import styles from './instancesListItem.scss';

const cx = classNames.bind(styles);

export const InstancesListItem = ({ title, creator, creationInfo, onClick, disabled }) => (
  // eslint-disable-next-line
  <li className={cx('instances-list-item', { disabled })} onClick={onClick}>
    <div className={cx('item-data')}>
      <h4 className={cx('integration-name')}>{title}</h4>
      <span className={cx('creation-info')}>
        {creator ? `${creator} on ${creationInfo}` : creationInfo}
      </span>
    </div>
    <div className={cx('arrow-control')}>{Parser(ArrowIcon)}</div>
  </li>
);

InstancesListItem.propTypes = {
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  creationInfo: PropTypes.string.isRequired,
  creator: PropTypes.string,
  disabled: PropTypes.bool,
};

InstancesListItem.defaultProps = {
  disabled: false,
  creator: '',
};
