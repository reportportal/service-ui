import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputTextArea.scss';

const cx = classNames.bind(styles);

export const InputTextArea = ({
  value,
  readonly,
  error,
  placeholder,
  maxLength,
  disabled,
  mobileDisabled,
  refFunction,
  onChange,
  onFocus,
  onBlur,
  onKeyUp,
}) => (
  <textarea
    ref={refFunction}
    className={cx('input-text-area', {
      'mobile-disabled': mobileDisabled,
      disabled,
      error,
    })}
    value={value}
    placeholder={placeholder}
    maxLength={maxLength}
    disabled={disabled}
    readOnly={readonly}
    onChange={onChange}
    onFocus={onFocus}
    onBlur={onBlur}
    onKeyUp={onKeyUp}
  >
    {value}
  </textarea>
);

InputTextArea.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.string,
  disabled: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
  readonly: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func,
  refFunction: PropTypes.func,
};

InputTextArea.defaultProps = {
  value: '',
  placeholder: '',
  maxLength: '256',
  disabled: false,
  mobileDisabled: false,
  readonly: false,
  error: '',
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onKeyUp: () => {},
  refFunction: () => {},
};
