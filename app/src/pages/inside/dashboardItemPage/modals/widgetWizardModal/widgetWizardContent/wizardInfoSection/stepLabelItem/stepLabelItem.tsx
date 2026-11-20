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

import { createClassnames } from 'common/utils';
import styles from './stepLabelItem.scss';

const cx = createClassnames(styles);

interface StepLabelItemProps {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}

export const StepLabelItem = ({
  step = 0,
  label = '',
  active = false,
  completed = false,
}: StepLabelItemProps) => (
  <h4 className={cx('step-label-item', { active, completed })}>
    {step + 1}. {label}
  </h4>
);
