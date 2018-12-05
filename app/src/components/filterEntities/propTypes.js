import PropTypes from 'prop-types';

export const filterValueShape = PropTypes.shape({
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  condition: PropTypes.string,
  filteringField: PropTypes.string,
});

export const filterEntityShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  component: PropTypes.elementType,
  value: filterValueShape.isRequired,
  title: PropTypes.string.isRequired,
  validationFunc: PropTypes.func,
  active: PropTypes.bool.isRequired,
  removable: PropTypes.bool.isRequired,
  static: PropTypes.bool,
  meta: PropTypes.object,
});
