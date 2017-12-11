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
import InputCheckbox from 'components/inputs/inputChekbox/inputCheckbox';
import { connect } from '@cerebral/react';
import { state, props } from 'cerebral/tags';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputDropdownOption.scss';

const cx = classNames.bind(styles);

const DropdownOption = ({ multiple, text, disabled, active }) => {
  const dropdownOptionClasses = cx({
    'dropdown-option': true,
    active: !multiple && active,
    disabled,
  });
  return (
    <div className={dropdownOptionClasses}>
      {
        multiple
          ? <InputCheckbox value={active} disabled={disabled} >{text}</InputCheckbox>
          : <div className={cx('single-option')}>{text}</div>
      }
    </div>
  );
};

DropdownOption.propTypes = {
  formPath: PropTypes.string,
  fieldName: PropTypes.string,
  id: PropTypes.string,
  multiple: PropTypes.bool,
  text: PropTypes.string,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
};

DropdownOption.defaultProps = {
  formPath: '',
  fieldName: '',
  id: '',
  multiple: false,
  text: '',
  disabled: false,
  active: false,
};

export default connect({
  text: state`${props`formPath`}.${props`fieldName`}.optionsById.${props`id`}.text`,
  disabled: state`${props`formPath`}.${props`fieldName`}.optionsById.${props`id`}.disabled`,
  active: state`${props`formPath`}.${props`fieldName`}.optionsById.${props`id`}.active`,
}, DropdownOption);
