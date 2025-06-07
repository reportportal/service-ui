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

import { useIntl } from 'react-intl';

import { Header } from 'pages/inside/projectSettingsPageContainer/header';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';

import { messages } from './messages';

export const EditTestCasePage = () => {
  const { formatMessage } = useIntl();

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div>
          <Header title={formatMessage(messages.editTestCaseHeader)} />
          <div style={{ padding: '20px' }}>
            <p>Edit Test Case Page</p>
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
