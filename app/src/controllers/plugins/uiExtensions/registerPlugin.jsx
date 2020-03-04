import React from 'react';
import { useSelector } from 'react-redux';
import { BigButton } from 'components/buttons/bigButton';
import { GhostButton } from 'components/buttons/ghostButton';
import { withModal } from 'controllers/modal';
import { uiExtensionMap } from './uiExtensionStorage';

window.RP = {};

const createImportProps = () => ({ React, BigButton, GhostButton, useSelector, withModal });

// TODO store will be used later to add new routes
// eslint-disable-next-line no-unused-vars
const createPluginRegistrationFunction = (store) => (plugin) => {
  const { name, extensions } = plugin;
  const wrappedExtensions = extensions.map((extension, i) => ({
    name: `${plugin.name}__${i}`,
    ...extension,
    component: <extension.component {...createImportProps()} />,
  }));
  uiExtensionMap.set(name, wrappedExtensions);
};

export const initPluginRegistration = (store) => {
  const registerPlugin = createPluginRegistrationFunction(store);
  window.RP = {
    registerPlugin,
  };
};
