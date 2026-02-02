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

import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { createClassnames } from 'common/utils';

import { ManualLaunchExecutionsProps } from './types';
import styles from './manualLaunchExecutions.scss';

const cx = createClassnames(styles);

export const ManualLaunchExecutions = ({ isLoading }: ManualLaunchExecutionsProps) => {
  if (isLoading) {
    return (
      <div className={cx('manual-launch-executions__loader')}>
        <SpinningPreloader />
      </div>
    );
  }

  // TODO next task - need to implement UI for executions (separate component for execution, example - AllTestCasesPage)
  return (
    <div className={cx('manual-launch-executions__content')}>
      <p>No data</p>
    </div>
  );
};
