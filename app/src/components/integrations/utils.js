import { INTEGRATIONS_SUPPORTS_MULTIPLE_INSTANCES, BUILTIN_PLUGINS } from './constants';

export const isIntegrationSupportsMultipleInstances = (instanceType) =>
  INTEGRATIONS_SUPPORTS_MULTIPLE_INSTANCES.indexOf(instanceType) !== -1;

export const isPluginBuiltin = (instanceType) => BUILTIN_PLUGINS.indexOf(instanceType) !== -1;
