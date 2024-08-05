/*
 * Copyright 2024 EPAM Systems
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
import { ICON_FILE_KEY } from 'controllers/plugins/uiExtensions/constants';
import { PLUGIN_DEFAULT_IMAGE, PLUGIN_IMAGES_MAP } from 'components/integrations/constants';
import { Image } from 'components/main/image';

export const PluginIcon = ({ pluginData, className, ...rest }) => {
  const { details, name } = pluginData;
  const isDynamicIconAvailable = details?.binaryData?.[ICON_FILE_KEY];

  const calculateIconUrl = () => {
    if (isDynamicIconAvailable) {
      return URLS.pluginPublicFile(name, details.binaryData[ICON_FILE_KEY]);
    }

    return PLUGIN_IMAGES_MAP[name] || PLUGIN_DEFAULT_IMAGE;
  };

  const url = calculateIconUrl();

  return (
    <div className={className}>
      <Image
        src={url}
        fallback={PLUGIN_DEFAULT_IMAGE}
        isStatic={!isDynamicIconAvailable}
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
