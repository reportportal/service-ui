/*
 * Copyright 2025 EPAM Systems
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

import { useEffect, useState, ReactNode } from 'react';

import { createClassnames } from 'common/utils';

import styles from './buttonSwitcher.scss';

const cx = createClassnames(styles);

export enum ButtonSwitcherOption {
  EXISTED = 'existed',
  NEW = 'new',
}

interface ButtonSwitcherProps {
  description: ReactNode;
  existingButtonTitle: string;
  createNewButtonTitle: string;
  handleActiveButton: (activeButton: string) => void;
}

export const ButtonSwitcher = ({
  description,
  existingButtonTitle,
  createNewButtonTitle,
  handleActiveButton,
}: ButtonSwitcherProps) => {
  const [activeButton, setActiveButton] = useState(ButtonSwitcherOption.EXISTED);

  useEffect(() => {
    handleActiveButton(activeButton);
  }, [handleActiveButton, activeButton]);

  return (
    <div className={cx('buttons-switcher')}>
      {description}
      <div className={cx('buttons-switcher__wrapper')}>
        <button
          type="button"
          className={cx('buttons-switcher__button', {
            'buttons-switcher__button--active': activeButton === ButtonSwitcherOption.EXISTED,
          })}
          onClick={() => {
            setActiveButton(ButtonSwitcherOption.EXISTED);
          }}
        >
          {existingButtonTitle}
        </button>
        <button
          type="button"
          className={cx('buttons-switcher__button', {
            'buttons-switcher__button--active': activeButton === ButtonSwitcherOption.NEW,
          })}
          onClick={() => {
            setActiveButton(ButtonSwitcherOption.NEW);
          }}
        >
          {createNewButtonTitle}
        </button>
      </div>
    </div>
  );
};
