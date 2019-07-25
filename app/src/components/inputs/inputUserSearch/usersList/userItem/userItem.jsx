/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
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
