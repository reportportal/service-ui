import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { destroy } from 'redux-form';
import { CSSTransition } from 'react-transition-group';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { withModal, ModalHeader } from 'components/main/modal';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { hideModalAction } from 'controllers/modal';
import { WIDGET_WIZARD_FORM } from './widgetWizardContent/wizardControlsSection/constants';
import { WidgetWizardContent } from './widgetWizardContent';
import styles from './widgetWizardModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  headerText: {
    id: 'WidgetWizardModal.headerText',
    defaultMessage: 'Add new widget',
  },
});

@withModal('widgetWizardModal')
@injectIntl
@connect(null, {
  destroyWizardForm: () => destroy(WIDGET_WIZARD_FORM),
  hideModalAction,
})
@track()
export class WidgetWizardModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
      eventsInfo: PropTypes.object,
    }),
    hideModalAction: PropTypes.func.isRequired,
    destroyWizardForm: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {
      onConfirm: () => {},
      eventsInfo: {},
    },
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
  onClickModal = (e) => {
    !this.modal.contains(e.target) && this.closeModal();
  };
  onKeydown = (e) => {
    if (e.keyCode === 27) {
      this.closeModal();
    }
    if ((e.ctrlKey && e.keyCode === 13) || (e.metaKey && e.keyCode === 13)) {
      this.onClickOk();
    }
  };
  onClosed = () => {
    this.props.hideModalAction();
    this.props.destroyWizardForm();
  };
  closeModal = () => {
    this.props.tracking.trackEvent(this.props.data.eventsInfo.closeIcon);
    this.setState({ shown: false });
  };

  render() {
    const { intl } = this.props;
    return (
      <div className={cx('widget-wizard')}>
        <CSSTransition
          timeout={300}
          in={this.state.shown}
          classNames={cx('modal-backdrop-animation')}
        >
          <div className={cx('backdrop')} onClick={this.closeModal} />
        </CSSTransition>
        <div className={cx('scrolling-content')} onClick={this.onClickModal}>
          <ScrollWrapper>
            <CSSTransition
              timeout={300}
              in={this.state.shown}
              classNames={cx('modal-window-animation')}
              onExited={this.onClosed}
            >
              {(status) => (
                <div
                  ref={(modal) => {
                    this.modal = modal;
                  }}
                  className={cx('modal-window')}
                >
                  <ModalHeader
                    text={intl.formatMessage(messages.headerText)}
                    onClose={this.closeModal}
                  />

                  {status !== 'exited' ? (
                    <WidgetWizardContent
                      closeModal={this.onClosed}
                      eventsInfo={this.props.data.eventsInfo}
                    />
                  ) : (
                    <SpinningPreloader />
                  )}
                </div>
              )}
            </CSSTransition>
          </ScrollWrapper>
        </div>
      </div>
    );
  }
}
