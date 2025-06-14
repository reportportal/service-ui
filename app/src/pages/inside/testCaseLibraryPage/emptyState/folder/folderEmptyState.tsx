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

import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';

import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';

import ImportIcon from 'common/img/import-thin-inline.svg';
import PlusIconInline from 'common/img/plus-button-inline.svg';
import { messages } from '../messages';

export const FolderEmptyState = () => {
  const { formatMessage } = useIntl();

  return (
    <EmptyStatePage
      title={formatMessage(messages.emptyPageTitle)}
      description={Parser(formatMessage(messages.folderEmptyPageDescription))}
      imageType="docs"
      buttons={[
        {
          name: formatMessage(messages.addTestCase),
          dataAutomationId: 'createTestCaseButton',
          icon: PlusIconInline,
          isCompact: true,
        },
        {
          name: formatMessage(messages.importTestCases),
          dataAutomationId: 'importTestCaseButton',
          variant: 'ghost',
          icon: ImportIcon,
          isCompact: true,
        },
      ]}
    />
  );
};
