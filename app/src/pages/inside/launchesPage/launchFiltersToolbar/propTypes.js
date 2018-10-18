import PropTypes from 'prop-types';

export const filterShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  share: PropTypes.bool,
});
