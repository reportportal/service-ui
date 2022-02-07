import PropTypes from 'prop-types';

export const uiExtensionType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  component: PropTypes.func.isRequired,
});

/* New plugins mechanism related code below */

export const extensionType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  pluginName: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  fileKey: PropTypes.string,
  library: PropTypes.string,
  componentName: PropTypes.string,
});
