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
  prefix: PropTypes.string,
  postfix: PropTypes.string,
  component: PropTypes.node,
  valueSelector: PropTypes.func,
  dependentFields: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      fields: PropTypes.array,
    }),
  ),
};

const Field = ({ component, prefix, postfix }) => (
  <div className={cx('dependent-control-field')}>
    {prefix && <span className={cx('field-caption')}>{prefix}</span>}
    {component}
    {postfix && <span className={cx('field-caption')}>{postfix}</span>}
  </div>
);
Field.propTypes = fieldShape;
Field.defaultProps = {
  id: '',
  prefix: '',
  postfix: '',
  component: null,
};

function renderFieldsRecursively(fields, values) {
  return fields.map(({ id, prefix, postfix, component, valueSelector, dependentFields = [] }) => {
    const value = valueSelector ? valueSelector(values) : values[id];
    const nestedFields = (dependentFields.find((item) => item.value === value) || {}).fields || [];

    return (
      <React.Fragment key={id}>
        <Field component={component} prefix={prefix} postfix={postfix} />
        {renderFieldsRecursively(nestedFields, values)}
      </React.Fragment>
    );
  });
}

export const DependentFieldsControl = ({ values, fields }) => (
  <div className={cx('dependent-fields-control')}>{renderFieldsRecursively(fields, values)}</div>
);
DependentFieldsControl.propTypes = {
  values: PropTypes.object,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      fields: PropTypes.arrayOf(fieldShape),
    }),
  ),
};
DependentFieldsControl.defaultProps = {
  values: {},
  fields: [],
};
