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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import PropTypes from 'prop-types';
import {
  PLUGIN_TYPE_EXTENSION,
  PLUGIN_TYPE_REMOTE,
} from 'controllers/plugins/uiExtensions/constants';
import { PLUGIN_ICON_TYPES } from 'components/integrations/constants';

const embeddedExtensionType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  // TODO: describe this field more specifically
  type: PropTypes.string.isRequired,
  moduleName: PropTypes.string,
  scope: PropTypes.string,
});

export const remoteExtensionIconType = PropTypes.shape({
  type: PropTypes.oneOf([PLUGIN_ICON_TYPES.SVG, PLUGIN_ICON_TYPES.BASE_64, PLUGIN_ICON_TYPES.URL])
    .isRequired,
  content: PropTypes.string.isRequired,
});

const remoteExtensionType = PropTypes.shape({
  slug: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  icon: remoteExtensionIconType.isRequired,
  url: PropTypes.string.isRequired,
});

export const extensionType = PropTypes.shape({
  name: PropTypes.string,
  pluginName: PropTypes.string.isRequired,
  pluginType: PropTypes.oneOf([PLUGIN_TYPE_REMOTE, PLUGIN_TYPE_EXTENSION]),
  // TODO: describe this field more specifically
  extensionPoint: PropTypes.string.isRequired,
  payload: PropTypes.oneOfType([embeddedExtensionType, remoteExtensionType]).isRequired,
  url: PropTypes.string, // base extension url, if exists
});
