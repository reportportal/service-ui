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

import { Component } from 'react';
import Downshift from 'downshift';
import PropTypes from 'prop-types';
import { Manager, Reference, Popper } from 'react-popper';
import { FieldText } from '@reportportal/ui-kit';
import { ENTER_KEY_CODE, TAB_KEY_CODE } from 'common/constants/keyCodes';
import { AutocompleteMenu } from '../common/autocompleteMenu';
import { autocompleteVariantType, singleAutocompleteOptionVariantType } from '../common/propTypes';
import { scrollIntoAutocompleteMenu } from '../common/scrollIntoAutocompleteMenu';

const DEFAULT_OPTIONS_INDEX = 0;

const DEFAULT_OPTIONS_MAX_HEIGHT = 140;
const MIN_OPTIONS_MAX_HEIGHT = 60;
const MENU_BASE_OVERHEAD = 20; // .menu margin-top (4) + .container margins (8 + 8)
const NEW_ITEM_OVERHEAD = 53; // divider (1 + 8 + 8) + .new-item min-height (36)

export class SingleAutocomplete extends Component {
  referenceEl = null;

  state = {
    optionsMaxHeight: DEFAULT_OPTIONS_MAX_HEIGHT,
  };

  static propTypes = {
    options: PropTypes.array,
    loading: PropTypes.bool,
    onStateChange: PropTypes.func,
    value: PropTypes.any,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    disabled: PropTypes.bool,
    inputProps: PropTypes.object,
    parseValueToString: PropTypes.func,
    renderOption: PropTypes.func,
    minLength: PropTypes.number,
    maxLength: PropTypes.number,
    async: PropTypes.bool,
    optionVariant: singleAutocompleteOptionVariantType,
    isRequired: PropTypes.bool,
    error: PropTypes.string,
    touched: PropTypes.bool,
    setTouch: PropTypes.func,
    createWithoutConfirmation: PropTypes.bool,
    menuClassName: PropTypes.string,
    icon: PropTypes.node,
    isOptionUnique: PropTypes.func,
    refFunction: PropTypes.func,
    stateReducer: PropTypes.func,
    variant: autocompleteVariantType,
    useFixedPositioning: PropTypes.bool,
    customEmptyListMessage: PropTypes.string,
    getUniqKey: PropTypes.func,
    skipOptionCreation: PropTypes.bool,
    newItemButtonText: PropTypes.string,
    // Opt-in: clamp options list height to fit space below the field, so the menu
    // never overflows the viewport.
    adaptiveOptionsHeight: PropTypes.bool,
    creatable: PropTypes.bool,
    shouldShowEmptyListMessage: PropTypes.bool,
  };

  static defaultProps = {
    options: [],
    loading: false,
    value: '',
    placeholder: '',
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    disabled: false,
    inputProps: {},
    parseValueToString: (value) => value || '',
    renderOption: null,
    minLength: 1,
    maxLength: null,
    async: false,
    optionVariant: '',
    isRequired: false,
    error: '',
    touched: false,
    setTouch: () => {},
    createWithoutConfirmation: false,
    menuClassName: '',
    icon: null,
    isOptionUnique: null,
    refFunction: () => {},
    stateReducer: (state, changes) => changes,
    variant: 'light',
    useFixedPositioning: false,
    skipOptionCreation: false,
    newItemButtonText: '',
    adaptiveOptionsHeight: false,
    creatable: true,
    shouldShowEmptyListMessage: true,
  };

  setReferenceEl = (popperRef) => (el) => {
    popperRef(el);
    this.referenceEl = el;
  };

  // Shrink the options list to fit the space below the field, so the menu never
  // overflows the viewport. The new-item row is rendered outside the ScrollWrapper
  // and always stays visible.
  recalcOptionsMaxHeight = () => {
    if (!this.referenceEl) return;
    const { createWithoutConfirmation, creatable } = this.props;
    const hasNewItemRow = creatable && !createWithoutConfirmation;
    const overhead = MENU_BASE_OVERHEAD + (hasNewItemRow ? NEW_ITEM_OVERHEAD : 0);
    const { bottom } = this.referenceEl.getBoundingClientRect();
    const available = window.innerHeight - bottom - overhead;
    const next = Math.min(DEFAULT_OPTIONS_MAX_HEIGHT, Math.max(MIN_OPTIONS_MAX_HEIGHT, available));
    if (next !== this.state.optionsMaxHeight) {
      this.setState({ optionsMaxHeight: next });
    }
  };

  getOptionProps =
    (getItemProps, highlightedIndex, selectedItem) =>
    ({ item, index, ...rest }) =>
      getItemProps({
        item,
        index,
        isActive: highlightedIndex === index,
        isSelected: selectedItem === item,
        ...rest,
      });

  handleKeyDown = (event, setHighlightedIndex) => {
    if (event.keyCode === TAB_KEY_CODE) {
      event.preventDefault();
      setHighlightedIndex(this.props.options.length);
    }
  };

  render() {
    const {
      onStateChange,
      onChange,
      onBlur,
      onFocus,
      parseValueToString,
      placeholder,
      disabled,
      value,
      inputProps,
      maxLength,
      optionVariant,
      isRequired,
      error,
      touched,
      setTouch,
      createWithoutConfirmation,
      menuClassName,
      icon,
      options,
      isOptionUnique,
      refFunction,
      stateReducer,
      variant,
      useFixedPositioning,
      skipOptionCreation,
      newItemButtonText,
      adaptiveOptionsHeight,
      creatable,
      ...props
    } = this.props;

    const { onKeyDown: inputOnKeyDown, ...restInputProps } = inputProps || {};

    return (
      <Manager>
        <Downshift
          onChange={onChange}
          itemToString={parseValueToString}
          selectedItem={value}
          onStateChange={(changes, ...args) => {
            onStateChange?.(changes, ...args);

            if (adaptiveOptionsHeight && changes?.isOpen) {
              this.recalcOptionsMaxHeight();
            }
          }}
          defaultHighlightedIndex={DEFAULT_OPTIONS_INDEX}
          stateReducer={stateReducer}
          scrollIntoView={scrollIntoAutocompleteMenu}
        >
          {({
            getInputProps,
            getItemProps,
            setHighlightedIndex,
            isOpen,
            inputValue,
            highlightedIndex,
            selectItem,
          }) => (
            <div>
              <Reference>
                {({ ref }) => (
                  <div ref={this.setReferenceEl(ref)}>
                    <FieldText
                      {...getInputProps({
                        placeholder: !disabled ? placeholder : '',
                        maxLength,
                        onFocus: () => {
                          onFocus();
                        },
                        ref: refFunction,
                        onKeyDown: (event) => {
                          if (event.keyCode === ENTER_KEY_CODE) {
                            event.preventDefault();
                          }

                          if (inputValue && isOpen) {
                            this.handleKeyDown(event, setHighlightedIndex);
                          }
                          inputOnKeyDown?.(event);
                        },
                        onBlur: (e) => {
                          const newValue = (inputValue || '').trim();

                          if (!skipOptionCreation) {
                            if (!createWithoutConfirmation && !newValue) {
                              selectItem(newValue);
                            }

                            if (createWithoutConfirmation && creatable) {
                              selectItem(newValue);
                            }
                          }

                          onBlur(e);
                          isOptionUnique?.(newValue ? !options.find((v) => v === newValue) : null);
                          setTouch(true);
                        },
                        disabled,
                        defaultWidth: false,
                        isRequired,
                        touched,
                        error,
                        endIcon: icon,
                        variant,
                        ...restInputProps,
                      })}
                    />
                  </div>
                )}
              </Reference>
              <Popper
                placement="bottom-start"
                positionFixed={useFixedPositioning}
                modifiers={{
                  preventOverflow: { escapeWithReference: true },
                  flip: {
                    enabled: true,
                  },
                }}
              >
                {({ placement, ref, style }) => (
                  <AutocompleteMenu
                    isOpen={isOpen}
                    placement={placement}
                    style={style}
                    ref={ref}
                    inputValue={(inputValue || '').trim()}
                    getItemProps={this.getOptionProps(getItemProps, highlightedIndex, value)}
                    parseValueToString={parseValueToString}
                    optionVariant={optionVariant}
                    createWithoutConfirmation={createWithoutConfirmation}
                    className={menuClassName}
                    options={options}
                    optionsMaxHeight={this.state.optionsMaxHeight}
                    variant={variant}
                    newItemButtonText={newItemButtonText}
                    creatable={creatable}
                    {...props}
                  />
                )}
              </Popper>
            </div>
          )}
        </Downshift>
      </Manager>
    );
  }
}
