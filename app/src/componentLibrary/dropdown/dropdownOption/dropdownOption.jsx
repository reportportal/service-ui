/*
 * Copyright 2022 EPAM Systems
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
import styles from './dropdownOption.scss';

const cx = classNames.bind(styles);

export const DropdownOption = React.forwardRef((props, ref) => {
  const {
    option: { value, disabled, hidden, label, title, groupRef },
    selected,
    onChange,
    variant,
    render,
    highlightHovered,
    onMouseEnter,
  } = props;

  const onChangeHandler = () => onChange?.(value);

  return (
    <div
      className={cx(variant, 'dropdown-option', {
        selected,
        disabled,
        hidden,
        hover: highlightHovered,
      })}
      title={title}
      onClick={onChangeHandler}
      ref={ref}
      onMouseEnter={onMouseEnter}
    >
      <div className={cx('single-option', { 'sub-option': !!groupRef })}>
        {render ? render(props) : label}
      </div>
    </div>
  );
});

DropdownOption.propTypes = {
  option: PropTypes.shape({
    label: PropTypes.node.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]).isRequired,
    disabled: PropTypes.bool,
    hidden: PropTypes.bool,
    title: PropTypes.string,
    groupRef: PropTypes.string,
  }),
  selected: PropTypes.bool,
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['light', 'dark', 'ghost']),
  render: PropTypes.func,
  highlightHovered: PropTypes.bool,
  onMouseEnter: PropTypes.func,
};

DropdownOption.defaultProps = {
  selected: false,
  onChange: () => {},
  render: null,
  highlightHovered: false,
  onMouseEnter: () => {},
};
