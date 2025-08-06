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
import PropTypes from 'prop-types';
import { PLUGIN_TYPE_REMOTE } from 'controllers/plugins/uiExtensions/constants';
import { ErrorBoundary } from 'components/containers/errorBoundary';
import { ExtensionError } from './extensionError';
import { extensionType } from './extensionTypes';
import { FederatedExtensionLoader } from './federatedExtensionLoader';
import { RemoteExtensionLoader } from './remoteExtensionLoader';

function ExtensionLoader({ extension, withPreloader = false, ...componentProps }) {
  return extension.pluginType === PLUGIN_TYPE_REMOTE ? (
    <RemoteExtensionLoader extension={extension} />
  ) : (
    <FederatedExtensionLoader
      extension={extension}
      withPreloader={withPreloader}
      {...componentProps}
    />
  );
}
ExtensionLoader.propTypes = {
  extension: extensionType.isRequired,
  withPreloader: PropTypes.bool,
};

export function ExtensionLoaderWrapper({
  extension,
  withPreloader = false,
  silentOnError = true,
  ...componentProps
}) {
  return (
    <ErrorBoundary getFallback={silentOnError ? undefined : () => <ExtensionError />}>
      {/* TODO: remove legacy extensions when all existing plugins will be migrated to the new engine */}
      {extension.component ? (
        <extension.component {...componentProps} />
      ) : (
        <ExtensionLoader extension={extension} withPreloader={withPreloader} {...componentProps} />
      )}
    </ErrorBoundary>
  );
}
ExtensionLoaderWrapper.propTypes = {
  extension: extensionType.isRequired,
  withPreloader: PropTypes.bool,
  silentOnError: PropTypes.bool,
};
