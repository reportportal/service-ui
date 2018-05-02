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
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { UserItem } from './userItem';
import { InviteNewUserItem } from './inviteNewUserItem';

export const UsersList = ({ options, selectValue }) => {
  if (options[0] && options[0].externalUser) {
    return <InviteNewUserItem option={options[0]} selectValue={selectValue} />;
  }
  return (
    <ScrollWrapper autoHeight autoHeightMax={200}>
      {options.map(option => (
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
