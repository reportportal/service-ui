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
import { defineMessages, injectIntl, intlShape } from 'react-intl';
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
  ({ intl, userName, userLogin, userAvatar, isAssigned, onClick }) => (
    <div
      className={cx({ 'user-search-result-wrap': true, 'disabled-item': isAssigned })}
      onClick={onClick}
    >
      <Image className={cx('user-avatar')} src={userAvatar} fallback={DefaultUserImage} />
      <div className={cx('user-search-info')}>
        <p className={cx('user-search-name')}>{userName}</p>
        <p className={cx('user-search-login')}>{userLogin}</p>
      </div>
      <button
        className={cx({ 'assign-btn': true, 'assigned-user': isAssigned })}
        title={isAssigned ? intl.formatMessage(messages.isAssigned) : ''}
      />
    </div>
  ),
);

UserItem.propTypes = {
  intl: intlShape,
  userName: PropTypes.string,
  userLogin: PropTypes.string,
  userAvatar: PropTypes.string,
  isAssigned: PropTypes.bool,
  onClick: PropTypes.func,
};

UserItem.defaultProps = {
  intl: {},
  userName: '',
  userLogin: '',
  userAvatar: '',
  isAssigned: false,
  onClick: () => {},
};
