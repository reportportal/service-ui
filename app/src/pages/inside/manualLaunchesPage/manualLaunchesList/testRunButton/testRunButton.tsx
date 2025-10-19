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

import { MAX_TEST_COUNT_TO_RUN } from '../manualLaunchesList.constants';
import { Button } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import styles from '../manualLaunchesList.scss';
import { useMemo, FC } from 'react';
import { TestRunButtonProps } from './testRunButton.types';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

const cx = classNames.bind(styles) as typeof classNames;

export const TestRunButton: FC<TestRunButtonProps> = ({ count }) => {
  const { formatMessage } = useIntl();

  const isNoTestsToRun = count === 0;

  const content = useMemo(() => {
    if (isNoTestsToRun) return formatMessage(COMMON_LOCALE_KEYS.DONE);

    return count > MAX_TEST_COUNT_TO_RUN ? `${MAX_TEST_COUNT_TO_RUN}+` : count;
  }, [isNoTestsToRun, count, formatMessage]);

  return (
    <Button
      disabled={isNoTestsToRun}
      className={cx('manual-launches-list-table-cell-tests-to-run')}
    >
      {content}
    </Button>
  );
};
