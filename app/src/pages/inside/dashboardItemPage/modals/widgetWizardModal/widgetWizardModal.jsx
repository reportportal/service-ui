/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { destroy, getFormValues } from 'redux-form';
import { CSSTransition } from 'react-transition-group';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { withModal, ModalHeader } from 'components/main/modal';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { hideModalAction } from 'controllers/modal';
import { WIDGET_WIZARD_FORM } from '../common/constants';
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
  (state) => ({
    formValues: getFormValues(WIDGET_WIZARD_FORM)(state),
  }),
  {
    destroyWizardForm: () => destroy(WIDGET_WIZARD_FORM),
    hideModalAction,
  },
)
@track()
export class WidgetWizardModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
      eventsInfo: PropTypes.object,
    }),
    hideModalAction: PropTypes.func.isRequired,
    destroyWizardForm: PropTypes.func.isRequired,
    formValues: PropTypes.object,
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
    formValues: undefined,
  };

  state = {
    shown: false,
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

  onClickModal = (e) => {
    if (this.modal && !this.modal.contains(e.target)) {
      if (this.props.formValues) {
        this.setState({ showConfirmation: true });
      } else {
        this.closeModal();
      }
    }
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
    const { intl, data, formValues } = this.props;

    return (
      <div className={cx('widget-wizard')}>
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
                      onConfirm={data.onConfirm}
                      eventsInfo={data.eventsInfo}
                      formValues={formValues}
                      showConfirmation={this.state.showConfirmation}
                    />
                  ) : (
                    <SpinningPreloader />
                  )}
                </div>
              )}
            </CSSTransition>
          </ScrollWrapper>
        </div>
        <CSSTransition
          timeout={300}
          in={this.state.shown}
          classNames={cx('modal-backdrop-animation')}
        >
          <div className={cx('backdrop')} onClick={this.closeModal} />
        </CSSTransition>
      </div>
    );
  }
}
