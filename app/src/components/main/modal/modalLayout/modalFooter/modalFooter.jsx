import React from 'react';
import PropTypes from 'prop-types';
import { BigButton } from 'components/buttons/bigButton';
import classNames from 'classnames/bind';
import styles from './modalFooter.scss';

const cx = classNames.bind(styles);

export const ModalFooter = ({
  warningMessage, okButton, cancelButton, customButton, onClickCancel, onClickOk,
}) => (
  <div className={cx('modal-footer')}>
    { warningMessage ?
      <div className={cx('warning-block')}>
        <i className={cx('warning-icon')} />
        <span className={cx('warning-message')}>
          { warningMessage }
        </span>
      </div>
      : null
    }
    <div className={cx('buttons-block')}>
      {
        cancelButton ?
          <div className={cx('button-container')}>
            <BigButton color={'gray-60'} onClick={onClickCancel}>{cancelButton.text}</BigButton>
          </div>
          : null
      }
      {
        okButton ?
          <div className={cx('button-container')}>
            <BigButton color={okButton.danger ? 'tomato' : 'booger'} onClick={onClickOk}>{okButton.text}</BigButton>
          </div>
          : null
      }
      {
        customButton ?
          <div className={cx('button-container')}>
            { customButton }
          </div>
          : null
      }
    </div>
  </div>
  );
ModalFooter.propTypes = {
  warningMessage: PropTypes.string,
  okButton: PropTypes.shape({
    text: PropTypes.string.isRequired,
    danger: PropTypes.bool,
  }),
  cancelButton: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }),
  customButton: PropTypes.node,
  onClickOk: PropTypes.func,
  onClickCancel: PropTypes.func,
};
ModalFooter.defaultProps = {
  warningMessage: '',
  okButton: null,
  cancelButton: null,
  customButton: null,
  onClickOk: () => {},
  onClickCancel: () => {},
};
