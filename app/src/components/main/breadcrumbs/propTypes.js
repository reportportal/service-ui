import PropTypes from 'prop-types';

export const breadcrumbDescriptorShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  link: PropTypes.object,
  error: PropTypes.bool,
  listView: PropTypes.bool,
  active: PropTypes.bool,
});
