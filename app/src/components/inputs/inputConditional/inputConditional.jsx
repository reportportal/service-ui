import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import {
  CONDITION_CNT,
  CONDITION_EQ,
  CONDITION_NOT_CNT,
  CONDITION_NOT_EQ,
} from 'components/filterEntities/constants';
import { getInputConditions } from 'common/constants/inputConditions';
import styles from './inputConditional.scss';

const cx = classNames.bind(styles);

export class InputConditional extends Component {
  static propTypes = {
    value: PropTypes.shape({
      value: PropTypes.string,
      condition: PropTypes.string,
    }),
    conditions: PropTypes.arrayOf(PropTypes.string),
    conditionsBlockClassName: PropTypes.string,
    inputClassName: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    mobileDisabled: PropTypes.bool,
    touched: PropTypes.bool,
    error: PropTypes.string,
    maxLength: PropTypes.number,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyPress: PropTypes.func,
  };

  static defaultProps = {
    value: {},
    placeholder: '',
    conditionsBlockClassName: '',
    inputClassName: '',
    disabled: false,
    mobileDisabled: false,
    touched: false,
    error: '',
    maxLength: null,
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    onKeyUp: () => {},
    onKeyPress: () => {},
    conditions: [CONDITION_CNT, CONDITION_NOT_CNT, CONDITION_EQ, CONDITION_NOT_EQ],
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
  onClickConditionBlock = () => {
    if (!this.props.disabled) {
      this.setState({ opened: !this.state.opened });
    }
  };
  onClickConditionItem = (condition) => {
    if (condition.value !== this.props.value.condition) {
      this.setState({ opened: false });
      this.props.onChange({ value: this.props.value.value, condition: condition.value });
    }
  };
  onChangeInput = (e) => {
    this.props.onChange({ value: e.target.value, condition: this.props.value.condition });
  };
  onBlurInput = (e) => {
    this.props.onBlur({ value: e.target.value, condition: this.props.value.condition });
  };
  onClickClear = () => {
    this.props.onChange({ value: '', condition: this.props.value.condition });
  };
  setConditionsBlockRef = (conditionsBlock) => {
    this.conditionsBlock = conditionsBlock;
  };
  getConditions = () => {
    const { conditions } = this.props;
    return getInputConditions(conditions);
  };
  handleClickOutside = (e) => {
    if (!this.conditionsBlock.contains(e.target)) {
      this.setState({ opened: false });
    }
  };

  render() {
    const {
      value,
      placeholder,
      disabled,
      mobileDisabled,
      error,
      touched,
      maxLength,
      onFocus,
      onKeyUp,
      onKeyPress,
      conditionsBlockClassName,
      inputClassName,
    } = this.props;
    return (
      <div
        className={cx('input-conditional', {
          opened: this.state.opened,
          disabled,
          'mobile-disabled': mobileDisabled,
        })}
      >
        <input
          type={'text'}
          className={cx('input', inputClassName, { error, touched })}
          value={value.value}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          onChange={this.onChangeInput}
          onFocus={onFocus}
          onBlur={this.onBlurInput}
          onKeyUp={onKeyUp}
          onKeyPress={onKeyPress}
        />
        <div
          className={cx('conditions-block', conditionsBlockClassName)}
          ref={this.setConditionsBlockRef}
        >
          <div className={cx('conditions-selector')} onClick={this.onClickConditionBlock}>
            <span className={cx('condition-selected')}>
              {this.getConditions().length &&
                value.condition &&
                this.getConditions().filter((condition) => condition.value === value.condition)[0]
                  .shortLabel}
            </span>
            <i className={cx('arrow', { rotated: this.state.opened })} />
          </div>
          <div className={cx('conditions-list', { visible: this.state.opened })}>
            {this.getConditions().map((condition) => (
              <div
                key={condition.value}
                className={cx('condition', {
                  active: condition.value === value.condition,
                  disabled: condition.disabled,
                })}
                onClick={() => {
                  !condition.disabled && this.onClickConditionItem(condition);
                }}
              >
                {condition.label}
              </div>
            ))}
          </div>
        </div>
        <i className={cx('clear-icon')} onClick={this.onClickClear} />
      </div>
    );
  }
}
