import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './sectionHeader.scss';

const cx = classNames.bind(styles);

export const SectionHeader = ({ text, error }) => (
  <div className={cx('section-header', { error })}>{text}</div>
);

SectionHeader.propTypes = {
  text: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  error: PropTypes.bool,
};
SectionHeader.defaultProps = {
  text: '',
  error: false,
};
