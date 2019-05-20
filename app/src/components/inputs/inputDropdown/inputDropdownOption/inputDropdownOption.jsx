/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputDropdownOption.scss';

const cx = classNames.bind(styles);

export const DropdownOption = ({
  multiple,
  label,
  disabled,
  selected,
  subOption,
  onChange,
  value,
}) => {
  const onChangeHandler = () => {
    onChange && onChange(value);
  };
  return (
    <div
      className={cx('dropdown-option', {
        selected: !multiple && selected,
        disabled,
        'sub-option': subOption,
      })}
    >
      {multiple ? (
        <InputCheckbox value={selected} disabled={disabled} onChange={onChangeHandler}>
          <span className={cx('option-label')}>{label}</span>
        </InputCheckbox>
      ) : (
        <div className={cx('single-option')} onClick={onChangeHandler}>
          {label}
        </div>
      )}
    </div>
  );
};

DropdownOption.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
  multiple: PropTypes.bool,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  subOption: PropTypes.bool,
  selected: PropTypes.bool,
  onChange: PropTypes.func,
};

DropdownOption.defaultProps = {
  value: '',
  multiple: false,
  label: '',
  disabled: false,
  subOption: false,
  selected: false,
  onChange: () => {},
};
