/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TextTooltip } from 'components/main/tooltips/textTooltip';

const getTooltipContent = (testItem = {}) => {
  const { itemPaths = [], launchPathName = {} } = testItem.pathNames;

  return itemPaths.reduce(
    (path, item, index) => `${path} \n<b>Parent ${index + 1}:</b> ${item.name}`,
    `<b>Launch:</b> ${launchPathName.name} ${launchPathName.number}`,
  );
};

export const ItemPathTooltip = ({ testItem }) => (
  <TextTooltip tooltipContent={getTooltipContent(testItem)} />
);
ItemPathTooltip.propTypes = {
  testItem: PropTypes.object,
};
ItemPathTooltip.defaultProps = {
  testItem: null,
};
