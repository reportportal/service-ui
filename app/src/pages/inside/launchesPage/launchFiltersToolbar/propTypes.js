import PropTypes from 'prop-types';

export const filterShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  description: PropTypes.string,
});
