import React, { Component } from 'react';
import track from 'react-tracking';
import { Scrollbars } from 'react-custom-scrollbars';
import { CSSTransition } from 'react-transition-group';
import { connect } from 'react-redux';
import { hideModalAction } from 'controllers/modal';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ModalContent, ModalFooter, ModalHeader } from '../';
import styles from './modalLayout.scss';

const cx = classNames.bind(styles);

@connect(null, {
  hideModalAction,
})
@track()
export class ModalLayout extends Component {
  static propTypes = {
    className: PropTypes.string,
    hideModalAction: PropTypes.func.isRequired, // this props
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]), // header props
    children: PropTypes.node, // content props
    warningMessage: PropTypes.string, // footer props
    okButton: PropTypes.shape({
      text: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
      danger: PropTypes.bool,
      onClick: PropTypes.func,
    }),
    cancelButton: PropTypes.shape({
      text: PropTypes.string.isRequired,
      eventInfo: PropTypes.object,
    }),
    customButton: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.shape({
        onClick: PropTypes.func,
        component: PropTypes.func,
        buttonProps: PropTypes.object,
      }),
    ]),
    closeConfirmation: PropTypes.shape({
      closeConfirmedCallback: PropTypes.func,
      withCheckbox: PropTypes.bool,
      confirmationMessage: PropTypes.string,
      confirmationWarningClassName: PropTypes.string,
      confirmationWarning: PropTypes.string,
    }),
    closeIconEventInfo: PropTypes.object,
    renderHeaderElements: PropTypes.func,
    renderFooterElements: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    className: '',
    title: '',
    children: null,
    warningMessage: '',
    okButton: null,
    cancelButton: null,
    customButton: null,
    stopOutsideClose: false,
    closeConfirmation: null,
    closeIconEventInfo: {},
    renderHeaderElements: () => {},
    renderFooterElements: () => {},
  };
  state = {
    shown: false,
    closeConfirmed: false,
    showConfirmation: false,
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
    const { okButton, customButton } = this.props;
    if (e.keyCode === 27) {
      this.closeModal();
    }
    if ((e.ctrlKey && e.keyCode === 13) || (e.metaKey && e.keyCode === 13)) {
      (okButton && okButton.onClick && okButton.onClick(this.closeModalWithOk)) ||
        (customButton && customButton.onClick && customButton.onClick(this.closeModalWithOk));
    }
  };
  onClickModal = (e) => {
    const { closeConfirmation } = this.props;
    if (!this.modal.contains(e.target)) {
      if (!closeConfirmation) {
        this.closeModal();
      } else {
        this.setState({ showConfirmation: true });
      }
    }
  };
  onCloseConfirm = (closeConfirmed) => {
    this.setState({
      closeConfirmed,
    });
  };

  onClickCancelButton = () => {
    this.closeModal();
    this.props.tracking.trackEvent(this.props.cancelButton.eventInfo);
  };

  onClickCloseIcon = () => {
    this.closeModal();
    this.props.tracking.trackEvent(this.props.closeIconEventInfo);
  };

  closeModalWithOk = () => {
    this.setState({ shown: false });
  };

  closeModal = () => {
    const { closeConfirmation } = this.props;

    if (closeConfirmation) {
      this.closeModalWithConfirmation();
    } else {
      this.setState({ shown: false });
    }
  };
  closeModalWithConfirmation = () => {
    const { closeConfirmed } = this.state;
    const { closeConfirmedCallback, withCheckbox } = this.props.closeConfirmation;

    if (withCheckbox && closeConfirmed) {
      closeConfirmedCallback && closeConfirmedCallback();
      this.setState({ shown: false });
    }

    withCheckbox ? this.setState({ showConfirmation: true }) : this.setState({ shown: false });
  };

  render() {
    const {
      title,
      warningMessage,
      okButton,
      cancelButton,
      customButton,
      children,
      closeConfirmation,
      renderFooterElements,
    } = this.props;
    const footerProps = {
      warningMessage,
      okButton,
      cancelButton,
      customButton,
      renderFooterElements,
      confirmationMessage: closeConfirmation && closeConfirmation.confirmationMessage,
      confirmationWarning: closeConfirmation && closeConfirmation.confirmationWarning,
      confirmationWarningClassName:
        closeConfirmation && closeConfirmation.confirmationWarningClassName,
      showConfirmation: this.state.showConfirmation,
      closeConfirmed: this.state.closeConfirmed,
      onCloseConfirm: this.onCloseConfirm,
      confirmWithCheckbox: closeConfirmation && closeConfirmation.withCheckbox,
    };

    return (
      <div className={cx('modal-layout')}>
        <div className={cx('scrolling-content')} onClick={this.onClickModal}>
          <Scrollbars>
            <span>
              <CSSTransition
                timeout={300}
                in={this.state.shown}
                classNames={cx('modal-window-animation')}
                onExited={this.props.hideModalAction}
              >
                {(status) => (
                  <div
                    ref={(modal) => {
                      this.modal = modal;
                    }}
                    className={cx('modal-window', this.props.className)}
                  >
                    <ModalHeader
                      text={title}
                      onClose={this.onClickCloseIcon}
                      renderHeaderElements={this.props.renderHeaderElements}
                    />
                    <ModalContent>{status !== 'exited' ? children : null}</ModalContent>

                    <ModalFooter
                      {...footerProps}
                      onClickOk={this.closeModalWithOk}
                      closeHandler={this.onClickCancelButton}
                      className={this.props.className}
                    />
                  </div>
                )}
              </CSSTransition>
            </span>
          </Scrollbars>
        </div>
        <CSSTransition
          timeout={300}
          in={this.state.shown}
          classNames={cx('modal-backdrop-animation')}
        >
          <div className={cx('backdrop')} />
        </CSSTransition>
      </div>
    );
  }
}
