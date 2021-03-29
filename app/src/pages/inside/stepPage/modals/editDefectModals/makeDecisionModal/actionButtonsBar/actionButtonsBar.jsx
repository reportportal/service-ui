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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import AttentionIcon from 'common/img/attention-inline.svg';
import { ActionButton } from './actionButton';
import styles from './actionButtonsBar.scss';

const cx = classNames.bind(styles);

export const ActionButtonsBar = ({ actionButtonItems }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [noteMsg, setNoteMsg] = useState(null);

  useEffect(() => {
    if (selectedItem !== null) {
      const text = actionButtonItems.find((item) => item.id === selectedItem).noteMsg;
      setNoteMsg(text);
    } else {
      setNoteMsg(null);
    }
  }, [selectedItem]);

  return (
    <>
      <div className={cx('buttons-bar')}>
        {actionButtonItems.map(({ icon, btnLabel, btnHint, id, onClick, disabled }) => {
          const handleClick = () => {
            onClick && onClick();
            selectedItem === id ? setSelectedItem(null) : setSelectedItem(id);
          };
          return (
            <ActionButton
              icon={icon}
              btnLabel={btnLabel}
              btnHint={btnHint}
              isSelected={selectedItem === id}
              handleClick={handleClick}
              disabled={disabled}
              key={id}
            />
          );
        })}
      </div>
      {noteMsg && (
        <div className={cx('note')}>
          {Parser(AttentionIcon)}
          {noteMsg}
        </div>
      )}
    </>
  );
};
ActionButtonsBar.propTypes = {
  actionButtonItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      btnLabel: PropTypes.string,
      btnHint: PropTypes.string,
      noteMsg: PropTypes.string,
      icon: PropTypes.any,
      disabled: PropTypes.bool,
      onClick: PropTypes.func,
    }),
  ),
};
ActionButtonsBar.defaulProps = {
  btnLabel: '',
  btnHint: '',
  noteMsg: '',
  icon: '',
  disabled: false,
  onClick: () => {},
};
