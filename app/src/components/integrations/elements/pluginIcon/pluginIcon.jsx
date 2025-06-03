/*
 * Copyright 2025 EPAM Systems
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
import PropTypes from 'prop-types';
import { URLS } from 'common/urls';
import { ICON_FILE_KEY, PLUGIN_TYPE_REMOTE } from 'controllers/plugins/uiExtensions/constants';
import { PLUGIN_DEFAULT_IMAGE, PLUGIN_IMAGES_MAP } from 'components/integrations/constants';
import { Image } from 'components/main/image';
import { RemotePluginIcon } from './remotePluginIcon';

export const PluginIcon = ({ pluginData, className, ...rest }) => {
  const { details, name, pluginType } = pluginData;
  const isDynamicIconAvailable = details?.binaryData?.[ICON_FILE_KEY];

  const calculateIconUrl = () => {
    if (isDynamicIconAvailable) {
      return URLS.pluginPublicFile(name, details.binaryData[ICON_FILE_KEY]);
    }

    return PLUGIN_IMAGES_MAP[name] || PLUGIN_DEFAULT_IMAGE;
  };

  return (
    <div className={className}>
      {pluginType === PLUGIN_TYPE_REMOTE ? (
        <RemotePluginIcon icon={details.icon} className={className} {...rest} />
      ) : (
        <Image
          src={calculateIconUrl()}
          fallback={PLUGIN_DEFAULT_IMAGE}
          isStatic={!isDynamicIconAvailable}
          preloaderColor="charcoal"
          className={className}
          {...rest}
        />
      )}
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
