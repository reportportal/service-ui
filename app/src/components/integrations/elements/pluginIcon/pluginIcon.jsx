/*
 * Copyright 2021 EPAM Systems
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

import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { COMMAND_GET_FILE } from 'controllers/plugins/uiExtensions/constants';
import { globalIntegrationsSelector } from 'controllers/plugins/selectors';
import { filterIntegrationsByName } from 'controllers/plugins/utils';
import { PLUGIN_DEFAULT_IMAGE, PLUGIN_IMAGES_MAP } from 'components/integrations/constants';
import { Image } from 'components/main/image';

export const PluginIcon = ({ pluginData, className, ...rest }) => {
  const { details, name } = pluginData;
  const isDynamicIconAvailable = details && details.binaryData && details.binaryData.icon;

  const calculateIconSrc = () => {
    if (isDynamicIconAvailable) {
      const projectId = useSelector(activeProjectSelector);
      const globalIntegrations = useSelector(globalIntegrationsSelector);
      const integration = filterIntegrationsByName(globalIntegrations, name)[0];
      if (!integration) {
        return null;
      }

      return URLS.projectIntegrationByIdCommand(projectId, integration.id, COMMAND_GET_FILE);
    }

    return PLUGIN_IMAGES_MAP[name] || PLUGIN_DEFAULT_IMAGE;
  };

  return (
    <div className={className}>
      <Image
        src={calculateIconSrc()}
        fallback={PLUGIN_DEFAULT_IMAGE}
        isStatic={!isDynamicIconAvailable}
        requestParams={{ method: 'PUT', data: { fileKey: 'icon' } }}
        preloaderColor="charcoal"
        className={className}
        {...rest}
      />
    </div>
  );
};

PluginIcon.propTypes = {
  pluginData: PropTypes.object,
  className: PropTypes.string,
};
PluginIcon.defaultProps = {
  pluginData: {},
  className: '',
};
