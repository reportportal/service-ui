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
import { AsyncAutocomplete } from 'componentLibrary/autocompletes/asyncAutocomplete';
import { URLS } from 'common/urls';
import { isEmptyObject } from 'common/utils';
import { DynamicField } from '../dynamicField';

export const AutocompleteField = ({ field, darkView, integrationInfo, ...rest }) => {
  const getUri = () =>
    URLS.projectIntegrationByIdCommand(
      integrationInfo.projectName,
      integrationInfo.integrationId,
      field.commandName,
    );

  const getRequestParams = (term) => ({ method: 'PUT', data: { term } });

  const parseValueToString = (value) => (value ? value.name : '');

  const stateReducer = (state, changes) => {
    if (typeof changes.selectedItem === 'string') {
      return {
        ...changes,
        selectedItem:
          changes.selectedItem === '' || isEmptyObject(state.selectedItem)
            ? []
            : { ...state.selectedItem },
      };
    } else {
      return changes;
    }
  };

  return (
    <DynamicField field={field} darkView={darkView} {...rest}>
      <AsyncAutocomplete
        getURI={getUri}
        getRequestParams={getRequestParams}
        parseValueToString={parseValueToString}
        createWithoutConfirmation
        stateReducer={stateReducer}
        variant={darkView ? 'dark' : 'light'}
      />
    </DynamicField>
  );
};
AutocompleteField.propTypes = {
  field: PropTypes.object.isRequired,
  darkView: PropTypes.bool,
  integrationInfo: PropTypes.object,
};
AutocompleteField.defaultProps = {
  darkView: false,
  integrationInfo: {},
};
