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
      <AsyncMultipleAutocomplete
        getURI={getUri}
        getRequestParams={getRequestParams}
        parseValueToString={parseValueToString}
        createWithoutConfirmation
        hideSelected
      />
    </DynamicField>
  );
};
MultipleAutocompleteFieldComponent.propTypes = {
  field: PropTypes.object.isRequired,
  defaultOptionValueKey: PropTypes.string.isRequired,
  darkView: PropTypes.bool,
  modalView: PropTypes.bool,
  projectName: PropTypes.number,
  integrationId: PropTypes.number,
};
MultipleAutocompleteFieldComponent.defaultProps = {
  darkView: false,
  modalView: false,
  integrationId: undefined,
};

export const MultipleAutocompleteField = connect((state) => ({
  projectName: projectInfoSelector(state).projectName,
}))(MultipleAutocompleteFieldComponent);
