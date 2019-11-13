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
import moment from 'moment';
import { InstancesListItem } from './instancesListItem';
import styles from './instancesList.scss';

const cx = classNames.bind(styles);

export const InstancesList = ({ items, title, onItemClick, disabled, disabledHint, blocked }) => (
  <div className={cx('instances-list-wrapper')}>
    <h3 className={cx('instances-list-title')}>{title}</h3>
    {disabled && <p className={cx('instances-disabled-hint')}>{disabledHint}</p>}
    <ul className={cx('instances-list')}>
      {items.map((item) => (
        <InstancesListItem
          key={item.id}
          disabled={disabled}
          data={item}
          title={item.name}
          creator={item.creator}
          creationInfo={moment(item.creationDate).format('ll')}
          onClick={() => onItemClick({ ...item, blocked }, title)}
        />
      ))}
    </ul>
  </div>
);

InstancesList.propTypes = {
  items: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  onItemClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  disabledHint: PropTypes.string,
  blocked: PropTypes.bool,
};

InstancesList.defaultProps = {
  disabled: false,
  disabledHint: '',
  blocked: false,
};
