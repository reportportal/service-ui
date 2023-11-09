import React from 'react';
import PropTypes from 'prop-types';
import { AsyncAutocomplete } from 'componentLibrary/autocompletes/asyncAutocomplete';
import { DynamicField } from '../dynamicField';

export const AutocompleteField = ({ field, darkView, modalView, ...rest }) => {
  // todo change to command
  const getUri = (val) => `${field.url}${val}`;

  return (
    <DynamicField field={field} darkView={darkView} modalView={modalView} {...rest}>
      <AsyncAutocomplete
        getURI={getUri}
        minLength={3}
        createWithoutConfirmation
        prohibitCreateOnBlur
        onBlur={() => {}}
      />
    </DynamicField>
  );
};
AutocompleteField.propTypes = {
  field: PropTypes.object.isRequired,
  defaultOptionValueKey: PropTypes.string.isRequired,
  darkView: PropTypes.bool,
  modalView: PropTypes.bool,
};
AutocompleteField.defaultProps = {
  darkView: false,
  modalView: false,
};
