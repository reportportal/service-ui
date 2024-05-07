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
import { ErrorBoundary } from 'components/containers/errorBoundary';
import { ExtensionError } from './extensionError';
import { extensionType } from './extensionTypes';
import { FederatedExtensionLoader } from './federatedExtensionLoader';
import { StandaloneExtensionLoader } from './standaloneExtensionLoader';

function ExtensionLoader({ extension, withPreloader, ...componentProps }) {
  return extension.pluginType === 'remote' ? (
    <StandaloneExtensionLoader extension={extension} />
  ) : (
    <FederatedExtensionLoader
      extension={extension}
      withPreloader={withPreloader}
      {...componentProps}
    />
  );
}
ExtensionLoader.propTypes = {
  extension: extensionType,
  withPreloader: PropTypes.bool,
};
ExtensionLoader.defaultProps = {
  extension: {},
  withPreloader: false,
};

export function ExtensionLoaderWrapper({
  extension,
  withPreloader,
  silentOnError,
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
ExtensionLoaderWrapper.defaultProps = {
  withPreloader: false,
  silentOnError: true,
};
