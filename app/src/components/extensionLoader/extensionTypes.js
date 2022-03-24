import PropTypes from 'prop-types';

// TODO: remove legacy extensions when all existing plugins will be migrated to the new engine
const oldExtensionType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  component: PropTypes.func.isRequired,
});

/* New plugins mechanism related code below */

const newExtensionType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  type: PropTypes.string.isRequired,
  moduleName: PropTypes.string,
  scope: PropTypes.string,
  pluginName: PropTypes.string.isRequired,
});

export const extensionType = PropTypes.oneOfType([oldExtensionType, newExtensionType]);
