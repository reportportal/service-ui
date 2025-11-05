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
import PropTypes from 'prop-types';
import { FieldText } from '@reportportal/ui-kit';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { messages } from '../messages';
import { NAME_FIELD_KEY } from '../constants';

export const NameField = ({ disabled }) => {
  const { formatMessage } = useIntl();

  return (
    <FieldProvider name={NAME_FIELD_KEY} type="text">
      <FieldErrorHint provideHint={false}>
        <FieldText
          label={formatMessage(messages.logTypeName)}
          defaultWidth={false}
          isRequired
          disabled={disabled}
        />
      </FieldErrorHint>
    </FieldProvider>
  );
};

NameField.propTypes = {
  disabled: PropTypes.bool,
};
NameField.defaultProps = {
  disabled: false,
};
