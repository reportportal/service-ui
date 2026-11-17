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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FieldProvider } from 'components/fields/fieldProvider';
import styles from './filterInput.scss';

const cx = classNames.bind(styles);

export const FilterInput = ({ filter, onChange }) => {
  const { filterName, title, fields, fieldsWrapperClassName } = filter;
  const onClear = (fieldName) => onChange(fieldName, '');

  return (
    <div className={cx('filter-item', fieldsWrapperClassName)}>
      <span className={cx('label')}>{title}</span>
      <div className={cx('container')}>
        {fields.map(({ component, name, containerClassName, format, props }) => {
          const InputComponent = component;
          return (
            <div key={filterName} className={cx('input-wrapper', containerClassName)}>
              <FieldProvider name={name} format={format} {...props}>
                <InputComponent onClear={() => onClear(name)} />
              </FieldProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
};

FilterInput.propTypes = {
  filter: PropTypes.shape({
    filterName: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    defaultCondition: PropTypes.string,
    fieldsWrapperClassName: PropTypes.string,
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        component: PropTypes.elementType,
        name: PropTypes.string.isRequired,
        containerClassName: PropTypes.string,
        format: PropTypes.func,
        props: PropTypes.object,
      }),
    ),
  }),
  onChange: PropTypes.func.isRequired,
};
