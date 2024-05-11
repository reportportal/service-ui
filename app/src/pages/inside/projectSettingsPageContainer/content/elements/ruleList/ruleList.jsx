/*
 * Copyright 2022 EPAM Systems
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
import classNames from 'classnames/bind';
import { ruleListDefaultProps, ruleListPropTypes } from './propTypes';
import { RuleItem } from './ruleItem';
import { DraggableRuleList } from './draggableRuleList';
import styles from './ruleList.scss';

const cx = classNames.bind(styles);

const PlainRuleList = ({
  items,
  actions,
  onToggle,
  disabled,
  ruleItemContent,
  handleRuleItemClick,
  onRuleNameClick,
  className,
  ruleItemContentProps,
}) => {
  const Content = ruleItemContent;
  return (
    <Fragment>
      {items.map((item) => (
        <RuleItem
          key={item.id}
          item={item}
          actions={actions}
          onToggle={onToggle}
          disabled={disabled}
          content={
            ruleItemContent && <Content item={item} ruleItemContentProps={ruleItemContentProps} />
          }
          onClick={handleRuleItemClick}
          onRuleNameClick={onRuleNameClick}
          className={className}
        />
      ))}
    </Fragment>
  );
};
PlainRuleList.propTypes = ruleListPropTypes;
PlainRuleList.defaultProps = ruleListDefaultProps;

export const RuleList = ({ isDraggable, onRuleDrop, dataAutomationId, data, ...rest }) => {
  return (
    <div className={cx('container')} data-automation-id={dataAutomationId}>
      {isDraggable ? (
        <DraggableRuleList items={data} onRuleDrop={onRuleDrop} {...rest} />
      ) : (
        <PlainRuleList items={data} {...rest} />
      )}
    </div>
  );
};
RuleList.propTypes = {
  ...ruleListPropTypes,
  data: PropTypes.array,
  dataAutomationId: PropTypes.string,
  onRuleDrop: PropTypes.func,
  isDraggable: PropTypes.bool,
};
RuleList.defaultProps = {
  ...ruleListDefaultProps,
  dataAutomationId: '',
  onRuleDrop: () => {},
  isDraggable: false,
};
