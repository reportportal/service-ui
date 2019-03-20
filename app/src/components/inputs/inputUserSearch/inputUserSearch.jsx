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
import { fetch, validate } from 'common/utils';
import { URLS } from 'common/urls';
import styles from './inputUserSearch.scss';
import { UsersList } from './usersList';

const cx = classNames.bind(styles);
const getPhoto = (userId) => URLS.dataUserPhoto(userId);
const isValidNewOption = ({ label }) => validate.email(label);
const newOptionCreator = (option) => ({
  externalUser: true,
  label: option.label,
  userLogin: option.label,
});
const promptTextCreator = (label) => label;
const makeURL = (input, isAdmin, projectId) =>
  !isAdmin ? URLS.projectUserSearchUser(projectId, input) : URLS.searchUsers(input);
const makeOptions = (options, projectId) =>
  options.map((option) => ({
    userName: option.fullName || '',
    userLogin: option.userId,
    email: option.email || '',
    disabled: !!option.assignedProjects[projectId],
    isAssigned: !!option.assignedProjects[projectId],
    userAvatar: getPhoto(option.userId),
  }));
const getUsers = (input, isAdmin, projectId) => {
  if (input) {
    const url = makeURL(input, isAdmin, projectId);
    return fetch(url).then((response) => {
      const arr = makeOptions(response.content, projectId);
      return { options: arr };
    });
  }
  return Promise.resolve({ options: [] });
};

export const InputUserSearch = ({
  isAdmin,
  onChange,
  projectId,
  placeholder,
  value,
  error,
  touched,
}) => (
  <div className={cx('select2-search-users')}>
    <Select.AsyncCreatable
      className={cx({ error: error && touched })}
      value={value}
      cache={false}
      loadOptions={(input) => getUsers(input, isAdmin, projectId)}
      filterOption={() => true}
      loadingPlaceholder={
        <FormattedMessage id="InputUserSearch.searching" defaultMessage="Searching..." />
      }
      noResultsText={
        <FormattedMessage id="InputUserSearch.noResults" defaultMessage="No matches found" />
      }
      searchPromptText={
        <FormattedMessage
          id="InputUserSearch.placeholder"
          defaultMessage="Please enter 1 or more character"
        />
      }
      onChange={onChange}
      menuRenderer={({ options, selectValue }) => UsersList({ options, selectValue })}
      isValidNewOption={isValidNewOption}
      newOptionCreator={newOptionCreator}
      promptTextCreator={promptTextCreator}
      placeholder={placeholder}
    />
  </div>
);

InputUserSearch.propTypes = {
  isAdmin: PropTypes.bool,
  projectId: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.object,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  touched: PropTypes.bool,
};
InputUserSearch.defaultProps = {
  isAdmin: false,
  projectId: '',
  onChange: () => {},
  placeholder: '',
  value: {},
  error: false,
  touched: false,
};
