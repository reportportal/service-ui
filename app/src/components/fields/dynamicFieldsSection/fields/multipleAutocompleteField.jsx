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
import { connect } from 'react-redux';
import { projectInfoSelector } from 'controllers/project/selectors';
import { DynamicField } from '../dynamicField';

const MultipleAutocompleteFieldComponent = ({
  field,
  darkView,
  modalView,
  integrationInfo,
  ...rest
}) => {
  const getUri = () =>
    URLS.projectIntegrationByIdCommand(
      integrationInfo.projectName,
      integrationInfo.integrationId,
      field.commandName,
    );

  const getRequestParams = (term) => ({ method: 'PUT', data: { term } });

  const parseValueToString = (user) => (user ? user.name : '');

  return (
    <DynamicField field={field} darkView={darkView} modalView={modalView} {...rest}>
      <AsyncMultipleAutocomplete
        getURI={getUri}
        getRequestParams={getRequestParams}
        parseValueToString={parseValueToString}
        createWithoutConfirmation
        darkView={darkView}
      />
    </DynamicField>
  );
};
MultipleAutocompleteFieldComponent.propTypes = {
  field: PropTypes.object.isRequired,
  defaultOptionValueKey: PropTypes.string.isRequired,
  darkView: PropTypes.bool,
  modalView: PropTypes.bool,
  integrationInfo: PropTypes.object,
};
MultipleAutocompleteFieldComponent.defaultProps = {
  darkView: false,
  modalView: false,
  integrationInfo: {},
};

export const MultipleAutocompleteField = connect((state) => ({
  projectName: projectInfoSelector(state).projectName,
}))(MultipleAutocompleteFieldComponent);
