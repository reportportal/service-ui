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

import { memo } from 'react';
import { useIntl } from 'react-intl';
import { CoveredManuallyIcon, CoverageFullIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';

import { messages } from './messages';

import styles from './coverStatusCard.scss';

const cx = createClassnames(styles);

interface CoverStatusCardProps {
  isManualCovered: boolean;
}

export const CoverStatusCard = memo(({ isManualCovered }: CoverStatusCardProps) => {
  const { formatMessage } = useIntl();
  const Icon = isManualCovered ? CoveredManuallyIcon : CoverageFullIcon;

  return (
    <div className={cx('cover-status-card')}>
      <div className={cx('icon-wrapper', { 'is-manual-covered': isManualCovered })}>
        <Icon />
      </div>
      <div className={cx('title', { 'is-manual-covered': isManualCovered })}>
        {formatMessage(isManualCovered ? commonMessages.coveredManually : messages.uncovered)}
      </div>
      <div className={cx('subtitle')}>
        {formatMessage(isManualCovered ? messages.testFullyCovered : messages.noExecutionsYet)}
      </div>
    </div>
  );
});
