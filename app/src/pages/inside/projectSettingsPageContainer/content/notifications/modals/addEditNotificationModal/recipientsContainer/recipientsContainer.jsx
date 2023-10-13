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

import React from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { URLS } from 'common/urls';
import { regex } from 'common/utils/validation/validatorHelpers';
import { validate } from 'common/utils/validation';
import { projectIdSelector } from 'controllers/pages';
import { AsyncMultipleAutocomplete } from 'componentLibrary/autocompletes/asyncMultipleAutocomplete';

const messages = defineMessages({
  recipientsPlaceholder: {
    id: 'AddEditNotificationModal.recipientsPlaceholder',
    defaultMessage: 'User name/Email',
  },
});

export const RecipientsContainer = ({ ...rest }) => {
  const { formatMessage } = useIntl();
  const activeProject = useSelector(projectIdSelector);

  const getEmailValidationError = (v) => {
    if (regex(/[.@]/)(v)) {
      return !validate.email(v) && 'error';
    }
    return false;
  };
  const parseEmailsString = (string) => {
    const re = /<([^\s<>@]+@[^\s<>@]+)>/g;
    const emails = Array.from(string.matchAll(re), (m) => m[1]);
    return [...new Set(emails)];
  };

  return (
    <AsyncMultipleAutocomplete
      placeholder={formatMessage(messages.recipientsPlaceholder)}
      minLength={1}
      getURI={URLS.projectUsernamesSearch(activeProject)}
      creatable
      editable
      createWithoutConfirmation
      getItemValidationErrorType={getEmailValidationError}
      getAdditionalCreationCondition={regex(/[.@]/)}
      parseInputValueFn={parseEmailsString}
      {...rest}
    />
  );
};
