import PropTypes from 'prop-types';
import { cloneElement } from 'react';
import { state, props, signal } from 'cerebral/tags';
import { connect } from '@cerebral/react';

function bindFormField({
   formPath,
   fieldName,
   forwardParameters,
   fieldValue,
   setField,
   changeFocusState,
   children }) {
  const onChangeField = (e) => {
    setField({ path: `${formPath}.${fieldName}`, value: e.target.value });
  };
  const getFocusListener = value => () => {
    changeFocusState({ path: `${formPath}.${fieldName}`, focus: value });
  };
  const params = {
    value: fieldValue,
    onChange: onChangeField,
    onFocus: getFocusListener(true),
    onBlur: getFocusListener(false),
  };
  if (forwardParameters) {
    params[formPath] = formPath;
    params[fieldName] = fieldName;
  }
  return cloneElement(children, params);
}

bindFormField.propTypes = {
  formPath: PropTypes.string,
  fieldName: PropTypes.string,
  forwardParameters: PropTypes.bool,
  fieldValue: PropTypes.string,
  setField: PropTypes.func,
  changeFocusState: PropTypes.func,
  children: PropTypes.node,
};
bindFormField.defaultProps = {
  formPath: '',
  fieldName: '',
  forwardParameters: false,
  fieldValue: '',
  setField: () => {},
  changeFocusState: () => {},
  children: {},
};

export default connect({
  fieldValue: state`${props`formPath`}.${props`fieldName`}.value`,
  setField: signal`forms.fieldChanged`,
  changeFocusState: signal`forms.changeFocusState`,
}, bindFormField);
