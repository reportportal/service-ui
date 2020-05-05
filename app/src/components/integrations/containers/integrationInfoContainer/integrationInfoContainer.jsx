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
import { PLUGIN_IMAGES_MAP, PLUGIN_NAME_TITLES } from '../../constants';
import { PLUGIN_DESCRIPTIONS_MAP } from '../../messages';
import { InfoSection } from './infoSection';
import { InstancesSection } from './instancesSection';

const emptySelector = () => [];

@connect(
  (state, ownProps) => {
    const projectIntegrationSelector =
      namedProjectIntegrationsSelectorsMap[ownProps.integrationType.name] || emptySelector;
    const globalIntegrationSelector =
      namedGlobalIntegrationsSelectorsMap[ownProps.integrationType.name] || emptySelector;
    return {
      projectIntegrations: projectIntegrationSelector(state),
      globalIntegrations: globalIntegrationSelector(state),
    };
  },
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
      integrationType: { name, details = {}, type },
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
          image={PLUGIN_IMAGES_MAP[name]}
          description={PLUGIN_DESCRIPTIONS_MAP[name]}
          title={PLUGIN_NAME_TITLES[name]}
          version={details.version}
          data={integrationType}
          onToggleActive={onToggleActive}
          isGlobal={isGlobal}
        />
        <InstancesSection
          pluginDetails={details}
          globalIntegrations={globalIntegrations}
          projectIntegrations={projectIntegrations}
          onItemClick={onItemClick}
          removePluginSuccessCallback={removePluginSuccessCallback}
          pluginId={type}
          instanceType={name}
          isGlobal={isGlobal}
          title={PLUGIN_NAME_TITLES[name]}
        />
      </Fragment>
    );
  }
}
