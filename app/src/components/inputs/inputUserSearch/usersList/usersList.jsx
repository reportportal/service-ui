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
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { UserItem } from './userItem';
import { InviteNewUserItem } from './inviteNewUserItem';
import styles from './usersList.scss';

const cx = classNames.bind(styles);

export const UsersList = ({ options, selectValue }) => {
  if (options[0] && options[0].externalUser) {
    return (
      <div className={cx('users-list')}>
        <InviteNewUserItem option={options[0]} onClick={() => selectValue(options[0])} />
      </div>
    );
  }
  return (
    <div className={cx('users-list')}>
      <ScrollWrapper autoHeight autoHeightMax={200}>
        {options.map((option) => (
          <UserItem
            key={option.userLogin}
            onClick={() => {
              if (!option.disabled) {
                selectValue(option);
              }
            }}
            userName={option.userName}
            userLogin={option.userLogin}
            isAssigned={option.isAssigned}
            userAvatar={option.userAvatar}
          />
        ))}
      </ScrollWrapper>
    </div>
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
