/*
 * Copyright 2024 EPAM Systems
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
import { FieldTextFlex } from 'componentLibrary/fieldTextFlex';
import { DynamicField } from '../dynamicField';

export function MultilineTextField(props) {
  const { field, darkView, ...rest } = props;

  const formatInputValue = (value) => value?.[0];

  const parseInputValue = (value) => (value ? [value] : []);

  return (
    <DynamicField
      field={field}
      format={formatInputValue}
      parse={parseInputValue}
      darkView={darkView}
      {...rest}
    >
      <FieldTextFlex defaultWidth={false} variant={darkView ? 'dark' : 'light'} mobileDisabled />
    </DynamicField>
  );
}
MultilineTextField.propTypes = {
  field: PropTypes.object.isRequired,
  darkView: PropTypes.bool,
};
MultilineTextField.defaultProps = {
  darkView: false,
};
