import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { COMMAND_GET_FILE } from 'controllers/plugins/uiExtensions/constants';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { createImportProps } from 'controllers/plugins/uiExtensions/createImportProps';
import { extensionType, uiExtensionType } from './extensionTypes';

const EXTENSION_PROPS = 'extensionProps';

const useDynamicScript = (extension, loaded) => {
  const { pluginName, fileKey } = extension;
  const activeProject = useSelector(activeProjectSelector);
  const [ready, setReady] = React.useState(loaded);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!fileKey || loaded) {
      return;
    }

    fetch(URLS.pluginCommandCommon(activeProject, pluginName, COMMAND_GET_FILE), {
      method: 'PUT',
      data: { fileKey },
    })
      .then((fileData) => {
        const element = document.createElement('script');

        element.type = 'text/javascript';
        element.async = true;
        element.innerText = fileData;

        document.head.appendChild(element);

        setReady(true);
        setFailed(false);
      })
      .catch((e) => {
        setReady(false);
        setFailed(true);
        console.error(e);
      });
  }, [fileKey, loaded]);

  return {
    ready,
    failed,
  };
};

// TODO: Create a special error boundary for extension components
// TODO: Remove components from global scope when their sharing will be implemented based on WMF
function ExtensionLoader({ extension, ...componentProps }) {
  const { library, fileKey, componentName, pluginName } = extension;
  const loaded = !!(window[library] && window[library][componentName]);
  const { ready, failed } = useDynamicScript(extension, loaded);

  if (!ready) {
    return <SpinningPreloader />;
  }

  if (failed) {
    return <h2>Failed to load extension: {fileKey}</h2>;
  }

  const Component = window[library][componentName];
  let extensionImportProps;
  if (window[library][EXTENSION_PROPS]) {
    extensionImportProps = window[library][EXTENSION_PROPS];
  } else {
    extensionImportProps = createImportProps(pluginName);
    window[library][EXTENSION_PROPS] = extensionImportProps;
  }

  return <Component {...extensionImportProps} {...componentProps} meta={{ requester: 'root' }} />;
}
ExtensionLoader.propTypes = {
  extension: PropTypes.oneOfType([extensionType, uiExtensionType]),
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
  extension: PropTypes.oneOfType([extensionType, uiExtensionType]),
};
ExtensionLoaderWrapper.defaultProps = {
  extension: {},
};
