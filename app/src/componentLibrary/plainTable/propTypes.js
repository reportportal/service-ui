/*
 * Copyright 2023 EPAM Systems
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
import {
  ALIGN_CENTER,
  ALIGN_END,
  ALIGN_JUSTIFY,
  ALIGN_LEFT,
  ALIGN_RIGHT,
  ALIGN_START,
} from './constants';

const alignValuesPropTypes = PropTypes.oneOf([
  ALIGN_LEFT,
  ALIGN_CENTER,
  ALIGN_RIGHT,
  ALIGN_START,
  ALIGN_END,
  ALIGN_JUSTIFY,
]);

export const columnPropTypes = {
  title: PropTypes.shape({
    full: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    short: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    align: alignValuesPropTypes,
  }),
  cellCustomProps: PropTypes.object,
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  align: alignValuesPropTypes,
  id: PropTypes.string.isRequired,
};
