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

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { Manager, Reference, Popper } from 'react-popper';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { useOnClickOutside } from 'common/hooks';
import { DropdownOption } from './dropdownOption';
import ArrowIcon from './img/arrow-inline.svg';
import styles from './dropdown.scss';

const cx = classNames.bind(styles);

export const Dropdown = ({
  value,
  options,
  disabled,
  error,
  onChange,
  onFocus,
  onBlur,
  mobileDisabled,
  title,
  touched,
  icon,
  variant,
  placeholder,
  defaultWidth,
  renderOption,
  dataAutomationId,
}) => {
  const [isOpened, setOpened] = useState(false);
  const containerRef = useRef();
  let updatePosition;

  const handleClickOutside = () => {
    if (isOpened) {
      setOpened(false);
      onBlur();
    }
  };
  useOnClickOutside(containerRef, handleClickOutside);

  const onClickDropdown = (e) => {
    if (!disabled) {
      e.stopPropagation();
      updatePosition();
      setOpened(!isOpened);
      isOpened ? onBlur() : onFocus();
    }
  };

  const getDisplayedValue = () => {
    if (!value && value !== false) return placeholder;
    let displayedValue = (value && value.label) || value;
    options.forEach((option) => {
      if (option.value === value) {
        displayedValue = option.label;
      }
    });
    return displayedValue;
  };

  const handleChange = (option) => {
    if (option.disabled) {
      return;
    }
    onChange(option.value);
    setOpened(!isOpened);
  };

  const renderOptions = () =>
    options.map((option) => {
      const isSelected =
        option.value === ((value && value.value) !== undefined ? value.value : value);
      return (
        <DropdownOption
          key={option.value}
          selected={isSelected}
          onChange={option.disabled ? null : () => handleChange(option)}
          variant={variant}
          option={option}
          render={renderOption}
          isOpened={isOpened}
        />
      );
    });

  return (
    <Manager>
      <div
        ref={containerRef}
        className={cx('container', { 'default-width': defaultWidth })}
        title={title}
        data-automation-id={dataAutomationId}
      >
        <Reference>
          {({ ref }) => (
            <div
              tabIndex="0"
              ref={ref}
              className={cx(variant, 'dropdown', {
                opened: isOpened,
                disabled,
                error,
                touched,
                'mobile-disabled': mobileDisabled,
              })}
              onClick={onClickDropdown}
            >
              {icon && <i className={cx('icon')}>{Parser(icon)}</i>}
              <span className={cx(variant, 'value', { placeholder: !value })}>
                {getDisplayedValue()}
              </span>
              <i className={cx(variant, 'arrow')}>{Parser(ArrowIcon)}</i>
            </div>
          )}
        </Reference>
        <Popper
          placement="bottom-start"
          eventsEnabled={false}
          modifiers={{
            preventOverflow: { enabled: true },
            flip: {
              enabled: true,
            },
          }}
        >
          {({ placement, ref, style, scheduleUpdate }) => {
            updatePosition = scheduleUpdate;
            return (
              <div
                ref={ref}
                style={style}
                data-placement={placement}
                className={cx(variant, 'select-list', {
                  opened: isOpened,
                })}
              >
                <ScrollWrapper autoHeight autoHeightMax={216}>
                  {renderOptions()}
                </ScrollWrapper>
              </div>
            );
          }}
        </Popper>
      </div>
    </Manager>
  );
};

Dropdown.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ]),
  options: PropTypes.array,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  mobileDisabled: PropTypes.bool,
  title: PropTypes.string,
  touched: PropTypes.bool,
  icon: PropTypes.string,
  variant: PropTypes.oneOf(['light', 'dark', 'ghost']),
  placeholder: PropTypes.string,
  defaultWidth: PropTypes.bool,
  renderOption: PropTypes.func,
  dataAutomationId: PropTypes.string,
};

Dropdown.defaultProps = {
  value: '',
  options: [],
  disabled: false,
  error: '',
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  mobileDisabled: false,
  title: '',
  touched: false,
  icon: null,
  variant: 'light',
  placeholder: '',
  defaultWidth: true,
  renderOption: null,
  dataAutomationId: '',
};
