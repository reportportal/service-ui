/*
 * Copyright 2024 EPAM Systems
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
  FIELD_TYPE_MULTILINE_TEXT,
  FIELD_TYPE_TEXT,
} from 'pages/inside/projectSettingsPageContainer/content/notifications/constants';

export const ruleField = PropTypes.shape({
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  type: PropTypes.oneOf([FIELD_TYPE_TEXT, FIELD_TYPE_MULTILINE_TEXT]),
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  validation: PropTypes.shape({
    type: PropTypes.string,
    errorMessage: PropTypes.string,
  }),
});
