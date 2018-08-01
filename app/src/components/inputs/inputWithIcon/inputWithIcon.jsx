import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputWithIcon.scss';

const cx = classNames.bind(styles);

export const InputWithIcon = ({
  type,
  value,
  readonly,
  className,
  error,
  placeholder,
  maxLength,
  disabled,
  icon,
  iconClass,
  refFunction,
  onChange,
  onFocus,
  onBlur,
  onKeyUp,
  onKeyPress,
  touched,
}) => (
  <React.Fragment>
    <input
      ref={refFunction}
      type={type}
      className={cx('inputWithIcon', className, { disabled, error, touched })}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      readOnly={readonly}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyUp={onKeyUp}
      onKeyPress={onKeyPress}
    />
    <span className={cx('icon', `${iconClass}`)}>{icon}</span>
  </React.Fragment>
);

InputWithIcon.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.string,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClass: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func,
  onKeyPress: PropTypes.func,
  refFunction: PropTypes.func,
  touched: PropTypes.bool,
};

InputWithIcon.defaultProps = {
  type: 'text',
  value: '',
  placeholder: '',
  maxLength: '254',
  disabled: false,
  readonly: false,
  className: '',
  icon: '',
  iconClass: '',
  error: '',
  touched: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onKeyUp: () => {},
  onKeyPress: () => {},
  refFunction: () => {},
};
