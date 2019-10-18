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
import { VALUE_ID_KEY, VALUE_NAME_KEY } from './constants';

export const dynamicFieldShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  fieldType: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  definedValues: PropTypes.arrayOf(
    PropTypes.shape({
      valueId: PropTypes.string,
      valueName: PropTypes.string,
    }),
  ),
  required: PropTypes.bool,
  value: PropTypes.array,
  disabled: PropTypes.bool,
  defaultOptionValueKey: PropTypes.oneOf([VALUE_ID_KEY, VALUE_NAME_KEY]),
});
