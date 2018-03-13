import PropTypes from 'prop-types';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from './constants';

export const columnPropTypes = PropTypes.shape({
  title: PropTypes.node,
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  align: PropTypes.oneOf([ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT]),
  formatter: PropTypes.func,
});
