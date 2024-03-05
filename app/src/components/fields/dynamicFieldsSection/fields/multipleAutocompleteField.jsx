/*
 * Copyright 2023 EPAM Systems
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
import PropTypes from 'prop-types';
import { AsyncMultipleAutocomplete } from 'componentLibrary/autocompletes/asyncMultipleAutocomplete';
import { URLS } from 'common/urls';
import { DynamicField } from '../dynamicField';

export const MultipleAutocompleteField = ({
  field,
  darkView,
  integrationInfo,
  createWithoutConfirmation,
  ...rest
}) => {
  const getUri = () =>
    URLS.projectIntegrationByIdCommand(
      integrationInfo.projectKey,
      integrationInfo.integrationId,
      field.commandName,
    );

  const getRequestParams = (term) => ({ method: 'PUT', data: { term } });

  const parseValueToString = (option) => {
    if (option) {
      return option.name ? option.name : option;
    } else {
      return '';
    }
  };

  const customizeNewSelectedValue = (value) =>
    typeof value === 'string' ? { name: value } : value;

  return (
    <DynamicField field={field} darkView={darkView} {...rest}>
      <AsyncMultipleAutocomplete
        getURI={getUri}
        getRequestParams={getRequestParams}
        parseValueToString={parseValueToString}
        createWithoutConfirmation={createWithoutConfirmation}
        variant={darkView ? 'dark' : 'light'}
        customizeNewSelectedValue={customizeNewSelectedValue}
      />
    </DynamicField>
  );
};
MultipleAutocompleteField.propTypes = {
  field: PropTypes.object.isRequired,
  defaultOptionValueKey: PropTypes.string.isRequired,
  darkView: PropTypes.bool,
  integrationInfo: PropTypes.object,
  createWithoutConfirmation: PropTypes.bool,
};
MultipleAutocompleteField.defaultProps = {
  darkView: false,
  integrationInfo: {},
  createWithoutConfirmation: true,
};
