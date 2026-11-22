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

import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';

import { messages } from './messages';

import styles from './testPlanLoadError.scss';

const cx = createClassnames(styles);

interface TestPlanLoadErrorProps {
  onRetry: () => void;
}

export const TestPlanLoadError = ({ onRetry }: TestPlanLoadErrorProps) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('test-plan-load-error')}>
      <EmptyStatePage
        title={formatMessage(messages.title)}
        description={formatMessage(messages.description)}
        imageType="error"
        buttons={[
          {
            name: formatMessage(messages.retry),
            dataAutomationId: 'retryLoadTestPlanButton',
            isCompact: true,
            handleButton: onRetry,
          },
        ]}
      />
    </div>
  );
};
