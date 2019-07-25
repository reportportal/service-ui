import Parser from 'html-react-parser';
import CloseIcon from 'common/img/cross-icon-inline.svg';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './modalHeader.scss';

const cx = classNames.bind(styles);

export const ModalHeader = ({ text, onClose, renderHeaderElements }) => (
  <div className={cx('modal-header')}>
    <div className={cx('modal-header-content')}>
      <span className={cx('modal-title')}>{text}</span>
      <div className={cx('modal-header-elements')}>{renderHeaderElements()}</div>
    </div>
    <div className={cx('close-modal-icon')} onClick={onClose}>
      {Parser(CloseIcon)}
    </div>
    <div className={cx('separator')} />
  </div>
);
ModalHeader.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onClose: PropTypes.func,
  renderHeaderElements: PropTypes.func,
};
ModalHeader.defaultProps = {
  text: '',
  onClose: () => {},
  renderHeaderElements: () => {},
};
