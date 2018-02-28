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
import { FormattedMessage } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { UserItem } from 'components/inputs/inputUserSearch/userItem';
import classNames from 'classnames/bind';
import styles from './usersList.scss';

const cx = classNames.bind(styles);

export const UsersList = ({ options, selectValue }) => {
  if (options[0] && options[0].externalUser) {
    return (
      <div className={'select-menu-outer'}>
        <div className={'select-menu'} role="listbox">
          <div
            onClick={() => selectValue(options[0])}
          >
            <div className={cx('invite-new-user')}>
              <div className={cx('msg-icon')} />
              <div className={cx('invite-info')}>
                <p className={cx('user-info')} >
                  <FormattedMessage id={'InputUserSearch.inviteNewUser'} defaultMessage={'Invite {userEmail}'} values={{ userEmail: options[0].label }} />
                </p>
                <p className={cx('action-info')}>
                  <FormattedMessage id={'InputUserSearch.inviteNewUserInfo'} defaultMessage={'Send invite via e-mail'} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <ScrollWrapper autoHeight autoHeightMax={200}>
      {options.map(option => (
        <div
          key={option.userLogin}
          onClick={() => {
            if (!option.disabled) {
              selectValue(option);
            }
          }}
        >
          <UserItem
            userName={option.userName}
            userLogin={option.userLogin}
            isAssigned={option.isAssigned}
            userAvatar={option.userAvatar}
          />
        </div>
      ))}
    </ScrollWrapper>
  );
};

UsersList.propTypes = {
  options: PropTypes.array,
  selectValue: PropTypes.func,
};
UsersList.defaultProps = {
  options: [],
  selectValue: () => {},
};
