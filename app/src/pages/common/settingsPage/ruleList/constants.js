/*
 * Copyright 2020 EPAM Systems
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

export const ruleListItemPropTypes = {
  readOnly: PropTypes.bool,
  onToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onClone: PropTypes.func,
  onMove: PropTypes.func,
  getPanelTitle: PropTypes.func,
  getListItemContentData: PropTypes.func,
  isCloned: PropTypes.bool,
  isMovable: PropTypes.bool,
};

export const ruleListItemDefaultProps = {
  readOnly: false,
  onToggle: () => {},
  onDelete: () => {},
  onEdit: () => {},
  onClone: () => {},
  onMove: () => {},
  getPanelTitle: (name) => name,
  getListItemContentData: () => {},
  isCloned: false,
  isMovable: false,
};
