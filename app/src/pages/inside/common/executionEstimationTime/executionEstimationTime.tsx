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

import { DurationIcon } from '@reportportal/ui-kit';

import { MILLISECONDS_IN_MINUTE } from 'common/constants/common';

import { formatDuration } from '../testCaseList/utils';

interface ExecutionEstimationTimeProps {
  executionEstimationTime: number | undefined | null;
  className?: string;
  valueClassName?: string;
}

export const ExecutionEstimationTime = ({
  executionEstimationTime,
  className,
  valueClassName,
}: ExecutionEstimationTimeProps) => {
  if (!executionEstimationTime) {
    return null;
  }

  return (
    <div className={className}>
      <DurationIcon />
      <span className={valueClassName}>
        {formatDuration(executionEstimationTime * MILLISECONDS_IN_MINUTE)}
      </span>
    </div>
  );
};
