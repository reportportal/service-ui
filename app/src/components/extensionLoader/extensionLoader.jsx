import React from 'react';
import PropTypes from 'prop-types';
import { BubblesPreloader } from 'components/preloaders/bubblesPreloader';
import { createImportProps } from 'controllers/plugins/uiExtensions/createImportProps';
import { extensionType } from './extensionTypes';
import { useFederatedComponent } from './hooks';
import { getExtensionUrl } from './utils';

// TODO: Create a special error boundary for extension components
function ExtensionLoader({ extension, withPreloader, ...componentProps }) {
  const { moduleName, scope, pluginName } = extension;
  const url = getExtensionUrl(extension);

  const { failed, Component } = useFederatedComponent(scope, moduleName, url);

  if (failed) {
    return <h2>Failed to load extension: {moduleName}</h2>;
  }

  // TODO: remove legacy extensions when all existing plugins will be migrated to the new engine
  const extensionImportProps = createImportProps(pluginName);

  return (
    <React.Suspense fallback={withPreloader ? <BubblesPreloader /> : null}>
      {Component ? <Component {...extensionImportProps} {...componentProps} /> : null}
    </React.Suspense>
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

export function ExtensionLoaderWrapper({ extension, withPreloader, ...componentProps }) {
  return extension.component ? (
    <extension.component {...componentProps} />
  ) : (
    <ExtensionLoader extension={extension} withPreloader={withPreloader} {...componentProps} />
  );
}
ExtensionLoaderWrapper.propTypes = {
  extension: extensionType,
  withPreloader: PropTypes.bool,
};
ExtensionLoaderWrapper.defaultProps = {
  extension: {},
  withPreloader: false,
};
