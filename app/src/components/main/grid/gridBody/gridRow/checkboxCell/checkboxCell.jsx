import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import styles from './checkboxCell.scss';

const cx = classNames.bind(styles);

export const CheckboxCell = ({ className, value, customProps: { selected, onChange } }) => (
  <div className={cx('checkbox-cell', className)}>
    <InputCheckbox value={selected} onChange={() => onChange(value)} />
  </div>
);
CheckboxCell.propTypes = {
  className: PropTypes.string,
  value: PropTypes.object.isRequired,
  customProps: PropTypes.shape({
    selected: PropTypes.bool,
    onChange: PropTypes.func,
  }),
};
CheckboxCell.defaultProps = {
  className: '',
  customProps: {},
};
