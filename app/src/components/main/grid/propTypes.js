import PropTypes from 'prop-types';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from './constants';

export const columnPropTypes = {
  title: PropTypes.shape({
    full: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    short: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  }),
  customProps: PropTypes.object,
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  align: PropTypes.oneOf([ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT]),
  formatter: PropTypes.func,
  sortable: PropTypes.bool,
  id: PropTypes.string,
};
