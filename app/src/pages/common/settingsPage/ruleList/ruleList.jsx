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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { ListItem } from './listItem';

export const RuleList = ({
  data,
  readOnly,
  onToggle,
  onDelete,
  onEdit,
  onClone,
  getPanelTitle,
  getListItemContentData,
  isCloned,
  messages,
}) => (
  <Fragment>
    {data.map((item, index) => (
      <ListItem
        key={`index_${index}`} // eslint-disable-line react/no-array-index-key
        id={index}
        item={item}
        readOnly={readOnly}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        onClone={onClone}
        getPanelTitle={getPanelTitle}
        getListItemContentData={getListItemContentData}
        isCloned={isCloned}
        messages={messages}
      />
    ))}
  </Fragment>
);

RuleList.propTypes = {
  data: PropTypes.array,
  readOnly: PropTypes.bool,
  onToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onClone: PropTypes.func,
  getPanelTitle: PropTypes.func,
  getListItemContentData: PropTypes.func,
  isCloned: PropTypes.bool,
  messages: PropTypes.object,
};

RuleList.defaultProps = {
  data: [],
  readOnly: false,
  onToggle: () => {},
  onDelete: () => {},
  onEdit: () => {},
  onClone: () => {},
  getPanelTitle: () => {},
  getListItemContentData: () => {},
  isCloned: false,
  messages: {},
};
