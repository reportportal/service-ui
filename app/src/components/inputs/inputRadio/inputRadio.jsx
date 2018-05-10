import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputRadio.scss';

const cx = classNames.bind(styles);

export const InputRadio = ({
  children,
  value,
  ownValue,
  name,
  disabled,
  onChange,
  onFocus,
  onBlur,
}) => (
  <label className={cx('input-radio', { disabled })} onFocus={onFocus} onBlur={onBlur} tabIndex="1">
    <input
      type="radio"
      className={cx('input')}
      disabled={disabled}
      onChange={onChange}
      value={ownValue}
      checked={value === ownValue}
      name={name}
    />
    <span className={cx('toggler', { checked: value === ownValue })} />
    {children && <span className={cx('children-container')}>{children}</span>}
  </label>
);
InputRadio.propTypes = {
  children: PropTypes.node,
  value: PropTypes.string,
  ownValue: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};
InputRadio.defaultProps = {
  children: '',
  value: '',
  ownValue: '',
  name: '',
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
};
