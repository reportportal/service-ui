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

import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { URLS } from 'common/urls';
import { regex } from 'common/utils/validation/validatorHelpers';
import { validate } from 'common/utils/validation';
import { projectKeySelector } from 'controllers/project';
import { AsyncMultipleAutocomplete } from 'componentLibrary/autocompletes/asyncMultipleAutocomplete';
import { projectInfoSelector } from 'controllers/project/selectors';
import PropTypes from 'prop-types';

const messages = defineMessages({
  recipientsPlaceholder: {
    id: 'AddEditNotificationModal.recipientsPlaceholder',
    defaultMessage: 'User name/Email',
  },
  recipientsError: {
    id: 'AddEditNotificationModal.recipientsError',
    defaultMessage: 'Please enter existent user name on your project or valid email',
  },
});

function RecipientsContainerComponent({ projectInfo, error, ...rest }) {
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);

  const [recipientsWithError, setRecipientsWithError] = useState([]);

  const emailValidation = (email) => {
    return regex(/@/)(email);
  };

  const getEmailValidationError = (v) => {
    if (emailValidation(v)) {
      return !validate.email(v) && 'error';
    }
    return false;
  };

  const getValidationError = (v) => {
    const emailValidationErrorType = getEmailValidationError(v);
    if (emailValidationErrorType) {
      return emailValidationErrorType;
    }

    const hasError = !emailValidation(v) && !projectInfo.users.some((user) => user.login === v);
    if (hasError) {
      !recipientsWithError.includes(v) && setRecipientsWithError([...recipientsWithError, v]);
      return 'error';
    }
    const currentRecipientsWithError = recipientsWithError.filter((login) => login !== v);
    currentRecipientsWithError.length !== recipientsWithError.length &&
      setRecipientsWithError(currentRecipientsWithError);
    return false;
  };

  const clearItemsError = () => {
    setRecipientsWithError([]);
  };

  const parseEmailsString = (string) => {
    const re = /<([^\s<>@]+@[^\s<>@]+)>/g;
    const emails = Array.from(string.matchAll(re), (m) => m[1]);
    return [...new Set(emails)];
  };

  const recipientsError = recipientsWithError.length ? formatMessage(messages.recipientsError) : '';

  return (
    <AsyncMultipleAutocomplete
      placeholder={formatMessage(messages.recipientsPlaceholder)}
      minLength={1}
      getURI={URLS.projectUsernamesSearch(projectKey)}
      creatable
      editable
      createWithoutConfirmation
      getItemValidationErrorType={getValidationError}
      clearItemsError={clearItemsError}
      parseInputValueFn={parseEmailsString}
      error={error || recipientsError}
      {...rest}
    />
  );
}
RecipientsContainerComponent.propTypes = {
  projectInfo: PropTypes.object.isRequired,
  error: PropTypes.string,
};
RecipientsContainerComponent.defaultProps = {
  error: '',
};
export const RecipientsContainer = connect((state) => ({
  projectInfo: projectInfoSelector(state),
}))(RecipientsContainerComponent);
