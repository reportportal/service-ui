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

import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';

import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { messages } from './messages';
import { commonMessages } from '../../commonMessages';

import styles from './emptyTestPlan.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const EmptyTestPlan = () => {
  const { formatMessage } = useIntl();

  const handleAddTestsFromLibrary = () => {};

  return (
    <div className={cx('empty-test-plan')}>
      <EmptyStatePage
        title={formatMessage(messages.pageHeader)}
        description={formatMessage(messages.pageDescription)}
        imageType="docs"
        buttons={[
          {
            name: formatMessage(commonMessages.addTestsFromLibrary),
            dataAutomationId: 'addTestsFromLibraryButton',
            isCompact: true,
            handleButton: handleAddTestsFromLibrary,
          },
        ]}
      />
    </div>
  );
};
