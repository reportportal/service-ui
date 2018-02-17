import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { CSSTransition } from 'react-transition-group';
import { connect } from 'react-redux';
import { hideModalAction } from 'controllers/modal';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ModalContent, ModalFooter } from '../';
import styles from './modalLayout.scss';
import CloseIcon from './img/icon-close-inline.svg';

const cx = classNames.bind(styles);

@connect(null, {
  hideModalAction,
})
export class ModalLayout extends Component {
  static propTypes = {
    hideModalAction: PropTypes.func, // this props
    onSuccessClose: PropTypes.func,

    title: PropTypes.string, // header props

    children: PropTypes.node, // content props
    validateContent: PropTypes.func, // validation function witch should return bool.

    warningMessage: PropTypes.string, // footer props
    hasCancel: PropTypes.bool,
    hasOk: PropTypes.bool,
    dangerButton: PropTypes.bool,
    cancelText: PropTypes.string,
    okText: PropTypes.string,
    customButton: PropTypes.node,
  };
  static defaultProps = {
    hideModalAction: () => {},
    onSuccessClose: () => {},

    title: '',

    children: null,
    validateContent: () => true,

    warningMessage: '',
    hasCancel: false,
    hasOk: false,
    dangerButton: false,
    cancelText: 'Cancel',
    okText: 'Save',
    customButton: null,
  };
  state = {
    shown: false,
  };
  componentDidMount() {
    document.addEventListener('keydown', this.onKeydown, false);
    this.onMount();
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeydown, false);
  }
  onMount() {
    this.setState({ shown: true });
  }
  onKeydown = (e) => {
    if (e.keyCode === 27) {
      this.closeModal();
    }
    if ((e.ctrlKey && e.keyCode === 13) || (e.metaKey && e.keyCode === 13)) {
      this.successCloseModal();
    }
  };
  onClick = (e) => {
    !this.modal.contains(e.target) && this.closeModal();
  };
  successCloseModal = () => {
    if (this.props.validateContent()) {
      this.props.onSuccessClose();
      this.closeModal();
    }
  };
  closeModal = () => {
    this.setState({ shown: false });
    setTimeout(() => this.props.hideModalAction(), 300);
  };
  render() {
    const {
      title, warningMessage, hasCancel, hasOk, dangerButton, cancelText, okText, customButton,
      children,
    } = this.props;
    const footerProps = {
      warningMessage, hasCancel, hasOk, dangerButton, cancelText, okText, customButton,
    };

    return (
      <div className={cx('modal-layout')}>
        <div className={cx('scrolling-content')}>
          <Scrollbars onClick={this.onClick}>
            <CSSTransition timeout={300} in={this.state.shown} classNames={cx('modal-window-animation')}>
              {status => (
                <div ref={(modal) => { this.modal = modal; }} className={cx('modal-window')}>
                  <div className={cx('modal-header')}>
                    <span className={cx('modal-title')}>
                      {title}
                    </span>
                    <div className={cx('close-modal-icon')} onClick={this.closeModal}>
                      {Parser(CloseIcon)}
                    </div>
                    <div className={cx('separator')} />
                  </div>

                  <ModalContent>
                    {status !== 'exited' ? children : null }
                  </ModalContent>

                  <ModalFooter
                    {...footerProps}
                    onClickOk={this.successCloseModal}
                    onClickCancel={this.closeModal}
                  />
                </div>
                )}

            </CSSTransition>
          </Scrollbars>
        </div>
        <CSSTransition timeout={300} in={this.state.shown} classNames={cx('modal-backdrop-animation')}>
          <div className={cx('backdrop')} />
        </CSSTransition>
      </div>
    );
  }
}
