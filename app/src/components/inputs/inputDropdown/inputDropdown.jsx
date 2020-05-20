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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { Manager, Reference, Popper } from 'react-popper';
import styles from './inputDropdown.scss';
import { DropdownOption } from './inputDropdownOption/inputDropdownOption';

const cx = classNames.bind(styles);

export class InputDropdown extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
      PropTypes.bool,
      PropTypes.number,
    ]),
    options: PropTypes.array,
    multiple: PropTypes.bool,
    selectAll: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    touched: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    mobileDisabled: PropTypes.bool,
    independentGroupSelection: PropTypes.bool,
    customClasses: PropTypes.object,
  };

  static defaultProps = {
    value: '',
    options: [],
    multiple: false,
    selectAll: false,
    disabled: false,
    error: '',
    touched: false,
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    mobileDisabled: false,
    independentGroupSelection: false,
    customClasses: {
      dropdown: '',
      selectBlock: '',
      value: '',
      arrow: '',
      selectList: '',
    },
  };
  state = {
    opened: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  onClickSelectBlock = (e) => {
    if (!this.props.disabled) {
      this.setState({ opened: !this.state.opened });
      e.stopPropagation();
      this.updatePosition();
      this.state.opened ? this.props.onBlur() : this.props.onFocus();
    }
  };

  setRef = (node) => {
    this.node = node;
  };

  getOptionChangeHandler = (option) => {
    if (option.disabled) {
      return null;
    }
    return option.groupId && !this.props.independentGroupSelection
      ? this.handleGroupChange
      : this.handleChange;
  };

  handleClickOutside = (e) => {
    if (this.node && !this.node.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
      this.props.onBlur();
    }
  };

  displayedValue() {
    const { multiple, value, options } = this.props;
    let displayedValue = (value && value.label) || value;
    if (multiple) {
      return options
        .filter((option) => value.indexOf(option.value) > -1)
        .map((option) => option.label)
        .join(', ');
    }
    options.forEach((option) => {
      if (option.value === value) {
        displayedValue = option.label;
      }
    });
    return displayedValue;
  }

  handleChange = (selectedValue) => {
    const { multiple, value, onChange } = this.props;
    if (multiple) {
      if (value.indexOf(selectedValue) > -1) {
        onChange(value.filter((item) => item !== selectedValue));
      } else {
        onChange([...value, selectedValue]);
      }
    } else {
      onChange(selectedValue);
      this.setState({ opened: !this.state.opened });
    }
  };

  isGroupOptionSelected = (groupId) =>
    this.props.options
      .filter((item) => item.groupRef === groupId)
      .map((item) => item.value)
      .every((item) => this.props.value.indexOf(item) !== -1);

  handleGroupChange = (groupId) => {
    const relatedSubOptions = this.props.options
      .filter((item) => item.groupRef === groupId)
      .map((item) => item.value);
    if (this.isGroupOptionSelected(groupId)) {
      this.props.onChange(
        this.props.value.filter((item) => relatedSubOptions.indexOf(item) === -1),
      );
    } else {
      this.props.onChange(
        this.props.value.concat(
          relatedSubOptions.filter((item) => this.props.value.indexOf(item) === -1),
        ),
      );
    }
  };

  handleAllClick = () => {
    if (this.props.value.length !== this.props.options.length) {
      this.props.onChange(
        this.props.options.filter((item) => !item.disabled).map((item) => item.value),
      );
    } else {
      this.props.onChange([]);
    }
  };

  renderOptions() {
    return this.props.options.map((option) => {
      let selected;
      this.props.multiple
        ? (selected = this.props.value.indexOf(option.value) > -1)
        : (selected = option.value === this.props.value);
      if (!this.props.independentGroupSelection && option.groupId) {
        selected = this.isGroupOptionSelected(option.groupId);
      }
      return (
        <DropdownOption
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          selected={selected}
          label={option.label}
          multiple={this.props.multiple}
          subOption={!!option.groupRef}
          onChange={this.getOptionChangeHandler(option)}
        />
      );
    });
  }

  render() {
    const {
      error,
      touched,
      disabled,
      mobileDisabled,
      multiple,
      selectAll,
      customClasses,
    } = this.props;
    return (
      <Manager>
        <div ref={this.setRef} className={cx('dropdown-container')}>
          <Reference>
            {({ ref }) => (
              <div
                ref={ref}
                className={cx('dropdown', customClasses.dropdown, { opened: this.state.opened })}
              >
                <div
                  className={cx('select-block', customClasses.selectBlock, {
                    disabled,
                    error,
                    touched,
                    'mobile-disabled': mobileDisabled,
                  })}
                  onClick={this.onClickSelectBlock}
                >
                  <span className={cx('value', customClasses.value)}>{this.displayedValue()}</span>
                  <span className={cx('arrow', customClasses.arrow)} />
                </div>
              </div>
            )}
          </Reference>
          <Popper
            placement="bottom-start"
            modifiers={{
              preventOverflow: { enabled: true },
              flip: {
                enabled: true,
              },
            }}
          >
            {({ placement, ref, style, scheduleUpdate }) => {
              this.updatePosition = scheduleUpdate;
              return (
                <div
                  ref={ref}
                  style={style}
                  data-placement={placement}
                  className={cx('select-list', customClasses.selectList, {
                    opened: this.state.opened,
                  })}
                >
                  {multiple && selectAll && (
                    <div className={cx('select-all-block')} onClick={this.handleAllClick}>
                      <span className={cx('select-all')}>All</span>
                    </div>
                  )}
                  <ScrollWrapper autoHeight autoHeightMax={300}>
                    {this.renderOptions()}
                  </ScrollWrapper>
                </div>
              );
            }}
          </Popper>
        </div>
      </Manager>
    );
  }
}
