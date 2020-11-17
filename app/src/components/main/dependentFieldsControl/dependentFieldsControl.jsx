/*
 * Copyright 2020 EPAM Systems
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
import classNames from 'classnames/bind';
import styles from './dependentFieldsControl.scss';

const cx = classNames.bind(styles);

const fieldShape = {
  id: PropTypes.string,
  postfix: PropTypes.string,
  component: PropTypes.node,
};

const Field = ({ component, postfix }) => (
  <div className={cx('dependent-control-field')}>
    {component}
    <span className={cx('field-caption')}>{postfix}</span>
  </div>
);
Field.propTypes = fieldShape;
Field.defaultProps = {
  id: '',
  postfix: '',
  component: null,
};

export const DependentFieldsControl = ({ prefix, mainControl, value, dependentFields }) => {
  const fields = (dependentFields.find((item) => item.value === value) || {}).fields || [];

  return (
    <div className={cx('dependent-fields-control')}>
      <span className={cx('field-caption')}>{prefix}</span>
      <Field component={mainControl.component} postfix={mainControl.postfix} />
      {fields.map((field) => (
        <Field key={field.id} component={field.component} postfix={field.postfix} />
      ))}
    </div>
  );
};
DependentFieldsControl.propTypes = {
  prefix: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  mainControl: PropTypes.shape(fieldShape),
  dependentFields: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      fields: PropTypes.arrayOf(fieldShape),
    }),
  ),
};
DependentFieldsControl.defaultProps = {
  prefix: '',
  value: '',
  mainControl: {},
  dependentFields: [],
};
