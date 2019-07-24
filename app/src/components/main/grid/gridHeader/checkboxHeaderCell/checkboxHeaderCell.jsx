import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import styles from './checkboxHeaderCell.scss';

const cx = classNames.bind(styles);

export const CheckboxHeaderCell = ({ value, onChange }) => (
  <div className={cx('checkbox-header-cell')}>
    <InputCheckbox value={value} onChange={onChange} />
  </div>
);
CheckboxHeaderCell.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func,
};
CheckboxHeaderCell.defaultProps = {
  value: false,
  onChange: () => {},
};
