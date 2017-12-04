import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './Input.scss';

const cx = classNames.bind(styles);

const Input = ({ type, value, placeholder, maxLength, disabled, onChange, onFocus, onBlur }) => {
  const classes = cx({
    input: true,
    disabled,
  });
  const handlerOnChange = (e) => {
    onChange({ value: e.target.value });
  };
  return (
    <input
      type={type}
      className={classes}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      onChange={handlerOnChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};

Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

Input.defaultProps = {
  type: 'text',
  value: '',
  placeholder: '',
  maxLength: '254',
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
};

export default Input;
