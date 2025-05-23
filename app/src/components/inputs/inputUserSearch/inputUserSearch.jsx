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
import { validate } from 'common/utils/validation';
import { URLS } from 'common/urls';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { InviteNewUserItem } from './inviteNewUserItem';
import { UserItem } from './userItem';

const isValidNewOption = (inputValue) => validate.email(inputValue);
const isOptionUnique = (inputValue, options) =>
  !options.some(
    (option) =>
      option.userLogin === inputValue || option.email.toLowerCase() === inputValue.toLowerCase(),
  );
const newOptionCreator = (inputValue) => ({
  externalUser: true,
  userLogin: inputValue,
});
const getURI = (isAdmin, projectId) => (input) =>
  isAdmin ? URLS.searchUsers(input) : URLS.projectUserSearchUser(projectId)(input);
export const makeOptions = (projectId, isAdmin) => ({ content: options }) =>
  options.map((option) => ({
    userName: option.fullName || '',
    userLogin: isAdmin ? option.userId : option.login,
    email: option.email || '',
    disabled: isAdmin ? !!option.assignedProjects[projectId] : false,
    isAssigned: isAdmin ? !!option.assignedProjects[projectId] : false,
    projectId,
    userId: isAdmin ? option.userId : option.login,
    assignedProjects: option.assignedProjects || {},
  }));

const parseValueToString = (option) => (option ? option.userLogin : '');

const renderOption = (option, index, isNew, getItemProps) =>
  isNew ? (
    <InviteNewUserItem option={option} itemProps={getItemProps({ item: option, index })} />
  ) : (
    <UserItem
      key={option.userLogin}
      itemProps={getItemProps({ item: option, index, disabled: option.isAssigned })}
      option={option}
    />
  );

export const InputUserSearch = ({
  isAdmin,
  onChange,
  projectId,
  value,
  error,
  touched,
  placeholder,
  creatable,
}) => (
  <AsyncAutocomplete
    getURI={getURI(isAdmin, projectId)}
    onChange={onChange}
    error={error}
    touched={touched}
    isValidNewOption={isValidNewOption}
    makeOptions={makeOptions(projectId, isAdmin)}
    createNewOption={newOptionCreator}
    value={value}
    parseValueToString={parseValueToString}
    renderOption={renderOption}
    placeholder={placeholder}
    isOptionUnique={isOptionUnique}
    creatable={creatable}
    showDynamicSearchPrompt
  />
);

InputUserSearch.propTypes = {
  isAdmin: PropTypes.bool,
  projectId: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.object,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  touched: PropTypes.bool,
  creatable: PropTypes.bool,
};

InputUserSearch.defaultProps = {
  isAdmin: false,
  projectId: '',
  onChange: () => {},
  placeholder: '',
  value: null,
  error: false,
  touched: false,
  creatable: true,
};
