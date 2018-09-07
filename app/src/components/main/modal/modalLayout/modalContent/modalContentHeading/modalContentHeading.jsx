import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './modalContentHeading.scss';

const cx = classNames.bind(styles);

export const ModalContentHeading = ({ text, error }) => (
  <div className={cx('modal-content-heading', { error })}>{text}</div>
);

ModalContentHeading.propTypes = {
  text: PropTypes.string,
  error: PropTypes.bool,
};
ModalContentHeading.defaultProps = {
  text: '',
  error: false,
};
