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
import styles from './inputSwitcher.scss';

const cx = classNames.bind(styles);

export const InputSwitcher = ({
  children,
  value,
  onChange,
  onFocus,
  onBlur,
  readOnly,
  className,
  childrenFirst,
  childrenClassName,
}) => {
  const sliderClasses = cx({
    'switcher-slider': true,
    centered: !children,
    on: value,
    readonly: readOnly,
    'children-first': childrenFirst,
  });
  const onChangeHandler = (e) => {
    if (!readOnly) onChange(e.target.checked);
  };

  return (
    // eslint-disable-next-line
    <label className={cx('input-switcher', className)} onFocus={onFocus} onBlur={onBlur} tabIndex="1">
      <input
        type="checkbox"
        className={cx('input')}
        readOnly={readOnly}
        checked={value}
        onChange={onChangeHandler}
      />
      {childrenFirst && (
        <span
          className={cx(
            'children-container',
            { readonly: readOnly, 'children-first': childrenFirst },
            childrenClassName,
          )}
        >
          {children}
        </span>
      )}
      <span className={sliderClasses} />
      {!childrenFirst && (
        <span className={cx('children-container', { readonly: readOnly })}>{children}</span>
      )}
    </label>
  );
};

InputSwitcher.propTypes = {
  children: PropTypes.node,
  value: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  childrenFirst: PropTypes.bool,
  childrenClassName: PropTypes.string,
};

InputSwitcher.defaultProps = {
  children: null,
  value: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  readOnly: false,
  className: '',
  childrenFirst: false,
  childrenClassName: '',
};
