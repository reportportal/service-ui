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

import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { FieldText } from '@reportportal/ui-kit';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { messages } from '../messages';
import { LEVEL_FIELD_KEY } from '../constants';

const NumericFieldText = ({ onChange, ...rest }) => {
  const handleChange = useCallback(
    (event) => {
      const numericValue = event.target.value.replaceAll(/\D|^0+/g, '') || '';
      onChange(numericValue);
    },
    [onChange],
  );

  return <FieldText onChange={handleChange} {...rest} />;
};

export const LevelField = ({ disabled, showHelpText }) => {
  const { formatMessage } = useIntl();

  return (
    <FieldProvider name={LEVEL_FIELD_KEY}>
      <FieldErrorHint provideHint={false}>
        <NumericFieldText
          label={formatMessage(messages.logLevel)}
          helpText={showHelpText ? formatMessage(messages.levelHelperText) : undefined}
          defaultWidth={false}
          isRequired
          disabled={disabled}
        />
      </FieldErrorHint>
    </FieldProvider>
  );
};

NumericFieldText.propTypes = {
  onChange: PropTypes.func.isRequired,
};

LevelField.propTypes = {
  disabled: PropTypes.bool,
  showHelpText: PropTypes.bool,
};
LevelField.defaultProps = {
  disabled: false,
  showHelpText: true,
};
