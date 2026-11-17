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

import React from 'react';
import { useSelector } from 'react-redux';
import { BubblesLoader } from '@reportportal/ui-kit';
import { uiExtensionProjectPagesSelector } from 'controllers/plugins/uiExtensions';
import { useActivePluginPageExtension } from 'controllers/plugins/uiExtensions/hooks';
import {
  pluginsLoadingSelector,
  extensionManifestsLoadPendingSelector,
} from 'controllers/plugins';
import { pluginPageSelector } from 'controllers/pages';
import { ExtensionLoader } from 'components/extensionLoader';
import { TestExecutionsPromoPage } from './testExecutionsPromoPage';

const TEST_EXECUTIONS_SLUG = 'testExecution';

export const ProjectUiExtensionPage = () => {
  const extension = useActivePluginPageExtension(uiExtensionProjectPagesSelector);
  const activePluginPage = useSelector(pluginPageSelector);
  const pluginsLoading = useSelector(pluginsLoadingSelector);
  const extensionsLoadPending = useSelector(extensionManifestsLoadPendingSelector);

  if (extension) {
    return <ExtensionLoader extension={extension} silentOnError={false} withPreloader />;
  }

  if (pluginsLoading || extensionsLoadPending) {
    return <BubblesLoader />;
  }

  if (activePluginPage === TEST_EXECUTIONS_SLUG) {
    return <TestExecutionsPromoPage />;
  }

  return <BubblesLoader />;
};
