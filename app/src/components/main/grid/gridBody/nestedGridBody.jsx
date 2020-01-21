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
import { NestedGridRow } from './nestedGridRow';

export const NestedGridBody = ({ data, ...rest }) =>
  data.map((nodeData) =>
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
