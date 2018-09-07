import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './labeledSection.scss';

const cx = classNames.bind(styles);

export const LabeledSection = ({ className, vertical, label, children }) => (
  <div className={cx('labeled-section', className)}>
    {label && <div className={cx('label', { vertical })}>{label}</div>}
    <div className={cx('content')}>{children}</div>
  </div>
);
LabeledSection.propTypes = {
  className: PropTypes.string,
  vertical: PropTypes.bool,
  label: PropTypes.string,
  children: PropTypes.node,
};
LabeledSection.defaultProps = {
  className: '',
  vertical: false,
  label: '',
  children: null,
};
