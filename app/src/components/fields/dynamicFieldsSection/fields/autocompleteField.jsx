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
import { connect } from 'react-redux';
import { projectInfoSelector } from 'controllers/project';
import { URLS } from 'common/urls';
import { DynamicField } from '../dynamicField';

const AutocompleteFieldComponent = ({ field, darkView, modalView, integrationInfo, ...rest }) => {
  const getUri = () =>
    URLS.projectIntegrationByIdCommand(
      integrationInfo.projectName,
      integrationInfo.integrationId,
      field.commandName,
    );

  const getRequestParams = (term) => ({ method: 'PUT', data: { term } });

  const parseValueToString = (user) => (user ? user.name : '');

  const stateReducer = (state, changes) => {
    return typeof changes.selectedItem === 'string' && changes.selectedItem !== ''
      ? {
          ...changes,
          selectedItem: { ...state.selectedItem },
        }
      : changes;
  };

  return (
    <DynamicField field={field} darkView={darkView} modalView={modalView} {...rest}>
      <AsyncAutocomplete
        getURI={getUri}
        getRequestParams={getRequestParams}
        parseValueToString={parseValueToString}
        createWithoutConfirmation
        stateReducer={stateReducer}
        darkView={darkView}
      />
    </DynamicField>
  );
};
AutocompleteFieldComponent.propTypes = {
  field: PropTypes.object.isRequired,
  defaultOptionValueKey: PropTypes.string.isRequired,
  darkView: PropTypes.bool,
  modalView: PropTypes.bool,
  integrationInfo: PropTypes.object,
};
AutocompleteFieldComponent.defaultProps = {
  darkView: false,
  modalView: false,
  integrationInfo: {},
};
export const AutocompleteField = connect((state) => ({
  projectName: projectInfoSelector(state).projectName,
}))(AutocompleteFieldComponent);
