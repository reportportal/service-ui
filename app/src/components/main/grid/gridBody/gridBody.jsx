import React from 'react';
import PropTypes from 'prop-types';
import { columnPropTypes } from '../propTypes';
import { GridRow } from './gridRow';
import { GroupedGridBody } from './groupedGridBody';

export const GridBody = ({
  columns,
  data,
  groupFunction,
  groupHeader,
  grouped,
  gridRowClassName,
  ...rest
}) =>
  grouped ? (
    <GroupedGridBody
      columns={columns}
      data={data}
      groupFunction={groupFunction}
      groupHeader={groupHeader}
      {...rest}
    />
  ) : (
    data.map((row, i) => (
      <GridRow
        key={row.id || i}
        columns={columns}
        value={row}
        gridRowClassName={gridRowClassName}
        {...rest}
      />
    ))
  );
GridBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
  data: PropTypes.array,
  groupFunction: PropTypes.func,
  groupHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  grouped: PropTypes.bool,
  gridRowClassName: PropTypes.string,
};
GridBody.defaultProps = {
  columns: [],
  data: [],
  groupFunction: () => {},
  groupHeader: null,
  grouped: false,
  gridRowClassName: '',
};
