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
    hideModalAction: PropTypes.func.isRequired, // this props

    title: PropTypes.string, // header props

    children: PropTypes.node, // content props

    warningMessage: PropTypes.string, // footer props
    okButton: PropTypes.shape({
      text: PropTypes.string.isRequired,
      danger: PropTypes.bool,
      onClick: PropTypes.func,
    }),
    cancelButton: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }),
    customButton: PropTypes.node,
  };
  static defaultProps = {
    title: '',

    children: null,

    warningMessage: '',
    okButton: null,
    cancelButton: null,
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
      this.onClickOk();
    }
  };
  onClickModal = (e) => {
    !this.modal.contains(e.target) && this.closeModal();
  };
  onClickOk = () => {
    this.props.okButton.onClick(this.closeModal);
  };
  closeModal = () => {
    this.setState({ shown: false });
  };
  render() {
    const {
      title, warningMessage, okButton, cancelButton, customButton,
      children,
    } = this.props;
    const footerProps = {
      warningMessage, okButton, cancelButton, customButton,
    };

    return (
      <div className={cx('modal-layout')}>
        <div className={cx('scrolling-content')} onClick={this.onClickModal}>
          <Scrollbars>
            <CSSTransition
              timeout={300}
              in={this.state.shown}
              classNames={cx('modal-window-animation')}
              onExited={this.props.hideModalAction}
            >
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
                    onClickOk={this.onClickOk}
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
