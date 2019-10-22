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
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import styles from './checkboxCell.scss';

const cx = classNames.bind(styles);

export const CheckboxCell = ({
  className,
  value,
  customProps: { selected, onChange, disabled },
}) => (
  <div className={cx('checkbox-cell', className)}>
    <InputCheckbox value={selected} onChange={() => onChange(value)} disabled={disabled} />
  </div>
);
CheckboxCell.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object.isRequired,
  customProps: PropTypes.shape({
    selected: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  }),
};
CheckboxCell.defaultProps = {
  className: '',
  customProps: {},
};
