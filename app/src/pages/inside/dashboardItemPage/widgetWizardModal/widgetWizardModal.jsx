import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { withModal, ModalHeader } from 'components/main/modal';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { hideModalAction } from 'controllers/modal';
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
@connect(
  null,
  {
    hideModalAction,
  },
)
export class WidgetWizardModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    hideModalAction: PropTypes.func.isRequired,
  };

  static defaultProps = {};

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
  closeModal = () => {
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
              className={cx('modal-window')}
            >
              <ModalHeader
                text={intl.formatMessage(messages.headerText)}
                onClose={this.closeModal}
              />

              {status !== 'exited' ? <WidgetWizardContent /> : <SpinningPreloader />}
            </div>
          )}
        </CSSTransition>
      </div>
    );
  }
}
