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

import PropTypes from 'prop-types';

export const Textarea = ({ readonly,
                        placeholder, maxLength, disabled, refFunction,
                        onChange, onFocus, onBlur, onKeyUp, defaultValue, cols, rows }) => (
                          <textarea
                            defaultValue={defaultValue}
                            ref={refFunction}
                            placeholder={placeholder}
                            maxLength={maxLength}
                            disabled={disabled}
                            readOnly={readonly}
                            onChange={onChange}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            onKeyUp={onKeyUp}
                            cols={cols}
                            rows={rows}
                          />
  );

Textarea.propTypes = {
  defaultValue: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  hasRightIcon: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func,
  refFunction: PropTypes.func,
  cols: PropTypes.string,
  rows: PropTypes.string,
};

Textarea.defaultProps = {
  defaultValue: '',
  children: '',
  value: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  hasRightIcon: false,
  maxLength: 1000,
  cols: '30',
  rows: '10',
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onKeyUp: () => {},
  refFunction: () => {},
};
