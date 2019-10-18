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
import styles from './integrationFormField.scss';

const cx = classNames.bind(styles);

export const IntegrationFormField = ({ lineAlign, children, ...rest }) => (
  <FormField
    containerClassName={cx('form-field-container', { 'line-align': lineAlign })}
    fieldWrapperClassName={cx('form-field-wrapper')}
    labelClassName={cx('label')}
    {...rest}
  >
    {children}
  </FormField>
);

IntegrationFormField.propTypes = {
  children: PropTypes.node.isRequired,
  lineAlign: PropTypes.bool,
};

IntegrationFormField.defaultProps = {
  lineAlign: false,
};
