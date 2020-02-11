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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { injectIntl, defineMessages } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showScreenLockAction } from 'controllers/screenLock';
import { getDefaultWidgetConfig } from '../common/utils';
import { SharedWidgetInfoSection } from './sharedWidgetInfoSection';
import { SharedWidgetsListSection } from './sharedWidgetsListSection';
import styles from './addSharedWidgetModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  headerText: {
    id: 'AddSharedWidgetModal.headerText',
    defaultMessage: 'Add shared widget',
  },
});

@withModal('addSharedWidgetModal')
@track()
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
  }),
  {
    showScreenLockAction,
  },
)
@injectIntl
export class AddSharedWidgetModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
      currentDashboard: PropTypes.object,
      eventsInfo: PropTypes.object,
    }),
    projectId: PropTypes.string,
  };

  static defaultProps = {
    data: {
      onConfirm: () => {},
      currentDashboard: {},
      eventsInfo: {},
    },
    projectId: '',
  };

  state = {
    selectedWidget: null,
  };

  onSelectWidget = (selectedWidget) => {
    const {
      tracking,
      data: { eventsInfo = {} },
    } = this.props;

    tracking.trackEvent(eventsInfo.chooseRadioBtn);
    return this.setState({ selectedWidget });
  };

  onAdd = (closeModal) => {
    const {
      data: { onConfirm },
    } = this.props;
    const { widgetType, id } = this.state.selectedWidget;
    this.props.showScreenLockAction();
    const widget = {
      widgetId: id,
      widgetType,
      ...getDefaultWidgetConfig(widgetType),
    };
    onConfirm(widget, closeModal);
  };

  getCloseConfirmationConfig = () => {
    if (!this.state.selectedWidget) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
      confirmationWarningClassName: cx('confirmation-wrapper'),
    };
  };

  render() {
    const {
      intl: { formatMessage },
      projectId,
      data: { currentDashboard, eventsInfo = {} },
    } = this.props;
    const okButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.ADD),
      onClick: this.onAdd,
      disabled: !this.state.selectedWidget,
      eventInfo: eventsInfo.addBtn,
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.cancelBtn,
    };

    return (
      <ModalLayout
        title={formatMessage(messages.headerText)}
        okButton={okButton}
        cancelButton={cancelButton}
        className={cx('add-shared-widget-modal')}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <div className={cx('shared-widget-modal-content')}>
          <SharedWidgetInfoSection
            selectedWidget={this.state.selectedWidget}
            projectId={projectId}
          />
          <SharedWidgetsListSection
            projectId={projectId}
            currentDashboard={currentDashboard}
            selectedWidget={this.state.selectedWidget}
            onSelectWidget={this.onSelectWidget}
            scrollWidgetsEvents={eventsInfo.scrollWidgets}
          />
        </div>
      </ModalLayout>
    );
  }
}
