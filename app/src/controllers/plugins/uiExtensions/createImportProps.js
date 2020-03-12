/*
 * Copyright 2020 EPAM Systems
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

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GhostButton } from 'components/buttons/ghostButton';
import { BigButton } from 'components/buttons/bigButton';
import { NavigationTabs } from 'components/main/navigationTabs';
import { NoItemMessage } from 'components/main/noItemMessage';
import { withModal } from 'controllers/modal';
import { fetch } from 'common/utils/fetch';
import { PLUGIN_UI_EXTENSION_ADMIN_PAGE, pluginRouteSelector } from 'controllers/pages';
import PlusIcon from 'common/img/plus-button-inline.svg';

export const createImportProps = () => ({
  lib: { React, useSelector, useDispatch },
  components: { GhostButton, BigButton, NavigationTabs, NoItemMessage },
  hocs: { withModal },
  constants: { PLUGIN_UI_EXTENSION_ADMIN_PAGE },
  selectors: { pluginRouteSelector },
  icons: { PlusIcon },
  utils: { fetch },
});
