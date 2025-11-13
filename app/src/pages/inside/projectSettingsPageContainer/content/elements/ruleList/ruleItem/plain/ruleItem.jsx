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
import { Toggle } from '@reportportal/ui-kit';
import PropTypes from 'prop-types';
import { ENTER_KEY_CODE, SPACE_KEY_CODE } from 'common/constants/keyCodes';
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
  isPreview,
  className,
  itemClassNames = {},
}) => {
  const [shown, setShown] = useState(false);
  const { enabled, name, title } = item;
  const isRuleNameClickable = Boolean(onRuleNameClick);

  const onToggleActive = (val) => {
    onToggle(val, item);
  };

  if (isPreview && shown) {
    setShown(false);
  }

  const onClickHandler = () => {
    onClick(!shown);
    setShown(!shown);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === ENTER_KEY_CODE || e.keyCode === SPACE_KEY_CODE) {
      e.preventDefault();
      onClickHandler();
    }
  };

  const handleRuleNameClick = (event) => {
    event.stopPropagation();
    onRuleNameClick(item);
  };

  const itemTitle = title || (typeof name === 'string' ? name : '');
  return (
    <div
      className={cx('container', { 'preview-container': isPreview }, className)}
      data-automation-id="listItem"
    >
      {!isPreview && (
        <span className={cx('toggle', itemClassNames.toggle)}>
          <Toggle
            value={enabled}
            onChange={(e) => onToggleActive(e.target.checked)}
            disabled={disabled}
          />
        </span>
      )}
      <div
        className={cx('panel-wrapper', itemClassNames.panelWrapper, {
          'preview-wrapper': isPreview,
          [itemClassNames.panelPreviewWrapper]: isPreview,
        })}
      >
        <div
          className={cx('panel', itemClassNames.panel)}
          onClick={onClickHandler}
          tabIndex={0}
          role="button"
          onKeyDown={handleKeyDown}
        >
          <span className={cx('name-wrapper', itemClassNames.nameWrapper)} title={itemTitle}>
            {isRuleNameClickable && !disabled ? (
              <i
                className={cx('name', itemClassNames.name)}
                onClick={handleRuleNameClick}
                tabIndex={0}
                role="button"
                aria-label={itemTitle}
                onKeyDown={handleKeyDown}
              >
                {name}
              </i>
            ) : (
              <>{name}</>
            )}
          </span>
          {actions.length > 0 && !disabled && !isPreview && (
            <span className={cx('actions', itemClassNames.actions)}>
              {actions.map(({ icon, handler, dataAutomationId, customIcon: CustomIcon, id }) => {
                return (
                  <React.Fragment key={id || icon}>
                    {CustomIcon ? (
                      <CustomIcon item={item} />
                    ) : (
                      <i
                        className={cx('icon', itemClassNames.icon)}
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

RuleItem.propTypes = {
  ...ruleItemPropTypes,
  isPreview: PropTypes.bool,
  className: PropTypes.string,
  itemClassNames: PropTypes.object,
};
RuleItem.defaultProps = {
  ...ruleItemDefaultProps,
  isPreview: false,
  className: '',
  itemClassNames: {},
};
