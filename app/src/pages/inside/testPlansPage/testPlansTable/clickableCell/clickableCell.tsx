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

import { ReactNode } from 'react';

import { createClassnames } from 'common/utils';

import styles from '../testPlansTable.scss';

const cx = createClassnames(styles);

interface ClickableCellProps {
  isSelected: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  children: ReactNode;
}

export const ClickableCell = ({ isSelected, onClick, onKeyDown, children }: ClickableCellProps) => (
  <div
    className={cx('cell-content', { selected: isSelected })}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={onKeyDown}
  >
    {children}
  </div>
);
