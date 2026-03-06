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
import { commonMessages } from 'pages/inside/common/common-messages';

import styles from './executionStatusButtons.scss';

const cx = createClassnames(styles);

export const ExecutionStatusButtons = () => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('execution-status-buttons')}>
      <button type="button" className={cx('status-button', 'status-button--skipped')}>
        {formatMessage(commonMessages.skipped)}
      </button>
      <button type="button" className={cx('status-button', 'status-button--failed')}>
        {formatMessage(commonMessages.failed)}
      </button>
      <button type="button" className={cx('status-button', 'status-button--passed')}>
        {formatMessage(commonMessages.passed)}
      </button>
    </div>
  );
};
