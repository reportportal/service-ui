import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './InputCheckbox.scss';

const cx = classNames.bind(styles);

const InputCheckbox = ({ children, value, disabled, onChange, onFocus, onBlur }) => {
  const squareClasses = cx({
    square: true,
    checked: value,
    disabled,
  });
  const handlerOnChange = (e) => {
    onChange({ value: e.target.checked });
  };
  return (
    <label className={cx('input-checkbox')} onFocus={onFocus} onBlur={onBlur} tabIndex="1">
      <input
        type="checkbox"
        className={cx('input')}
        checked={value}
        disabled={disabled}
        onChange={handlerOnChange}
      />
      <div className={squareClasses}>
        <svg className={cx('icon')} xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 8 7">
          <polygon fill={disabled ? '#999' : '#fff'} fillRule="evenodd" points="0 3.111 3 6.222 8 1.037 7 0 3 4.148 1 2.074" />
        </svg>
      </div>
      <span className={cx('children-container')}>{children}</span>
    </label>
  );
};

InputCheckbox.propTypes = {
  children: PropTypes.node,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

InputCheckbox.defaultProps = {
  children: '',
  value: false,
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
};

export default InputCheckbox;
