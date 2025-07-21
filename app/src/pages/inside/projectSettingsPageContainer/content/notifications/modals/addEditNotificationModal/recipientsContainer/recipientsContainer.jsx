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
import { AsyncMultipleAutocomplete } from 'componentLibrary/autocompletes/asyncMultipleAutocomplete';
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
    !recipientsWithError.includes(email) && setRecipientsWithError([...recipientsWithError, email]);

    return 'error';
  };

  const clearItemsError = () => {
    setRecipientsWithError([]);
  };

  const parseEmailsString = (string) => {
    const re = /<([^\s<>@]+@[^\s<>@]+)>/g;
    const emails = Array.from(string.matchAll(re), (m) => m[1]);
    return [...new Set(emails)];
  };

  const recipientsError =
    recipientsWithError.length > 0 ? formatMessage(messages.recipientsError) : '';

  return (
    <AsyncMultipleAutocomplete
      placeholder={formatMessage(messages.recipientsPlaceholder)}
      minLength={1}
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

RecipientsContainer.defaultProps = {
  error: '',
};
