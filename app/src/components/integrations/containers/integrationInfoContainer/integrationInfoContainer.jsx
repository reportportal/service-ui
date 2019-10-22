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
import { connect } from 'react-redux';
import { showDefaultErrorNotification } from 'controllers/notification';
import {
  namedProjectIntegrationsSelectorsMap,
  namedGlobalIntegrationsSelectorsMap,
} from 'controllers/plugins';
import { INTEGRATIONS_IMAGES_MAP, INTEGRATION_NAMES_TITLES } from '../../constants';
import { INTEGRATIONS_DESCRIPTIONS_MAP } from '../../messages';
import { InfoSection } from './infoSection';
import { InstancesSection } from './instancesSection';

@connect(
  (state, ownProps) => ({
    projectIntegrations: namedProjectIntegrationsSelectorsMap[ownProps.integrationType.name](state),
    globalIntegrations: namedGlobalIntegrationsSelectorsMap[ownProps.integrationType.name](state),
  }),
  {
    showDefaultErrorNotification,
  },
)
export class IntegrationInfoContainer extends Component {
  static propTypes = {
    onItemClick: PropTypes.func.isRequired,
    integrationType: PropTypes.object.isRequired,
    projectIntegrations: PropTypes.array.isRequired,
    globalIntegrations: PropTypes.array.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    onToggleActive: PropTypes.func,
    removePluginSuccessCallback: PropTypes.func,
    isGlobal: PropTypes.bool,
  };

  static defaultProps = {
    onToggleActive: () => {},
    removePluginSuccessCallback: () => {},
    isGlobal: false,
  };

  render() {
    const {
      integrationType: { name, details: { version } = {}, type },
      integrationType,
      projectIntegrations,
      globalIntegrations,
      onItemClick,
      removePluginSuccessCallback,
      onToggleActive,
      isGlobal,
    } = this.props;

    return (
      <Fragment>
        <InfoSection
          image={INTEGRATIONS_IMAGES_MAP[name]}
          description={INTEGRATIONS_DESCRIPTIONS_MAP[name]}
          title={INTEGRATION_NAMES_TITLES[name]}
          version={version}
          data={integrationType}
          onToggleActive={onToggleActive}
          isGlobal={isGlobal}
        />
        <InstancesSection
          globalIntegrations={globalIntegrations}
          projectIntegrations={projectIntegrations}
          onItemClick={onItemClick}
          removePluginSuccessCallback={removePluginSuccessCallback}
          pluginId={type}
          instanceType={name}
          isGlobal={isGlobal}
          title={INTEGRATION_NAMES_TITLES[name]}
        />
      </Fragment>
    );
  }
}
