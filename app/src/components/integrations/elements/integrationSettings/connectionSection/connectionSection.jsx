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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { showModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import InfoIcon from 'common/img/info-inline.svg';
import CheckIcon from 'common/img/check-inline.svg';
import TrashIcon from 'common/img/trashcan-inline.svg';
import EditIcon from 'common/img/pencil-icon-inline.svg';
import styles from './connectionSection.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  connectionTitle: {
    id: 'ConnectionSection.connectionTitle',
    defaultMessage: 'Connection',
  },
  connectedMessage: {
    id: 'ConnectionSection.connectedMessage',
    defaultMessage: 'Connected',
  },
  connectionFailedMessage: {
    id: 'ConnectionSection.connectionFailedMessage',
    defaultMessage: 'Connection Failed',
  },
  removeIntegrationTitle: {
    id: 'ConnectionSection.removeIntegrationTitle',
    defaultMessage: 'Remove Integration',
  },
  editAuthorizationTitle: {
    id: 'ConnectionSection.editAuthorizationTitle',
    defaultMessage: 'Edit authorization',
  },
  removeIntegrationMessage: {
    id: 'ConnectionSection.removeIntegrationMessage',
    defaultMessage: 'Do you really want to remove the integration?',
  },
});

@connect(null, {
  showModalAction,
})
@injectIntl
export class ConnectionSection extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
    onRemoveIntegration: PropTypes.func.isRequired,
    blocked: PropTypes.bool,
    failedConnectionMessage: PropTypes.string,
    editAuthConfig: PropTypes.object,
  };

  static defaultProps = {
    blocked: false,
    failedConnectionMessage: null,
    editAuthConfig: null,
  };

  removeIntegrationHandler = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(messages.removeIntegrationMessage),
        onConfirm: this.props.onRemoveIntegration,
        title: formatMessage(messages.removeIntegrationTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        dangerConfirm: true,
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
      blocked,
      editAuthConfig,
      failedConnectionMessage,
    } = this.props;
    const isConnectionFailed = !!failedConnectionMessage;

    return (
      <div className={cx('connection-section')}>
        <h3 className={cx('block-header')}>{formatMessage(messages.connectionTitle)}</h3>
        <div className={cx('connection-status-block', { 'connection-failed': isConnectionFailed })}>
          <span className={cx('connection-status')}>
            <span className={cx('status-icon')}>
              {Parser(isConnectionFailed ? InfoIcon : CheckIcon)}
            </span>
            {formatMessage(
              isConnectionFailed ? messages.connectionFailedMessage : messages.connectedMessage,
            )}
          </span>
          {isConnectionFailed && (
            <span className={cx('failed-connection-message')}>{failedConnectionMessage}</span>
          )}
        </div>
        {editAuthConfig && (
          <Fragment>
            <div className={cx('connection-status-block', 'auth-info-block')}>
              {editAuthConfig.content}
            </div>
            {!blocked && (
              <button className={cx('connection-block-button')} onClick={editAuthConfig.onClick}>
                <span className={cx('button-icon')}>{Parser(EditIcon)}</span>
                {formatMessage(messages.editAuthorizationTitle)}
              </button>
            )}
          </Fragment>
        )}
        {!blocked && (
          <button className={cx('connection-block-button')} onClick={this.removeIntegrationHandler}>
            <span className={cx('button-icon')}>{Parser(TrashIcon)}</span>
            {formatMessage(messages.removeIntegrationTitle)}
          </button>
        )}
      </div>
    );
  }
}
