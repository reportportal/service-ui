import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

const InnerComponent = ({
  children,
  dumbOnBlur = false,
  input: { onChange, onBlur, onFocus, value, name },
  meta: { error, active, touched, asyncValidating },
  ...rest
}) =>
  cloneElement(children, {
    onChange,
    onBlur: dumbOnBlur ? () => {} : onBlur,
    onFocus,
    value,
    name,
    error,
    active,
    touched,
    asyncValidating,
    ...rest,
  });

export const FieldProvider = ({ children, ...rest }) => (
  <Field {...rest} component={InnerComponent}>
    {children}
  </Field>
);

FieldProvider.propTypes = {
  children: PropTypes.node,
};
FieldProvider.defaultProps = {
  children: null,
};
