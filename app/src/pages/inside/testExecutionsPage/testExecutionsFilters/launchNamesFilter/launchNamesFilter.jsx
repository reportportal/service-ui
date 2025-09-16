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

import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { FieldText } from 'componentLibrary/fieldText';

const messages = defineMessages({
  label: {
    id: 'TestExecutionsPage.filters.namesLabel',
    defaultMessage: 'Launch names',
  },
  placeholder: {
    id: 'TestExecutionsPage.filters.namesPlaceholder',
    defaultMessage: 'Refine by launch name',
  },
});

export const LaunchNamesFilter = () => {
  const { formatMessage } = useIntl();

  return (
    <div>
      <FieldText
        label={formatMessage(messages.label)}
        placeholder={formatMessage(messages.placeholder)}
      />
    </div>
  );
};
