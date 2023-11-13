import React from 'react';
import PropTypes from 'prop-types';
import { AsyncAutocomplete } from 'componentLibrary/autocompletes/asyncAutocomplete';
import { connect } from 'react-redux';
import { projectInfoSelector } from 'controllers/project';
import { URLS } from 'common/urls';
import { DynamicField } from '../dynamicField';

const AutocompleteFieldComponent = ({
  field,
  darkView,
  modalView,
  integrationId,
  projectName,
  ...rest
}) => {
  const getUri = () =>
    URLS.projectIntegrationByIdCommand(projectName, integrationId, field.commandName);

  const getRequestParams = (term) => ({ method: 'PUT', data: { term } });

  const parseValueToString = (user) => (user ? user.name : '');

  return (
    <DynamicField field={field} darkView={darkView} modalView={modalView} {...rest}>
      <AsyncAutocomplete
        getURI={getUri}
        getRequestParams={getRequestParams}
        parseValueToString={parseValueToString}
        createWithoutConfirmation
        onBlur={() => {}}
      />
    </DynamicField>
  );
};
AutocompleteFieldComponent.propTypes = {
  field: PropTypes.object.isRequired,
  defaultOptionValueKey: PropTypes.string.isRequired,
  darkView: PropTypes.bool,
  modalView: PropTypes.bool,
  projectName: PropTypes.number,
  integrationId: PropTypes.number,
};
AutocompleteFieldComponent.defaultProps = {
  darkView: false,
  modalView: false,
  integrationId: undefined,
};
export const AutocompleteField = connect((state) => ({
  projectName: projectInfoSelector(state).projectName,
}))(AutocompleteFieldComponent);
