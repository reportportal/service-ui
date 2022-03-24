import React from 'react';
import { URLS } from 'common/urls';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { createImportProps } from 'controllers/plugins/uiExtensions/createImportProps';
import { extensionType } from './extensionTypes';
import { useFederatedComponent } from './hooks';

const DEFAULT_EXTENSION_FILE_NAME = 'remoteEntity.js';

// TODO: Create a special error boundary for extension components
function ExtensionLoader({ extension, ...componentProps }) {
  const { moduleName, scope, pluginName } = extension;
  // TODO: use public/private endpoint to get files based on extension preferences
  const url = URLS.pluginFile(pluginName, DEFAULT_EXTENSION_FILE_NAME);

  const { failed, Component } = useFederatedComponent(scope, moduleName, url);

  if (failed) {
    return <h2>Failed to load extension: {moduleName}</h2>;
  }

  // TODO: remove legacy extensions when all existing plugins will be migrated to the new engine
  const extensionImportProps = createImportProps(pluginName);

  return (
    <React.Suspense fallback={<SpinningPreloader />}>
      {Component ? (
        <Component
          {...extensionImportProps}
          {...componentProps}
          meta={{ requester: 'service-ui' }}
        />
      ) : null}
    </React.Suspense>
  );
}
ExtensionLoader.propTypes = {
  extension: extensionType,
};
ExtensionLoader.defaultProps = {
  extension: {},
};

export function ExtensionLoaderWrapper({ extension, ...componentProps }) {
  return extension.component ? (
    <extension.component {...componentProps} />
  ) : (
    <ExtensionLoader extension={extension} {...componentProps} />
  );
}
ExtensionLoaderWrapper.propTypes = {
  extension: extensionType,
};
ExtensionLoaderWrapper.defaultProps = {
  extension: {},
};
