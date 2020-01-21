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

import { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { userIdSelector } from 'controllers/user';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import styles from './launchDeleteModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  deleteLaunchHeader: {
    id: 'DeleteLaunchDialog.deleteLaunchHeader',
    defaultMessage: 'Delete launch',
  },
  deleteLaunchText: {
    id: 'DeleteLaunchDialog.deleteLaunch',
    defaultMessage:
      "Are you sure to delete launch '<b>{name} #{number}</b>'? It will no longer exist.",
  },
  deleteLaunchWarning: {
    id: 'DeleteLaunchDialog.deleteLaunchWarning',
    defaultMessage:
      'You are going to delete not your own launch. This may affect other users information on the project.',
  },
});

@withModal('launchDeleteModal')
@injectIntl
@connect((state) => ({
  userId: userIdSelector(state),
}))
@track()
export class LaunchDeleteModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      item: PropTypes.object,
      onConfirm: PropTypes.func,
    }),
    userId: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {
      item: {},
      onConfirm: () => {},
    },
  };
  confirmAndClose = (closeModal) => {
    this.props.tracking.trackEvent(LAUNCHES_MODAL_EVENTS.DELETE_BTN_DELETE_MODAL);
    this.props.data.onConfirm();
    closeModal();
  };

  render() {
    const { intl } = this.props;
    const { item } = this.props.data;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: this.confirmAndClose,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: LAUNCHES_MODAL_EVENTS.CANCEL_BTN_DELETE_MODAL,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.deleteLaunchHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
        warningMessage={
          item.owner !== this.props.userId ? intl.formatMessage(messages.deleteLaunchWarning) : null
        }
        closeIconEventInfo={LAUNCHES_MODAL_EVENTS.CLOSE_ICON_DELETE_MODAL}
      >
        <p className={cx('message')}>
          {Parser(
            intl.formatMessage(messages.deleteLaunchText, { name: item.name, number: item.number }),
          )}
        </p>
      </ModalLayout>
    );
  }
}
