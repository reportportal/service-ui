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
import { useIntl } from 'react-intl';
import { FieldText } from '@reportportal/ui-kit';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { messages } from '../messages';
import { LEVEL_FIELD_KEY, MIN_LOG_LEVEL, MAX_LOG_LEVEL } from '../constants';

export const LevelField = () => {
  const { formatMessage } = useIntl();

  return (
    <FieldProvider name={LEVEL_FIELD_KEY} type="number">
      <FieldErrorHint provideHint={false}>
        <FieldText
          type="number"
          label={formatMessage(messages.logLevel)}
          helpText={formatMessage(messages.levelHelperText)}
          defaultWidth={false}
          min={MIN_LOG_LEVEL}
          max={MAX_LOG_LEVEL}
          isRequired
        />
      </FieldErrorHint>
    </FieldProvider>
  );
};
