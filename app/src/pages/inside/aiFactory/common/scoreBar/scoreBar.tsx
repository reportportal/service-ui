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
import styles from './scoreBar.scss';

const cx = createClassnames(styles);

export interface ScoreBarProps {
  /** Criterion (or total) score, e.g. from `GradeCriterionRS`/`GradeCaseRS`. */
  value: number;
  max: number;
}

/**
 * A single neutral-coloured bar — no traffic-light colouring (Q-FE-05:
 * docs/ai-factory-poc/06-open-questions.md, the AC forbids PASS/FAIL verdicts on criteria).
 */
export const ScoreBar = ({ value, max }: ScoreBarProps) => {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={cx('score-bar')} data-automation-id="scoreBar">
      <div className={cx('score-bar__indicator')} style={{ width: `${percent}%` }} />
    </div>
  );
};
