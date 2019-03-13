import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { CSSTransition } from 'react-transition-group';
import { IntegrationModalHeader } from './integrationModalHeader/index';
import { IntegrationModalContent } from './integrationModalContent/index';
import styles from './integrationModal.scss';

const cx = classNames.bind(styles);

export class IntegrationModal extends Component {
  static propTypes = {
    hideModalAction: PropTypes.func.isRequired,
    data: PropTypes.shape({
      integrationType: PropTypes.object,
    }),
  };
  static defaultProps = {
    title: '',
    data: {
      integrationType: {},
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
  onKeydown = (e) => {
    if (e.keyCode === 27) {
      this.closeModal();
    }
  };
  onClickModal = (e) => {
    if (!this.modal.contains(e.target)) {
      this.closeModal();
    }
  };

  closeModal = () => {
    this.setState({ shown: false });
  };

  render() {
    const {
      data: { integrationType },
    } = this.props;

    return (
      <div className={cx('integration-modal')}>
        <div className={cx('scrolling-content')} onClick={this.onClickModal}>
          <CSSTransition
            timeout={300}
            in={this.state.shown}
            classNames={cx('integration-modal-window-animation')}
            onExited={() => this.props.hideModalAction(null)}
          >
            {(status) => (
              <div
                ref={(modal) => {
                  this.modal = modal;
                }}
                className={cx('integration-modal-window')}
              >
                <IntegrationModalHeader
                  integrationType={integrationType}
                  onClose={this.closeModal}
                />
                {status !== 'exited' ? (
                  <IntegrationModalContent
                    integrationType={integrationType}
                    closeModal={this.closeModal}
                  />
                ) : null}
              </div>
            )}
          </CSSTransition>
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
