/*
 * Copyright 2021 EPAM Systems
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
import { useSelector } from 'react-redux';
import { getLogItemLinkSelector } from 'controllers/testItem/selectors';
import { StackTrace } from 'pages/inside/common/stackTrace';
import { ItemHeader } from '../itemHeader';

export const LogItem = ({ item, showErrorLogs, selectedItem, setSelectedItem }) => {
  const getLogItemLink = useSelector(getLogItemLinkSelector);
  const link = getLogItemLink(item);

  return (
    <>
      <ItemHeader
        item={item}
        selectItem={setSelectedItem}
        isSelected={selectedItem === item.id}
        nameLink={link}
      />
      {showErrorLogs && <StackTrace logItem={item} alternateDesign transparentBackground />}
    </>
  );
};
LogItem.propTypes = {
  item: PropTypes.object.isRequired,
  showErrorLogs: PropTypes.bool,
  selectedItem: PropTypes.number,
  setSelectedItem: PropTypes.func,
};
LogItem.defaultProps = {
  showErrorLogs: false,
  selectedItem: null,
  setSelectedItem: () => {},
};
