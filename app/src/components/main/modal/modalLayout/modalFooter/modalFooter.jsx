import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { BigButton } from 'components/buttons/bigButton';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import warningIcon from 'common/img/error-inline.svg';
import styles from './modalFooter.scss';

const cx = classNames.bind(styles);

export class ModalFooter extends Component {
  static propTypes = {
    warningMessage: PropTypes.string,
    okButton: PropTypes.shape({
      text: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
      danger: PropTypes.bool,
    }),
    cancelButton: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }),
    customButton: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.shape({
        onClick: PropTypes.func,
        component: PropTypes.func,
        buttonProps: PropTypes.object,
        left: PropTypes.bool,
      }),
    ]),
    onClickOk: PropTypes.func,
    closeHandler: PropTypes.func,
    onCloseConfirm: PropTypes.func,
    showConfirmation: PropTypes.bool,
    closeConfirmed: PropTypes.bool,
    confirmationMessage: PropTypes.string,
    confirmationWarning: PropTypes.string,
    confirmationWarningClassName: PropTypes.string,
    confirmWithCheckbox: PropTypes.bool,
  };
  static defaultProps = {
    warningMessage: '',
    okButton: null,
    cancelButton: null,
    customButton: null,
    onClickOk: () => {},
    closeHandler: () => {},
    onCloseConfirm: () => {},
    showConfirmation: false,
    closeConfirmed: false,
    confirmationMessage: '',
    confirmationWarning: '',
    confirmationWarningClassName: '',
    confirmWithCheckbox: false,
  };
  closeConfirmChangeHandler = () => {
    const { closeConfirmed } = this.props;
    this.props.onCloseConfirm(!closeConfirmed);
  };

  render() {
    const {
      warningMessage,
      okButton,
      cancelButton,
      customButton,
      closeHandler,
      onClickOk,
      showConfirmation,
      confirmationMessage,
      confirmationWarning,
      confirmationWarningClassName,
      closeConfirmed,
      confirmWithCheckbox,
    } = this.props;

    return (
      <div className={cx('modal-footer')}>
        {showConfirmation && (
          <div className={cx('confirmation-block')}>
            {confirmationWarning && (
              <div className={cx('warning-block-wrap', confirmationWarningClassName)}>
                <div className={cx('warning-block')}>
                  <i className={cx('warning-icon')}>{Parser(warningIcon)}</i>
                  <span className={cx('warning-message')}>{confirmationWarning}</span>
                </div>
              </div>
            )}
            {confirmWithCheckbox && (
              <InputCheckbox value={closeConfirmed} onChange={this.closeConfirmChangeHandler}>
                <span className={cx('confirmation-label')}>{confirmationMessage}</span>
              </InputCheckbox>
            )}
          </div>
        )}
        {warningMessage && (
          <div className={cx('warning-block')}>
            <i className={cx('warning-icon')}>{Parser(warningIcon)}</i>
            <span className={cx('warning-message')}>{warningMessage}</span>
          </div>
        )}
        <div className={cx('buttons-block')}>
          {cancelButton && (
            <div className={cx('button-container')}>
              <BigButton color={'gray-60'} onClick={closeHandler} disabled={cancelButton.disabled}>
                {cancelButton.text}
              </BigButton>
            </div>
          )}
          {okButton && (
            <div className={cx('button-container')}>
              <BigButton
                color={okButton.danger ? 'tomato' : 'booger'}
                onClick={() => okButton.onClick(onClickOk)}
                disabled={okButton.disabled}
              >
                {okButton.text}
              </BigButton>
            </div>
          )}
          {customButton && (
            <div
              className={cx('button-container', {
                left: customButton.component ? customButton.left : customButton.props.left,
              })}
            >
              {customButton.component ? (
                <customButton.component
                  {...customButton.buttonProps}
                  onClick={() => customButton.onClick(onClickOk)}
                />
              ) : (
                customButton
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
