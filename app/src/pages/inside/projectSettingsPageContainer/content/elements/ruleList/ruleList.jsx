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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { RuleItem } from './ruleItem';
import styles from './ruleList.scss';

const cx = classNames.bind(styles);

export const RuleList = ({
  data,
  actions,
  onToggle,
  disabled,
  ruleItemContent,
  handleRuleItemClick,
}) => {
  const Content = ruleItemContent;
  return (
    <div className={cx('container')}>
      {data.map((item) => (
        <RuleItem
          key={item.id}
          item={item}
          actions={actions}
          onToggle={onToggle}
          disabled={disabled}
          content={ruleItemContent && <Content item={item} />}
          onClick={handleRuleItemClick}
        />
      ))}
    </div>
  );
};
RuleList.propTypes = {
  data: PropTypes.array.isRequired,
  actions: PropTypes.array,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  ruleItemContent: PropTypes.elementType,
  handleRuleItemClick: PropTypes.func,
};
RuleList.defaultProps = {
  actions: [],
  onToggle: () => {},
  disabled: true,
  ruleItemContent: null,
  handleRuleItemClick: () => {},
};
