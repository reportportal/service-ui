import PropTypes from 'prop-types';

export const defectTypeShape = PropTypes.shape({
  id: PropTypes.number,
  locator: PropTypes.string,
  typeRef: PropTypes.string,
  longName: PropTypes.string,
  shortName: PropTypes.string,
  color: PropTypes.string,
});
