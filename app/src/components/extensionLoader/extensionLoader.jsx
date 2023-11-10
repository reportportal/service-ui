import React from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary } from 'components/containers/errorBoundary';
import { ErrorMessage } from 'components/main/errorMessage';
import { BubblesPreloader } from 'components/preloaders/bubblesPreloader';
import { createImportProps } from 'controllers/plugins/uiExtensions/createImportProps';
import { extensionType } from './extensionTypes';
import { useFederatedComponent } from './hooks';
import { getExtensionUrl } from './utils';

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

export function ExtensionLoaderWrapper({
  extension,
  withPreloader,
  silentOnError,
  ...componentProps
}) {
  return (
    <ErrorBoundary
      getFallback={silentOnError ? undefined : (error) => <ErrorMessage error={error} />}
    >
      {extension.component ? (
        <extension.component {...componentProps} />
      ) : (
        <ExtensionLoader extension={extension} withPreloader={withPreloader} {...componentProps} />
      )}
    </ErrorBoundary>
  );
}
ExtensionLoaderWrapper.propTypes = {
  extension: extensionType,
  withPreloader: PropTypes.bool,
  silentOnError: PropTypes.bool,
};
ExtensionLoaderWrapper.defaultProps = {
  extension: {},
  withPreloader: false,
  silentOnError: true,
};
