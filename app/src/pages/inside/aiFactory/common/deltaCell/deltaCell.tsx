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
import styles from './deltaCell.scss';

const cx = createClassnames(styles);

export interface DeltaCellProps {
  /** `candidate - baseline`, already computed on the FE (Q-FE-04). */
  value: number;
  /** Whether a larger value is the better outcome for this metric (score: yes; cost: no). */
  higherIsBetter: boolean;
  /** Formats the absolute value, e.g. `formatCost` for a cost delta. Defaults to the raw number. */
  format?: (absoluteValue: number) => string;
}

/**
 * Direction colouring for a **comparison between two iterations** (T4.3), not a verdict on a
 * single score — Q-FE-05 ("no traffic-light colours") applies to criterion bars, not this.
 */
export const DeltaCell = ({ value, higherIsBetter, format = String }: DeltaCellProps) => {
  let sign = '';
  if (value > 0) {
    sign = '+';
  } else if (value < 0) {
    sign = '−';
  }

  const isBetter = (value > 0 && higherIsBetter) || (value < 0 && !higherIsBetter);
  const isWorse = (value > 0 && !higherIsBetter) || (value < 0 && higherIsBetter);

  let variant = 'neutral';
  if (isBetter) {
    variant = 'better';
  } else if (isWorse) {
    variant = 'worse';
  }

  return (
    <span className={cx('delta', variant)} data-automation-id="deltaCell">
      {`${sign}${format(Math.abs(value))}`}
    </span>
  );
};
