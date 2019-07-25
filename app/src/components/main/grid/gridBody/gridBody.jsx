import React from 'react';
import PropTypes from 'prop-types';
import { columnPropTypes } from '../propTypes';
import { GridRow } from './gridRow';
import { GroupedGridBody } from './groupedGridBody';
import { NestedGridBody } from './nestedGridBody';

export const GridBody = ({
  columns,
  data,
  groupFunction,
  groupHeader,
  grouped,
  gridRowClassName,
  nestedStepHeader,
  nestedView,
  ...rest
}) => {
  if (nestedView) {
    return (
      <NestedGridBody columns={columns} data={data} nestedStepHeader={nestedStepHeader} {...rest} />
    );
  }

  if (grouped) {
    return (
      <GroupedGridBody
        columns={columns}
        data={data}
        groupFunction={groupFunction}
        groupHeader={groupHeader}
        {...rest}
      />
    );
  }

  return data.map((row, i) => (
    <GridRow
      key={row.id || i}
      columns={columns}
      value={row}
      gridRowClassName={gridRowClassName}
      {...rest}
    />
  ));
};

GridBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
  data: PropTypes.array,
  groupFunction: PropTypes.func,
  groupHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  nestedStepHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  grouped: PropTypes.bool,
  gridRowClassName: PropTypes.string,
  nestedView: PropTypes.bool,
};
GridBody.defaultProps = {
  columns: [],
  data: [],
  groupFunction: () => {},
  groupHeader: null,
  nestedStepHeader: null,
  grouped: false,
  gridRowClassName: '',
  nestedView: false,
};
