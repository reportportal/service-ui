/*
 * Copyright 2022 EPAM Systems
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
import { injectIntl, defineMessages } from 'react-intl';
import track from 'react-tracking';
import moment from 'moment';
import Parser from 'html-react-parser';
import { showModalAction } from 'controllers/modal';
import { PLUGIN_NAME_TITLES } from 'components/integrations/constants';
import { namedProjectIntegrationsSelector } from 'controllers/plugins';
import { PLUGINS_PAGE_EVENTS, SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { SystemMessage } from 'componentLibrary/systemMessage';
import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import TrashBin from 'common/img/newIcons/bin-inline.svg';
import Tick from 'common/img/newIcons/tick-inline.svg';
import ErrorIcon from 'common/img/newIcons/error-inline.svg';
import styles from './connectionSection.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  connectedMessage: {
    id: 'ConnectionSection.connectedMessage',
    defaultMessage: 'Connected',
  },
  connectionFailedMessage: {
    id: 'ConnectionSection.connectionFailedMessage',
    defaultMessage: 'Connection Failed',
  },
  connectionFailedHeader: {
    id: 'ConnectionSection.connectionFailedHeader',
    defaultMessage: 'Connection Error',
  },
  connectionFailedDescription: {
    id: 'ConnectionSection.connectionFailedDescription',
    defaultMessage: 'Failed to connect to {pluginName}.',
  },
  connectionFailedCapture: {
    id: 'ConnectionSection.connectionFailedCapture',
    defaultMessage: 'Please, check the integration settings or try to connect later.',
  },
  warningMessage: {
    id: 'ConnectionSection.warningMessage',
    defaultMessage: 'Warning',
  },
  warningMessageDescription: {
    id: 'ConnectionSection.warningMessageDescription',
    defaultMessage: 'Global Integrations are inactive as you have configured Project Integration',
  },
  projectIntegrationDelete: {
    id: 'IntegrationsDescription.projectIntegrationDelete',
    defaultMessage: 'Delete',
  },
  projectIntegrationDeleteDescription: {
    id: 'IntegrationsDescription.projectIntegrationDeleteDescription',
    defaultMessage: 'Are you sure you want to delete Project Integration',
  },
});

@connect(
  (state) => ({
    projectIntegrations: namedProjectIntegrationsSelector(state),
  }),
  {
    showModalAction,
  },
)
@track()
@injectIntl
export class ConnectionSection extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
    projectIntegrations: PropTypes.object.isRequired,
    onRemoveIntegration: PropTypes.func.isRequired,
    testConnection: PropTypes.func,
    blocked: PropTypes.bool,
    connected: PropTypes.bool,
    editAuthConfig: PropTypes.object,
    pluginName: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    isGlobal: PropTypes.bool,
    data: PropTypes.shape({
      creationDate: PropTypes.number,
      creator: PropTypes.string,
      enabled: PropTypes.bool,
      id: PropTypes.number,
      name: PropTypes.string,
      integrationParameters: PropTypes.object,
      integrationType: PropTypes.object,
      projectId: PropTypes.number,
    }).isRequired,
  };

  static defaultProps = {
    blocked: false,
    connected: true,
    editAuthConfig: null,
    pluginName: null,
    isGlobal: false,
  };

  removeIntegrationHandler = () => {
    const {
      intl: { formatMessage },
      tracking,
      pluginName,
      isGlobal,
      data,
    } = this.props;

    tracking.trackEvent(
      (isGlobal ? PLUGINS_PAGE_EVENTS : SETTINGS_PAGE_EVENTS).pluginRemoveIntegrationClick(
        pluginName,
      ),
    );

    this.props.showModalAction({
      id: 'deleteProjectIntegrationModal',
      data: {
        onConfirm: this.props.onRemoveIntegration,
        modalTitle: `${formatMessage(messages.projectIntegrationDelete)} ${data.name}`,
        description: `${formatMessage(messages.projectIntegrationDeleteDescription)} ${data.name}?`,
      },
    });
  };

  onEditAuth = () => {
    const { editAuthConfig, testConnection, tracking, pluginName, isGlobal } = this.props;
    tracking.trackEvent(
      (isGlobal ? PLUGINS_PAGE_EVENTS : SETTINGS_PAGE_EVENTS).pluginEditAuthorizationClick(
        pluginName,
      ),
    );
    editAuthConfig.onClick(testConnection);
  };

  render() {
    const {
      intl: { formatMessage },
      blocked,
      editAuthConfig,
      connected,
      projectIntegrations,
      pluginName,
      data: { name, creator, creationDate },
    } = this.props;

    const availableProjectIntegrations = projectIntegrations[pluginName] || [];

    return (
      <>
        {!connected && (
          <div className={cx({ 'with-global-message': blocked })}>
            <SystemMessage
              header={formatMessage(messages.connectionFailedHeader)}
              mode="error"
              caption={formatMessage(messages.connectionFailedCapture)}
            >
              {formatMessage(messages.connectionFailedDescription, {
                pluginName: PLUGIN_NAME_TITLES[pluginName] || pluginName,
              })}
            </SystemMessage>
          </div>
        )}
        {availableProjectIntegrations.length > 0 && blocked && (
          <SystemMessage header={formatMessage(messages.warningMessage)} mode="warning">
            {formatMessage(messages.warningMessageDescription)}
          </SystemMessage>
        )}

        <div
          className={cx('connection-section', {
            'connection-section-with-message':
              !connected || (availableProjectIntegrations.length > 0 && blocked),
          })}
        >
          <div className={cx('integration-info-block')}>
            <div className={cx('sub-header-block')}>
              <div
                className={cx('general-info', {
                  blocked: blocked && availableProjectIntegrations.length,
                })}
              >
                <h1>{name}</h1>
                <p>
                  {creator} on {moment(creationDate).format('ll')}
                </p>
              </div>
              <div
                className={cx('connection-block', {
                  'connection-block-failed': !connected,
                  'connection-block-disabled': blocked && availableProjectIntegrations.length,
                })}
              >
                {Parser(connected ? Tick : ErrorIcon)}
                <p>
                  {formatMessage(
                    connected ? messages.connectedMessage : messages.connectionFailedMessage,
                  )}
                </p>
              </div>
            </div>
            {editAuthConfig && editAuthConfig.content}
          </div>
          <div className={cx('buttons-block')}>
            {editAuthConfig && !blocked && (
              <button onClick={this.onEditAuth} className={cx('action-button')}>
                {Parser(PencilIcon)}
              </button>
            )}

            {!blocked && (
              <button onClick={this.removeIntegrationHandler} className={cx('action-button')}>
                {Parser(TrashBin)}
              </button>
            )}
          </div>
        </div>
      </>
    );
  }
}
