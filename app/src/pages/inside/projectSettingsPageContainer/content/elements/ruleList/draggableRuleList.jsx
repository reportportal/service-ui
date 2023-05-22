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

import React, { Fragment, memo } from 'react';
import PropTypes from 'prop-types';
import { DraggableRuleItem } from './ruleItem';
import { ruleListDefaultProps, ruleListPropTypes } from './propTypes';

const DraggableRuleListComponent = ({
  items,
  actions,
  onToggle,
  disabled,
  ruleItemContent,
  handleRuleItemClick,
  onRuleNameClick,
  onRuleDrop,
  dragControlTooltipContent,
}) => {
  const onDrop = (fromIndex, toIndex) => {
    const updatedItems = [...items];
    updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, items[fromIndex]);

    onRuleDrop(updatedItems);
  };

  const Content = ruleItemContent;
  return (
    <Fragment>
      {items.map((item, index) => (
        <DraggableRuleItem
          key={item.id}
          item={{ ...item, index }}
          actions={actions}
          onToggle={onToggle}
          disabled={disabled}
          content={ruleItemContent && <Content item={item} />}
          onClick={handleRuleItemClick}
          onRuleNameClick={onRuleNameClick}
          onDrop={onDrop}
          dragControlTooltipContent={dragControlTooltipContent}
        />
      ))}
    </Fragment>
  );
};
DraggableRuleListComponent.propTypes = {
  ...ruleListPropTypes,
  onRuleDrop: PropTypes.func,
  dragControlTooltipContent: PropTypes.func,
};
DraggableRuleListComponent.defaultProps = {
  ...ruleListDefaultProps,
  onRuleDrop: () => {},
  dragControlTooltipContent: null,
};

export const DraggableRuleList = memo(DraggableRuleListComponent);
