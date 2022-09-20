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
import track from 'react-tracking';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { removeIntegrationAction } from 'controllers/plugins';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import { activeProjectKeySelector } from 'controllers/user';
import { urlProjectKeySelector } from 'controllers/pages';
import { PLUGIN_NAME_TITLES } from '../../constants';
import { INTEGRATION_FORM } from './integrationForm/constants';
import { ConnectionSection } from './connectionSection';
import { IntegrationForm } from './integrationForm';
import styles from './integrationSettings.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  failedConnectMessage: {
    id: 'IntegrationSettings.failedConnectMessage',
    defaultMessage: 'Failed connect to {pluginName} integration: {error}',
  },
});

@connect(
  (state) => ({
    projectKey: activeProjectKeySelector(state),
    payloadProjectKey: urlProjectKeySelector(state),
  }),
  {
    removeIntegrationAction,
  },
)
@injectIntl
@track()
export class IntegrationSettings extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    formFieldsComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
    goToPreviousPage: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    removeIntegrationAction: PropTypes.func.isRequired,
    editAuthConfig: PropTypes.object,
    preventTestConnection: PropTypes.bool,
    isEmptyConfiguration: PropTypes.bool,
    isGlobal: PropTypes.bool,
    formKey: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    projectKey: PropTypes.string,
    payloadProjectKey: PropTypes.string,
  };

  static defaultProps = {
    editAuthConfig: null,
    preventTestConnection: false,
    isEmptyConfiguration: false,
    isGlobal: false,
    formKey: INTEGRATION_FORM,
    payloadProjectKey: '',
    projectKey: '',
  };

  state = {
    connected: this.props.data.isNew || this.props.preventTestConnection,
    loading: !this.props.data.isNew && !this.props.preventTestConnection,
  };

  componentDidMount() {
    if (!this.state.connected) {
      this.testIntegrationConnection();
    }
  }

  testIntegrationConnection = () => {
    const {
      data: { id },
      projectKey,
      payloadProjectKey,
    } = this.props;

    this.setState({
      loading: true,
    });

    fetch(URLS.testIntegrationConnection(projectKey || payloadProjectKey, id))
      .then(() => {
        this.setState({
          connected: true,
          loading: false,
        });
      })
      .catch(({ message }) => {
        this.setState({
          connected: false,
          errorMessage: message,
          loading: false,
        });
      });
  };

  removeIntegration = () => {
    const {
      data: { id, integrationType },
      isGlobal,
      goToPreviousPage,
      tracking,
    } = this.props;

    tracking.trackEvent(PLUGINS_PAGE_EVENTS.clickDeleteBtnRemoveIntegration(integrationType.name));
    this.props.removeIntegrationAction(id, isGlobal, goToPreviousPage);
  };

  render() {
    const {
      intl: { formatMessage },
      data,
      onUpdate,
      formFieldsComponent,
      editAuthConfig,
      isEmptyConfiguration,
      formKey,
      isGlobal,
    } = this.props;
    const { loading, connected, errorMessage } = this.state;
    const pluginName = data.integrationType.name;

    return (
      <div className={cx('integration-settings')}>
        {loading ? (
          <SpinningPreloader />
        ) : (
          <Fragment>
            <ConnectionSection
              blocked={data.blocked}
              failedConnectionMessage={
                connected
                  ? null
                  : formatMessage(messages.failedConnectMessage, {
                      pluginName: PLUGIN_NAME_TITLES[pluginName] || pluginName,
                      error: errorMessage,
                    })
              }
              testConnection={this.testIntegrationConnection}
              onRemoveIntegration={this.removeIntegration}
              editAuthConfig={editAuthConfig}
              pluginName={this.props.data.integrationType.name}
              isGlobal={isGlobal}
            />
            <IntegrationForm
              form={formKey}
              data={data}
              connected={connected}
              pluginName={pluginName}
              isGlobal={isGlobal}
              onSubmit={onUpdate}
              formFieldsComponent={formFieldsComponent}
              isEmptyConfiguration={isEmptyConfiguration}
            />
          </Fragment>
        )}
      </div>
    );
  }
}
