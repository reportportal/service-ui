import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputConditional.scss';

const cx = classNames.bind(styles);

export class InputConditional extends Component {
  static propTypes = {
    value: PropTypes.object,
    conditions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      }),
    ),
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
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
    conditions: [],
    placeholder: '',
    disabled: false,
    touched: false,
    error: '',
    maxLength: null,
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    onKeyUp: () => {},
    onKeyPress: () => {},
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
  handleClickOutside = (e) => {
    if (!this.conditionsBlock.contains(e.target)) {
      this.setState({ opened: false });
    }
  };

  render() {
    const {
      value,
      conditions,
      placeholder,
      disabled,
      error,
      touched,
      maxLength,
      onFocus,
      onKeyUp,
      onKeyPress,
    } = this.props;
    return (
      <div className={cx('input-conditional', { opened: this.state.opened, disabled })}>
        <input
          type={'text'}
          className={cx('input', { error, touched })}
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
        <div className={cx('conditions-block')} ref={this.setConditionsBlockRef}>
          <div className={cx('conditions-selector')} onClick={this.onClickConditionBlock}>
            <span className={cx('condition-selected')}>
              {conditions.filter((condition) => condition.value === value.condition)[0].shortLabel}
            </span>
            <i className={cx('arrow', { rotated: this.state.opened })} />
          </div>
          <div className={cx('conditions-list', { visible: this.state.opened })}>
            {conditions.map((condition) => (
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
