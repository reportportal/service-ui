import PropTypes from 'prop-types';
import { GridRow } from './gridRow';
import { columnPropTypes } from '../propTypes';
import { NestedGridRow } from './nestedGridRow';

export const NestedGridBody = ({ data, ...rest }) =>
  data.map(
    (nodeData) =>
      'hasContent' in nodeData ? (
        <NestedGridRow data={nodeData} {...rest} key={nodeData.id} />
      ) : (
        <GridRow value={nodeData} {...rest} key={nodeData.id} />
      ),
  );

NestedGridBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
  data: PropTypes.array,
  nestedStepHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  grouped: PropTypes.bool,
};
NestedGridBody.defaultProps = {
  columns: [],
  data: [],
  nestedStepHeader: null,
  grouped: false,
};
