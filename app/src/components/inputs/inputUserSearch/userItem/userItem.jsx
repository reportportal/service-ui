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
import { defineMessages, injectIntl } from 'react-intl';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { Image } from 'components/main/image';
import styles from './userItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  isAssigned: {
    id: 'InputUserSearch.isAssigned',
    defaultMessage: 'User has already assigned to the project',
  },
});

export const UserItem = injectIntl(
  ({ intl, option, itemProps: { isActive, isSelected, ...restItemProps } }) => (
    <li
      className={cx({
        'user-search-result-wrap': true,
        'disabled-item': restItemProps.disabled,
        active: isActive,
      })}
      {...restItemProps}
    >
      <Image className={cx('user-avatar')} src={option.userAvatar} fallback={DefaultUserImage} />
      <div className={cx('user-search-info')}>
        <p className={cx('user-search-name')}>{option.userName}</p>
        <p className={cx('user-search-login')}>{option.userLogin}</p>
      </div>
      <button
        className={cx({ 'assign-btn': true, 'assigned-user': option.isAssigned })}
        title={option.isAssigned ? intl.formatMessage(messages.isAssigned) : ''}
      />
    </li>
  ),
);

UserItem.propTypes = {
  intl: PropTypes.object,
  option: PropTypes.object,
  itemProps: PropTypes.object,
};

UserItem.defaultProps = {
  intl: {},
  option: {},
  itemProps: {},
};
