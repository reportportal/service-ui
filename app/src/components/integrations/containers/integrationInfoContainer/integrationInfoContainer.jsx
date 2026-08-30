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
import Parser from 'html-react-parser';
import {
  namedProjectIntegrationsSelector,
  namedGlobalIntegrationsSelector,
} from 'controllers/plugins';
import { PLUGIN_DESCRIPTIONS_MAP } from '../../messages';
import { InfoSection } from './infoSection';
import { InstancesSection } from './instancesSection';

@connect((state, ownProps) => {
  const projectIntegrations =
    namedProjectIntegrationsSelector(state)[ownProps.integrationType.name] || [];
  const globalIntegrations =
    namedGlobalIntegrationsSelector(state)[ownProps.integrationType.name] || [];
  return {
    projectIntegrations,
    globalIntegrations,
  };
})
export class IntegrationInfoContainer extends Component {
  static propTypes = {
    onItemClick: PropTypes.func.isRequired,
    integrationType: PropTypes.object.isRequired,
    showToggleConfirmationModal: PropTypes.func.isRequired,
    projectIntegrations: PropTypes.array.isRequired,
    globalIntegrations: PropTypes.array.isRequired,
    onToggleActive: PropTypes.func,
    removePluginSuccessCallback: PropTypes.func,
    isGlobal: PropTypes.bool,
    events: PropTypes.object,
    /** Rendered between the plugin header and its integrations — see the plugins page. */
    afterInfoSection: PropTypes.node,
    /** Overrides the heading, for a caller that knows a better name than the local one. */
    title: PropTypes.string,
  };

  static defaultProps = {
    onToggleActive: () => {},
    removePluginSuccessCallback: () => {},
    isGlobal: false,
    events: {},
    afterInfoSection: null,
    title: null,
  };

  render() {
    const {
      integrationType: { name, details = {}, type, pluginType },
      integrationType,
      projectIntegrations,
      globalIntegrations,
      onItemClick,
      removePluginSuccessCallback,
      onToggleActive,
      isGlobal,
      showToggleConfirmationModal,
      events,
      afterInfoSection,
      title,
    } = this.props;
    const pluginTitle = title || details.name || name;

    return (
      <Fragment>
        <InfoSection
          description={
            PLUGIN_DESCRIPTIONS_MAP[name] || (details.description && Parser(details.description))
          }
          title={pluginTitle}
          data={integrationType}
          onToggleActive={onToggleActive}
          showToggleConfirmationModal={showToggleConfirmationModal}
          isGlobal={isGlobal}
          pluginDetails={details}
        />
        {afterInfoSection}
        <InstancesSection
          pluginDetails={details}
          globalIntegrations={globalIntegrations}
          projectIntegrations={projectIntegrations}
          onItemClick={onItemClick}
          removePluginSuccessCallback={removePluginSuccessCallback}
          pluginId={type}
          instanceType={name}
          pluginType={pluginType}
          isGlobal={isGlobal}
          title={pluginTitle}
          events={events}
        />
      </Fragment>
    );
  }
}
