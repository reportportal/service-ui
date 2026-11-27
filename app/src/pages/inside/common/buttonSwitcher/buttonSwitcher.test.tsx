/*
 * Copyright 2026 EPAM Systems
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

import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { ButtonSwitcher, ButtonSwitcherOption } from './buttonSwitcher';

const EXISTING_TITLE = 'Add to existing launch';
const NEW_TITLE = 'Create new launch';
const ACTIVE_CLASS = 'buttons-switcher__button--active';

interface SwitcherProps {
  defaultActiveButton?: ButtonSwitcherOption;
  buttonsOrder?: ButtonSwitcherOption[];
}

describe('ButtonSwitcher', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderSwitcher = (props: SwitcherProps = {}) => {
    const handleActiveButton = jest.fn();

    act(() => {
      root.render(
        <ButtonSwitcher
          description="Description"
          existingButtonTitle={EXISTING_TITLE}
          createNewButtonTitle={NEW_TITLE}
          handleActiveButton={handleActiveButton}
          {...props}
        />,
      );
    });

    return handleActiveButton;
  };

  const getButtons = () => Array.from(container.querySelectorAll('button'));
  const getTitles = () => getButtons().map((button) => button.textContent);
  const getActiveTitles = () =>
    getButtons()
      .filter((button) => button.classList.contains(ACTIVE_CLASS))
      .map((button) => button.textContent);

  test('should keep the existing option first and active by default', () => {
    const handleActiveButton = renderSwitcher();

    expect(getTitles()).toEqual([EXISTING_TITLE, NEW_TITLE]);
    expect(getActiveTitles()).toEqual([EXISTING_TITLE]);
    expect(handleActiveButton).toHaveBeenLastCalledWith(ButtonSwitcherOption.EXISTING);
  });

  test('should render options in the given order with the given default', () => {
    const handleActiveButton = renderSwitcher({
      buttonsOrder: [ButtonSwitcherOption.NEW, ButtonSwitcherOption.EXISTING],
      defaultActiveButton: ButtonSwitcherOption.NEW,
    });

    expect(getTitles()).toEqual([NEW_TITLE, EXISTING_TITLE]);
    expect(getActiveTitles()).toEqual([NEW_TITLE]);
    expect(handleActiveButton).toHaveBeenLastCalledWith(ButtonSwitcherOption.NEW);
    expect(handleActiveButton).not.toHaveBeenCalledWith(ButtonSwitcherOption.EXISTING);
  });

  test('should keep order and default independent', () => {
    renderSwitcher({ defaultActiveButton: ButtonSwitcherOption.NEW });

    expect(getTitles()).toEqual([EXISTING_TITLE, NEW_TITLE]);
    expect(getActiveTitles()).toEqual([NEW_TITLE]);
  });

  test('should switch the active option on click', () => {
    const handleActiveButton = renderSwitcher({
      buttonsOrder: [ButtonSwitcherOption.NEW, ButtonSwitcherOption.EXISTING],
      defaultActiveButton: ButtonSwitcherOption.NEW,
    });

    act(() => {
      getButtons()[1].click();
    });

    expect(getActiveTitles()).toEqual([EXISTING_TITLE]);
    expect(handleActiveButton).toHaveBeenLastCalledWith(ButtonSwitcherOption.EXISTING);
  });
});
