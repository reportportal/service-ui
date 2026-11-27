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

import classNames from 'classnames/bind';
import { PatternItem } from '../types';
import styles from './patternGrid.scss';

const cx = classNames.bind(styles);

interface PatternNameColumnProps {
  value: PatternItem;
  onPatternClick: (patternName: string) => void;
}

export const PatternNameColumn = ({ value, onPatternClick }: PatternNameColumnProps) => (
  <button
    type="button"
    className={cx('pattern-link')}
    onClick={() => onPatternClick(value.name)}
  >
    {value.name}
  </button>
);

interface TestCasesColumnProps {
  value: PatternItem;
}

export const TestCasesColumn = ({ value }: TestCasesColumnProps) => (
  <div className={cx('test-cases')}>{value.count}</div>
);
