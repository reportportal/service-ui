import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './modalContentHeading.scss';

const cx = classNames.bind(styles);

export const ModalContentHeading = ({ text }) => (
  <div className={cx('modal-content-heading')}>{text}</div>
);

ModalContentHeading.propTypes = {
  text: PropTypes.string,
};
ModalContentHeading.defaultProps = {
  text: '',
};
