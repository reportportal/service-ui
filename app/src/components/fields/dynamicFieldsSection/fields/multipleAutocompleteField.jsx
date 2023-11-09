import React from 'react';
import PropTypes from 'prop-types';
import { AsyncMultipleAutocomplete } from 'componentLibrary/autocompletes/asyncMultipleAutocomplete';
import { DynamicField } from '../dynamicField';

export const MultipleAutocompleteField = ({ field, darkView, modalView, ...rest }) => {
  // todo change to command
  const getUri = (val) => `${field.url}${val}`;

  return (
    <DynamicField field={field} darkView={darkView} modalView={modalView} {...rest}>
      <AsyncMultipleAutocomplete getURI={getUri} minLength={3} createWithoutConfirmation editable />
    </DynamicField>
  );
};
MultipleAutocompleteField.propTypes = {
  field: PropTypes.object.isRequired,
  defaultOptionValueKey: PropTypes.string.isRequired,
  darkView: PropTypes.bool,
  modalView: PropTypes.bool,
};
MultipleAutocompleteField.defaultProps = {
  darkView: false,
  modalView: false,
};
