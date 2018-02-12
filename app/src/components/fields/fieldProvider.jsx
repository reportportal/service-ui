import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

const InnerComponent = ({
    children,
    input: { onChange, onBlur, onFocus, value },
    meta: { error, active, touched },
    ...rest
  }) => (
  cloneElement(children, { onChange, onBlur, onFocus, value, error, active, touched, ...rest })
);

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
