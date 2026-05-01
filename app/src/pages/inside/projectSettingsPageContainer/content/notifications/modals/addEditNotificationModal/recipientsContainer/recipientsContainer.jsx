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

import { useState } from 'react';
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

export const RecipientsContainer = ({ error, ...rest }) => {
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);

  const [recipientsWithError, setRecipientsWithError] = useState([]);

  const getEmailValidationError = (email) => {
    if (validate.email(email)) {
      return false;
    }
    setRecipientsWithError((prevRecipients) => {
      if (prevRecipients.includes(email)) {
        return prevRecipients;
      }
      return [...prevRecipients, email];
    });

    return 'error';
  };

  const clearItemsError = () => {
    setRecipientsWithError([]);
  };

  const parseEmailsString = (string) => {
    const emails = new Set();

    const angleBracketRegex = /<([^\s<>@]+@[^\s<>@]+)>/g;
    const angleBracketMatches = Array.from(string.matchAll(angleBracketRegex), (m) => m[1]);
    angleBracketMatches.forEach((email) => emails.add(email));

    if (emails.size > 0) {
      return Array.from(emails);
    }

    const delimiters = /[,;\n]+/;
    const tokens = string
      .split(delimiters)
      .map((token) => token.trim())
      .filter(Boolean);

    if (tokens.length > 1) {
      return [...new Set(tokens.filter((token) => validate.email(token)))];
    }

    return [...new Set(tokens)];
  };

  const recipientsError =
    recipientsWithError.length > 0 ? formatMessage(messages.recipientsError) : '';

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
      {...rest}
    />
  );
};

RecipientsContainer.propTypes = {
  error: PropTypes.string,
};

