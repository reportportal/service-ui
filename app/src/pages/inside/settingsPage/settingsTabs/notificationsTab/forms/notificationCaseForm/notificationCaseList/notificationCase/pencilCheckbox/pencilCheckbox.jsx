import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import styles from './pencilCheckbox.scss';
import CheckIcon from './img/ic-check-inline.svg';
import PencilIcon from './img/icon-pencil-inline.svg';

const cx = classNames.bind(styles);

export const PencilCheckbox = (props) => {
  const { value, disabled, onChange, onFocus, onBlur, onValidate, error } = props;
  const changeHandler = (v) => {
    onValidate(error);
    if (error) {
      return;
    }
    onChange(v);
  };

  return (
    // eslint-disable-next-line
    <label className={cx('pencil-checkbox')} onFocus={onFocus} onBlur={onBlur}>
      <input
        type="checkbox"
        className={cx('hidden')}
        checked={value}
        disabled={disabled}
        onChange={changeHandler}
      />
      <div className={cx('icon', { checked: value, disabled })}>
        <div className={cx('pencil')}>{Parser(PencilIcon)}</div>
        <div className={cx('check')}>{Parser(CheckIcon)}</div>
      </div>
    </label>
  );
};

PencilCheckbox.propTypes = {
  children: PropTypes.node,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onValidate: PropTypes.func,
  error: PropTypes.string,
};
PencilCheckbox.defaultProps = {
  children: '',
  value: false,
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onValidate: () => {},
  error: null,
};
