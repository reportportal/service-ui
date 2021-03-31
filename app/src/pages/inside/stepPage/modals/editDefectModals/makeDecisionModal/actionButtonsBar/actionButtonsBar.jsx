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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import AttentionIcon from 'common/img/attention-inline.svg';
import { ActionButton } from './actionButton';
import styles from './actionButtonsBar.scss';

const cx = classNames.bind(styles);

export const ActionButtonsBar = ({ actionItems }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      <div className={cx('buttons-bar')}>
        {actionItems.map(({ icon, label, hint, id, onClick, disabled, isSelected }) => {
          selectedItem === id && !isSelected && setSelectedItem(null);
          const handleClick = () => {
            onClick && onClick();
            setSelectedItem(selectedItem === id && isSelected ? null : id);
          };

          return (
            <ActionButton
              icon={icon}
              label={label}
              hint={hint}
              isSelected={selectedItem === id}
              handleClick={handleClick}
              disabled={disabled}
              key={id}
            />
          );
        })}
      </div>
      {selectedItem !== null && (
        <div className={cx('note')}>
          {Parser(AttentionIcon)}
          {actionItems.find(({ id }) => id === selectedItem).noteMsg}
        </div>
      )}
    </>
  );
};
ActionButtonsBar.propTypes = {
  actionItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string,
      hint: PropTypes.string,
      noteMsg: PropTypes.string,
      icon: PropTypes.any,
      disabled: PropTypes.bool,
      onClick: PropTypes.func,
      isSelected: PropTypes.bool,
    }),
  ),
};
ActionButtonsBar.defaulProps = {
  label: '',
  hint: '',
  noteMsg: '',
  icon: '',
  disabled: false,
  onClick: () => {},
  isSelected: false,
};
