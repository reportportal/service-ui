import { INTEGRATIONS_SUPPORTS_MULTIPLE_INSTANCES } from './constants';

export const isIntegrationSupportsMultipleInstances = (instanceType) =>
  INTEGRATIONS_SUPPORTS_MULTIPLE_INSTANCES.indexOf(instanceType) !== -1;
