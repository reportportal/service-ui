/*
 * Copyright 2023 EPAM Systems
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
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { dynamicFieldShape } from '../dynamicFieldShape';
import styles from './dynamicField.scss';

const cx = classNames.bind(styles);

export function DynamicField({ field, customBlock, withValidation, children, darkView, ...rest }) {
  const fieldChildren = withValidation ? (
    <FieldErrorHint darkView={darkView} provideHint={false}>
      {children}
    </FieldErrorHint>
  ) : (
    children
  );
  const fieldCommonProps = {
    name: field.id,
    required: field.required,
    disabled: field.disabled,
    ...rest,
  };

  return (
    <FieldElement
      label={field.fieldName}
      isRequired={field.required}
      descriptionSecondary={field.description}
      className={cx('dynamic-field', { dark: darkView })}
      labelClassName={cx({ 'label-dark': darkView })}
      descriptionClassName={cx({ 'description-dark': darkView })}
      additionalInfo={customBlock}
      normalize={(value) => value}
      format={(value) => value}
      parse={(value) => value}
      {...fieldCommonProps}
    >
      {fieldChildren}
    </FieldElement>
  );
}
DynamicField.propTypes = {
  field: dynamicFieldShape,
  customBlock: PropTypes.node,
  withValidation: PropTypes.bool,
  children: PropTypes.any,
  darkView: PropTypes.bool,
};
DynamicField.defaultProps = {
  field: {},
  customBlock: null,
  withValidation: false,
  children: null,
  darkView: false,
};
