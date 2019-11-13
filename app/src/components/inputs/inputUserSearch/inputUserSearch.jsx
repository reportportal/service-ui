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
import Select from 'react-select';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { fetch, validate } from 'common/utils';
import { URLS } from 'common/urls';
import styles from './inputUserSearch.scss';
import { UsersList } from './usersList';

const cx = classNames.bind(styles);
const isValidNewOption = ({ label }) => validate.email(label);
const newOptionCreator = (option) => ({
  externalUser: true,
  label: option.label,
  userLogin: option.label,
});
const promptTextCreator = (label) => label;
const makeURL = (input, isAdmin, projectId) =>
  isAdmin ? URLS.searchUsers(input) : URLS.projectUserSearchUser(projectId, input);
const makeOptions = (options, projectId) =>
  options.map((option) => ({
    userName: option.fullName || '',
    userLogin: option.userId,
    email: option.email || '',
    disabled: !!option.assignedProjects[projectId],
    isAssigned: !!option.assignedProjects[projectId],
    userAvatar: URLS.dataUserPhoto(projectId, option.userId, true),
    assignedProjects: option.assignedProjects || {},
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
