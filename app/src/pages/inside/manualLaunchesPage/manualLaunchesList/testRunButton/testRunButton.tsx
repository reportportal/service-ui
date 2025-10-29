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

import { Button } from '@reportportal/ui-kit';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';

import { MAX_TEST_COUNT_TO_RUN } from '../contants';
import { TestRunButtonType } from './types';

import styles from '../manualLaunchesList.scss';

const cx = createClassnames(styles);

export const TestRunButton = ({ count }: TestRunButtonType) => {
  const { formatMessage } = useIntl();

  const areTestsToRunAvailable = count > 0;

  const content = useMemo(() => {
    if (!areTestsToRunAvailable) {
      return formatMessage(COMMON_LOCALE_KEYS.DONE);
    }

    return count > MAX_TEST_COUNT_TO_RUN ? `${MAX_TEST_COUNT_TO_RUN}+` : count;
  }, [areTestsToRunAvailable, count, formatMessage]);

  return (
    <Button
      disabled={!areTestsToRunAvailable}
      className={cx('manual-launches-list-table-cell-tests-to-run')}
    >
      {content}
    </Button>
  );
};
