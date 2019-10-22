/*
 * Copyright 2019 EPAM Systems
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
