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

import { ChangeEvent } from 'react';
import { Checkbox } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import styles from './depthAwareCheckbox.scss';

const cx = createClassnames(styles);

interface DepthAwareCheckboxProps {
  depth: number;
  checked?: boolean;
  partiallyChecked?: boolean;
  disabled?: boolean;
  onChange: (event: ChangeEvent) => void;
}

export const DepthAwareCheckbox = ({
  depth,
  checked,
  partiallyChecked,
  disabled,
  onChange,
}: DepthAwareCheckboxProps) => {
  const indentPerLevel = 24;
  const baseIndent = 46;
  const totalIndent = baseIndent + indentPerLevel * depth;

  return (
    <div className={cx('depth-aware-checkbox')} style={{ left: `${-totalIndent}px` }}>
      <Checkbox
        value={checked}
        partiallyChecked={partiallyChecked}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
};
