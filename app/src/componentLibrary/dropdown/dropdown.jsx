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
import { useSelect } from 'downshift';
import { ENTER_KEY_CODE } from 'common/constants/keyCodes';
import { DropdownOption } from './dropdownOption';
import ArrowIcon from './img/arrow-inline.svg';
import styles from './dropdown.scss';
import { CLOSE_DROPDOWN_KEY_CODES_MAP, OPEN_DROPDOWN_KEY_CODES_MAP } from './constants';
import { calculateDefaultIndex, calculateNextIndex, calculatePrevIndex } from './utils';

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
  transparentBackground,
  className,
  toggleButtonClassName,
}) => {
  const [isOpened, setOpened] = useState(false);
  const containerRef = useRef(null);
  const updatePosition = useRef(null);

  const handleClickOutside = () => {
    if (isOpened) {
      setOpened(false);
      onBlur();
    }
  };
  useOnClickOutside(containerRef, handleClickOutside);

  const handleChange = (option) => {
    if (option.disabled) {
      return;
    }
    onChange(option.value);
    setOpened((prevState) => !prevState);
  };

  const defaultHighlightedIndex = calculateDefaultIndex(options, value);

  const {
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    setHighlightedIndex,
    highlightedIndex,
    selectedItem,
  } = useSelect({
    items: options,
    itemToString: (item) => item.label ?? placeholder,
    onChange: handleChange,
    selectedItem: value,
    isOpen: isOpened,
    circularNavigation: true,
    defaultHighlightedIndex,
    onHighlightedIndexChange: (changes) => {
      switch (changes.type) {
        case useSelect.stateChangeTypes.MenuKeyDownArrowUp:
          return {
            ...changes,
            highlightedIndex: setHighlightedIndex(
              calculatePrevIndex(changes.highlightedIndex, options),
            ),
          };

        case useSelect.stateChangeTypes.MenuKeyDownArrowDown:
          return {
            ...changes,
            highlightedIndex: setHighlightedIndex(
              calculateNextIndex(changes.highlightedIndex, options),
            ),
          };

        default:
          return {
            ...changes,
          };
      }
    },
  });

  const onClickDropdown = () => {
    if (!disabled) {
      updatePosition.current();
      setOpened((prevState) => !prevState);
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

  const handleToggleButtonKeyDown = (event) => {
    const { keyCode } = event;
    if (OPEN_DROPDOWN_KEY_CODES_MAP[keyCode] && !isOpened) {
      event.preventDefault();
      setHighlightedIndex(defaultHighlightedIndex);
      updatePosition.current();
      setOpened(true);
      onFocus();
    }
  };

  const handleKeyDownMenu = (event) => {
    const { keyCode } = event;
    if (keyCode === ENTER_KEY_CODE) {
      const option = options[highlightedIndex];
      handleChange(option);
      setOpened(false);
      onBlur();
      return;
    }

    if (CLOSE_DROPDOWN_KEY_CODES_MAP[keyCode]) {
      event.stopPropagation();
      setOpened(false);
      onBlur();
    }
  };

  const renderOptions = () =>
    options.map((option, index) => (
      <DropdownOption
        key={option.value}
        {...getItemProps({
          item: option,
          index,
          selected: option.value === selectedItem.value,
          variant,
          option,
          highlightHovered: highlightedIndex === index,
          render: renderOption,
          onChange: option.disabled ? null : () => handleChange(option),
          onMouseEnter: () => setHighlightedIndex(index),
        })}
      />
    ));

  return (
    <Manager>
      <div
        ref={containerRef}
        className={cx('container', { 'default-width': defaultWidth }, className)}
        title={title}
        data-automation-id={dataAutomationId}
      >
        <Reference>
          {({ ref }) => (
            <div
              {...getToggleButtonProps({
                ref,
                tabIndex: disabled ? -1 : 0,
                className: cx(variant, 'dropdown', toggleButtonClassName, {
                  'transparent-background': transparentBackground,
                  opened: isOpened,
                  disabled,
                  error,
                  touched,
                  'mobile-disabled': mobileDisabled,
                }),
                onClick: onClickDropdown,
                onKeyDown: handleToggleButtonKeyDown,
              })}
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
            preventOverflow: {
              escapeWithReference: true,
            },
            flip: {
              enabled: true,
            },
          }}
        >
          {({ placement, ref, style, scheduleUpdate }) => {
            updatePosition.current = scheduleUpdate;
            return (
              <div
                data-placement={placement}
                {...getMenuProps({
                  ref,
                  style,
                  className: cx(variant, 'select-list', { opened: isOpened }),
                  onKeyDown: handleKeyDownMenu,
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
  transparentBackground: PropTypes.bool,
  className: PropTypes.string,
  toggleButtonClassName: PropTypes.string,
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
  transparentBackground: false,
  className: '',
  toggleButtonClassName: '',
};
