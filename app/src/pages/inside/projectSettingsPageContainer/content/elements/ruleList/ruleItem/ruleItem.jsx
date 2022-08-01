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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { Toggle } from 'componentLibrary/toggle';
import styles from './ruleItem.scss';

const cx = classNames.bind(styles);

export const RuleItem = ({ item, actions, onToggle, disabled, content, onClick }) => {
  const [shown, setShown] = useState(false);
  const { enabled, name } = item;
  const onToggleActive = (val) => {
    onToggle(val, item);
  };

  const onClickHandler = () => {
    onClick(!shown);
    setShown(!shown);
  };

  return (
    <div className={cx('container')}>
      <span className={cx('toggle')}>
        <Toggle
          value={enabled}
          onChange={(e) => onToggleActive(e.target.checked)}
          disabled={disabled}
        />
      </span>
      <div className={cx('panel-wrapper')}>
        <div className={cx('panel')} onClick={() => setShown(!shown)}>
          <span className={cx('name')} title={name}>
            {name}
          </span>
          {actions.length > 0 && !disabled && (
            <span className={cx('actions')}>
              {actions.map(({ icon, handler }) => (
                <i
                  className={cx('icon')}
                  onClick={(e) => {
                    e.stopPropagation();
                    handler(item);
                  }}
                  key={icon}
                >
                  {Parser(icon)}
                </i>
              ))}
            </span>
          )}
        </div>
        {shown && content}
      </div>
    </div>
  );
};
RuleItem.propTypes = {
  item: PropTypes.shape({ enabled: PropTypes.bool, name: PropTypes.string.isRequired }),
  actions: PropTypes.array,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  content: PropTypes.node,
  onClick: PropTypes.func,
};
RuleItem.defaultProps = {
  actions: [],
  onToggle: () => {},
  disabled: false,
  content: null,
  onClick: () => {},
};
