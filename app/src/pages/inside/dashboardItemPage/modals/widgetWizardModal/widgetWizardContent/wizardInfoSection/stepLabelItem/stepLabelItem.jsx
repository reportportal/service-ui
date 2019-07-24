import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './stepLabelItem.scss';

const cx = classNames.bind(styles);

export const StepLabelItem = ({ step, label, active, completed }) => (
  <div className={cx('step-label-item', { active, completed })}>
    <div className={cx('number')}>{step + 1}</div>
    <div className={cx('label')}>{label}</div>
  </div>
);
StepLabelItem.propTypes = {
  step: PropTypes.number,
  label: PropTypes.string,
  active: PropTypes.bool,
  completed: PropTypes.bool,
};
StepLabelItem.defaultProps = {
  step: 0,
  label: '',
  active: false,
  completed: false,
};
