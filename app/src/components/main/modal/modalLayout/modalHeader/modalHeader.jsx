import Parser from 'html-react-parser';
import CloseIcon from 'common/img/cross-icon-inline.svg';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './modalHeader.scss';

const cx = classNames.bind(styles);

export const ModalHeader = ({ text, onClose }) => (
  <div className={cx('modal-header')}>
    <span className={cx('modal-title')}>{text}</span>
    <div className={cx('close-modal-icon')} onClick={onClose}>
      {Parser(CloseIcon)}
    </div>
    <div className={cx('separator')} />
  </div>
);
ModalHeader.propTypes = {
  text: PropTypes.string,
  onClose: PropTypes.func,
};
ModalHeader.defaultProps = {
  text: '',
  onClose: () => {},
};
