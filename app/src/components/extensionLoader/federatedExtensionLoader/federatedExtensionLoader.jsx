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
import { BubblesLoader } from '@reportportal/ui-kit';
import { createImportProps } from 'controllers/plugins/uiExtensions/createImportProps';
import { getExtensionUrl } from '../utils';
import { useFederatedComponent } from '../hooks';
import { extensionType } from '../extensionTypes';

export function FederatedExtensionLoader({ extension, withPreloader, ...componentProps }) {
  const { moduleName, scope, pluginName } = extension;
  const url = getExtensionUrl(extension);

  const { failed, Component } = useFederatedComponent(scope, moduleName, url);

  // TODO: replace with proper failed state
  if (failed) {
    return <h2>Failed to load extension: {moduleName}</h2>;
  }

  // TODO: Provide extensionImportProps via React Context
  const extensionImportProps = createImportProps(pluginName);

  return (
    <React.Suspense fallback={withPreloader ? <BubblesLoader /> : null}>
      {Component ? <Component {...extensionImportProps} {...componentProps} /> : null}
    </React.Suspense>
  );
}
FederatedExtensionLoader.propTypes = {
  extension: extensionType,
  withPreloader: PropTypes.bool,
};
FederatedExtensionLoader.defaultProps = {
  extension: {},
  withPreloader: false,
};
