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

// Item and launch names are plain text: build the tooltip from React elements, never from an HTML string.
const getTooltipContent = (testItem = {}) => {
  const { itemPaths = [], launchPathName = {} } = testItem.pathNames;

  return (
    <>
      <b>Launch:</b> {launchPathName.name} #{launchPathName.number}
      {itemPaths.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={index}>
          {' \n'}
          <b>Parent {index + 1}:</b> {item.name}
        </React.Fragment>
      ))}
    </>
  );
};

export const ItemPathTooltip = ({ testItem }) => (
  <TextTooltip tooltipContent={getTooltipContent(testItem)} preventParsing />
);
ItemPathTooltip.propTypes = {
  testItem: PropTypes.object,
};
ItemPathTooltip.defaultProps = {
  testItem: null,
};
