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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import PropTypes from 'prop-types';
import { PLUGIN_TYPE_REMOTE } from 'controllers/plugins/uiExtensions/constants';

const embeddedExtensionType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  // TODO: describe this field more specifically
  type: PropTypes.string.isRequired,
  moduleName: PropTypes.string,
  scope: PropTypes.string,
  pluginName: PropTypes.string.isRequired,
});

const standaloneExtensionType = PropTypes.shape({
  pluginName: PropTypes.string.isRequired,
  pluginType: PropTypes.oneOf([PLUGIN_TYPE_REMOTE]),
  // TODO: describe this field more specifically
  type: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  internalRoute: PropTypes.string,
  icon: PropTypes.shape({
    url: PropTypes.string,
    svg: PropTypes.string,
  }),
});

export const extensionType = PropTypes.oneOfType([embeddedExtensionType, standaloneExtensionType]);
