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

import React, { useState } from 'react';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { Toggle } from 'componentLibrary/toggle';
import { ruleItemPropTypes, ruleItemDefaultProps } from './propTypes';
import styles from './ruleItem.scss';

const cx = classNames.bind(styles);

export const RuleItem = ({
  item,
  actions,
  onToggle,
  disabled,
  content,
  onClick,
  onRuleNameClick,
}) => {
  const [shown, setShown] = useState(false);
  const { enabled, name } = item;
  const isRuleNameClickable = Boolean(onRuleNameClick);

  const onToggleActive = (val) => {
    onToggle(val, item);
  };

  const onClickHandler = () => {
    onClick(!shown);
    setShown(!shown);
  };

  const handleRuleNameClick = (event) => {
    event.stopPropagation();
    onRuleNameClick(item);
  };

  return (
    <div className={cx('container')} data-automation-id="listItem">
      <span className={cx('toggle')}>
        <Toggle
          value={enabled}
          onChange={(e) => onToggleActive(e.target.checked)}
          disabled={disabled}
          dataAutomationId="enabledToggle"
        />
      </span>
      <div className={cx('panel-wrapper')}>
        <div className={cx('panel')} onClick={onClickHandler}>
          <span className={cx('name-wrapper')} title={name}>
            {isRuleNameClickable ? (
              <i className={cx('name')} onClick={handleRuleNameClick}>
                {name}
              </i>
            ) : (
              <>{name}</>
            )}
          </span>
          {actions.length > 0 && !disabled && (
            <span className={cx('actions')}>
              {actions.map(({ icon, handler, dataAutomationId, customIcon: CustomIcon, id }) => {
                return (
                  <React.Fragment key={id || icon}>
                    {CustomIcon ? (
                      <CustomIcon item={item} />
                    ) : (
                      <i
                        className={cx('icon')}
                        onClick={(e) => {
                          e.stopPropagation();
                          handler(item);
                        }}
                        data-automation-id={dataAutomationId}
                      >
                        {Parser(icon)}
                      </i>
                    )}
                  </React.Fragment>
                );
              })}
            </span>
          )}
        </div>
        {shown && content}
      </div>
    </div>
  );
};
RuleItem.propTypes = ruleItemPropTypes;
RuleItem.defaultProps = ruleItemDefaultProps;
