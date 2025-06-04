/*
 * Copyright 2024 EPAM Systems
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
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Tooltip } from '@reportportal/ui-kit';
import { ADMIN_TYPE } from 'common/utils/permissions/constants';
import { messages } from 'pages/common/users/membersListTable/messages';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import styles from './userNameCell.scss';

const cx = classNames.bind(styles);

export const UserNameCell = ({ user, badges }) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('user-name-cell')}>
      <UserAvatar className={cx('user-avatar')} userId={user.id} thumbnail />
      <div className={cx('name-badge-wrapper')}>
        <div className={cx('full-name')}>{user.full_name}</div>
        {badges.length > 0 && (
          <div className={cx('badges')}>
            {badges.map(({ title, type }) => {
              const badgeContent = (
                <div key={`${user.id}-${type}`} className={cx('badge', type)}>
                  {formatMessage(title)}
                </div>
              );

              return type === ADMIN_TYPE ? (
                <Tooltip
                  key={`${user.id}-${type}-tooltip`}
                  content={formatMessage(messages.adminAccessInfo)}
                  placement="top"
                  width={248}
                >
                  {badgeContent}
                </Tooltip>
              ) : (
                badgeContent
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

UserNameCell.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    full_name: PropTypes.string.isRequired,
  }).isRequired,
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.object.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ),
};

UserNameCell.defaultProps = {
  badges: [],
};
