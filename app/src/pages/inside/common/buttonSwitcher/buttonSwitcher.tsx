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
  EXISTING = 'existing',
  NEW = 'new',
}

const DEFAULT_BUTTONS_ORDER = [ButtonSwitcherOption.EXISTING, ButtonSwitcherOption.NEW];

interface ButtonSwitcherProps {
  description: ReactNode;
  existingButtonTitle: string;
  createNewButtonTitle: string;
  handleActiveButton: (activeButton: string) => void;
  defaultActiveButton?: ButtonSwitcherOption;
  buttonsOrder?: ButtonSwitcherOption[];
}

export const ButtonSwitcher = ({
  description,
  existingButtonTitle,
  createNewButtonTitle,
  handleActiveButton,
  defaultActiveButton = ButtonSwitcherOption.EXISTING,
  buttonsOrder = DEFAULT_BUTTONS_ORDER,
}: ButtonSwitcherProps) => {
  const [activeButton, setActiveButton] = useState(defaultActiveButton);

  useEffect(() => {
    handleActiveButton(activeButton);
  }, [handleActiveButton, activeButton]);

  const buttonTitles: Record<ButtonSwitcherOption, string> = {
    [ButtonSwitcherOption.EXISTING]: existingButtonTitle,
    [ButtonSwitcherOption.NEW]: createNewButtonTitle,
  };

  return (
    <div className={cx('buttons-switcher')}>
      {description}
      <div className={cx('buttons-switcher__wrapper')}>
        {buttonsOrder.map((option) => (
          <button
            key={option}
            type="button"
            className={cx('buttons-switcher__button', {
              'buttons-switcher__button--active': activeButton === option,
            })}
            onClick={() => {
              setActiveButton(option);
            }}
          >
            {buttonTitles[option]}
          </button>
        ))}
      </div>
    </div>
  );
};
