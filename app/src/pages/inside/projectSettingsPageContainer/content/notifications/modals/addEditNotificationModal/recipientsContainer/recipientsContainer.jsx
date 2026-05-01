/*
 * Copyright 2022 EPAM Systems
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

import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { URLS } from 'common/urls';
import { validate } from 'common/utils/validation';
import { projectKeySelector } from 'controllers/project';
import { AsyncMultipleAutocompleteV2 } from 'componentLibrary/autocompletes/asyncMultipleAutocompleteV2';

import PropTypes from 'prop-types';

const messages = defineMessages({
  recipientsPlaceholder: {
    id: 'AddEditNotificationModal.recipientsPlaceholder',
    defaultMessage: 'Email',
  },
  recipientsError: {
    id: 'AddEditNotificationModal.recipientsError',
    defaultMessage: 'Email is incorrect. Please enter correct email',
  },
});

export const RecipientsContainer = ({ error, value = [], ...rest }) => {
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);

  const getEmailValidationError = (email) => {
    return validate.email(email) ? false : 'error';
  };

  const clearItemsError = () => {};

  const parseEmailsString = (string) => {
    const delimiters = /[,;\n]+/;
    const angleBracketRegex = /<([^\s<>@]+@[^\s<>@]+)>/;

    const tokens = string
      .split(delimiters)
      .map((token) => token.trim())
      .filter(Boolean);

    const result = tokens.map((token) => {
      const match = token.match(angleBracketRegex);
      return match ? match[1] : token;
    });

    // For multi-token paste, keep only valid emails and ignore garbage.
    // For single-token input, preserve existing validation flow.
    if (result.length > 1) {
      return [...new Set(result.filter((token) => validate.email(token)))];
    }

    return [...new Set(result)];
  };

  const recipientsError =
    Array.isArray(value) && value.some((email) => !validate.email(email))
      ? formatMessage(messages.recipientsError)
      : '';

  return (
    <AsyncMultipleAutocompleteV2
      placeholder={formatMessage(messages.recipientsPlaceholder)}
      minLength={1}
      isDropdownMode
      getURI={URLS.projectUsernamesSearch(projectKey)}
      creatable
      editable
      createWithoutConfirmation
      getItemValidationErrorType={getEmailValidationError}
      clearItemsError={clearItemsError}
      parseInputValueFn={parseEmailsString}
      error={error || recipientsError}
      value={value}
      {...rest}
    />
  );
};

RecipientsContainer.propTypes = {
  error: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string),
};

