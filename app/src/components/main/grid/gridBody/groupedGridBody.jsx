import PropTypes from 'prop-types';
import { GridRow } from './gridRow';
import { columnPropTypes } from '../propTypes';

export const GroupedGridBody = ({ data, groupFunction, groupHeader: GroupHeader, ...rest }) => {
  const groupedData = groupFunction(data) || [];
  return Object.keys(groupedData).reduce(
    (rows, groupId) => [
      ...rows,
      <GroupHeader key={groupId} groupId={groupId} data={groupedData[groupId]} />,
      ...groupedData[groupId].map((row, i) => <GridRow key={row.id || i} value={row} {...rest} />),
    ],
    [],
  );
};
GroupedGridBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
  data: PropTypes.array,
  groupFunction: PropTypes.func,
  groupHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  grouped: PropTypes.bool,
};
GroupedGridBody.defaultProps = {
  columns: [],
  data: [],
  groupFunction: () => {},
  groupHeader: null,
  grouped: false,
};
