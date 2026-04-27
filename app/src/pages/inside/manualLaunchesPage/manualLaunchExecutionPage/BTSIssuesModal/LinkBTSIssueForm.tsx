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
import { FieldText } from '@reportportal/ui-kit';

import { FieldErrorHint, FieldProvider } from 'components/fields';

import { messages } from './messages';

export const LinkBTSIssueForm = () => {
  const { formatMessage } = useIntl();

  return (
    <form>
      <FieldProvider name="ticketName">
        <FieldErrorHint provideHint={false}>
          <FieldText
            label={formatMessage(messages.ticketNameLabel)}
            placeholder={formatMessage(messages.ticketNamePlaceholder)}
            defaultWidth={false}
            isRequired
          />
        </FieldErrorHint>
      </FieldProvider>
    </form>
  );
};
