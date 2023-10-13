import React from 'react';
import { loadComponent } from './loadComponent';

const useDynamicScript = (scope, url) => {
  const isDev = process.env.NODE_ENV === 'development';
  const loaded = isDev ? false : !!window[scope];
  const [ready, setReady] = React.useState(loaded);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (loaded) {
      return;
    }

    setReady(false);
    setFailed(false);

    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      setReady(true);
    };

    element.onerror = () => {
      setReady(false);
      setFailed(true);
    };

    document.head.appendChild(element);
  }, [url, loaded]);

  return {
    ready,
    failed,
  };
};

export const useFederatedComponent = (scope, moduleName, url) => {
  const key = `${scope}-${moduleName}`;
  const [Component, setComponent] = React.useState(null);
  const { ready, failed } = useDynamicScript(scope, url);
  React.useEffect(() => {
    if (Component) {
      setComponent(null);
    }
  }, [key]);

  React.useEffect(() => {
    if (ready && !Component) {
      const LoadedComponent = React.lazy(loadComponent(scope, moduleName));
      setComponent(LoadedComponent);
    }
  }, [Component, ready, key]);

  return { failed, Component };
};
