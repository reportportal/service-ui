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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormField } from 'components/fields/formField';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { dynamicFieldShape } from '../dynamicFieldShape';
import styles from './dynamicField.scss';

const cx = classNames.bind(styles);

export const DynamicField = ({
  field,
  customBlock,
  customFieldWrapper: FieldWrapper,
  withValidation,
  children,
  ...rest
}) => {
  const fieldChildren = withValidation ? <FieldErrorHint>{children}</FieldErrorHint> : children;
  const fieldCommonProps = {
    name: field.id,
    label: field.fieldName,
    required: field.required,
    disabled: field.disabled,
    customBlock,
    ...rest,
  };

  return FieldWrapper ? (
    <FieldWrapper {...fieldCommonProps}>{fieldChildren}</FieldWrapper>
  ) : (
    <FormField
      {...fieldCommonProps}
      fieldWrapperClassName={cx('field-wrapper')}
      containerClassName={cx('form-field-item')}
      labelClassName={cx('form-group-label')}
    >
      {fieldChildren}
    </FormField>
  );
};

DynamicField.propTypes = {
  field: dynamicFieldShape,
  customBlock: PropTypes.object,
  customFieldWrapper: PropTypes.func,
  withValidation: PropTypes.bool,
  children: PropTypes.any,
};

DynamicField.defaultProps = {
  field: {},
  customBlock: null,
  customFieldWrapper: null,
  withValidation: false,
  children: null,
};
