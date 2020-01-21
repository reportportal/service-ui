/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  groupHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  nestedStepHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
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
