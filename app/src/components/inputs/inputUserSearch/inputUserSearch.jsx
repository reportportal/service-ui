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
import Select from 'react-select';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper/scrollWrapper';
import { fetch, addTokenToImagePath, validate } from 'common/utils';
import styles from './inputUserSearch.scss';
import { UserItem } from './userItem';

const cx = classNames.bind(styles);

export const InputUserSearch = ({ isAdmin, projectId, onChange }) => {
  const formURL = (input) => {
    const apiVersion = '../api/v1/';
    const page = 1;
    const size = 10;
    const sort = '&page.sort=login,ASC';
    let search = '';
    let startUrl;
    if (!isAdmin) {
      startUrl = `${apiVersion}project/${projectId}/usernames/`;
    } else {
      startUrl = `${apiVersion}user/`;
    }
    if (input) {
      startUrl += 'search/';
      search = `&term=${input}`;
    } else {
      startUrl += 'all';
    }
    startUrl += `?page.page=${page}&page.size=${size}${sort}${search}`;
    return startUrl;
  };
  const getPhoto = (userId) => {
    const d = new Date();
    return addTokenToImagePath(`../api/v1/data/userphoto?v=${d.getTime()}&id=${userId}`);
  };
  const formOptions = (options) => {
    const newOptions = options.map((option) => {
      const tempOption = {};
      tempOption.userName = option.full_name;
      tempOption.userLogin = option.userId;
      if (option.email) {
        tempOption.email = option.email;
      }
      tempOption.disabled = false;
      tempOption.isAssigned = false;
      if (option.assigned_projects[projectId]) {
        tempOption.isAssigned = true;
        tempOption.disabled = true;
      }
      tempOption.userAvatar = getPhoto(option.userId);
      return tempOption;
    });
    console.log(newOptions);
    return newOptions;
  };
  const getUsers = (input) => {
    const url = formURL(input);
    if (input) {
      return fetch(url)
        .then((response) => {
          const arr = formOptions(response.content);
          return ({ options: arr });
        });
    }
    return Promise.resolve({ options: [] });
  };
  const menuRenderer = (params) => {
    if (params.options[0].externalUser) {
      return (
        <div className={cx('Select-menu-outer')}>
          <div className={cx('Select-menu')} role="listbox">
            <div
              onClick={() => params.selectValue(params.options[0])}
              onMouseOver={() => params.focusOption(params.options[0])}
            >
              <div className={cx('invite-new-user')}>
                <div className={cx('msg-icon')} />
                <div className={cx('invite-info')}>
                  <p className={cx('user-info')} >
                    <FormattedMessage id={'InputUserSearch.inviteNewUser'} defaultMessage={'Invite {userEmail}'} values={{ userEmail: params.options[0].label }} />
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
      <div className={cx('Select-menu-outer')}>
        <ScrollWrapper autoHeight autoHeightMax={200}>
          <div className={cx('Select-menu')} role="listbox">
            {params.options.map(option => (<div
              key={option.userLogin}
              onClick={() => {
                if (!option.disabled) {
                  params.selectValue(option);
                }
              }}
              onMouseOver={() => params.focusOption(option)}
              disabled={option.disabled}
            >
              <UserItem
                userName={option.userName}
                userLogin={option.userLogin}
                isAssigned={option.isAssigned}
                userAvatar={option.userAvatar}
              />
            </div>))}
          </div>
        </ScrollWrapper>
      </div>
    );
  };
  const isValidNewOption = ({ label }) => validate.email(label);
  const newOptionCreator = option => ({ externalUser: true, label: option.label });
  const promptTextCreator = label => (label);
  const filterOption = (option, filter) =>
    option.userName.toLowerCase().indexOf(filter.toLowerCase()) >= 0 ||
    option.userLogin.toLowerCase().indexOf(filter.toLowerCase()) >= 0 ||
    (option.email && option.email.toLowerCase().indexOf(filter.toLowerCase()) >= 0);
  return (<div>
    <Select.AsyncCreatable
      className={'select2-search-users'}
      cache={false}
      loadOptions={getUsers}
      filterOption={filterOption}
      loadingPlaceholder={<FormattedMessage id={'InputUserSearch.searching'} defaultMessage={'Searching...'} />}
      noResultsText={<FormattedMessage id={'InputUserSearch.noResults'} defaultMessage={'No matches found'} />}
      searchPromptText={<FormattedMessage id={'InputUserSearch.placeholder'} defaultMessage={'Please enter 1 or more character'} />}
      onChange={onChange}
      menuRenderer={menuRenderer}
      isValidNewOption={isValidNewOption}
      newOptionCreator={newOptionCreator}
      promptTextCreator={promptTextCreator}
    /></div>);
};

InputUserSearch.propTypes = {
  isAdmin: PropTypes.bool,
  projectId: PropTypes.string,
  onChange: PropTypes.func,
};

InputUserSearch.defaultProps = {
  isAdmin: false,
  projectId: '',
  onChange: () => {},
};
