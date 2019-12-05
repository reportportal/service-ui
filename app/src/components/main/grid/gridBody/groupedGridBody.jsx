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
  groupHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  grouped: PropTypes.bool,
};
GroupedGridBody.defaultProps = {
  columns: [],
  data: [],
  groupFunction: () => {},
  groupHeader: null,
  grouped: false,
};
