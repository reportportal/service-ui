/*
 * Copyright 2022 EPAM Systems
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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Button } from 'componentLibrary/button';
import { InputNumeric } from 'componentLibrary/inputNumeric';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { bindMessageToValidator, validate } from 'common/utils/validation';
import { AnalyzerLayout } from '../../layout';
import { LabeledPreloader, FieldElement } from '../../elements';
import { messages } from './messages';
import { SEARCH_LOGS_MIN_SHOULD_MATCH } from '../constants';

const SimilarItems = ({
  analyzerConfig,
  onFormSubmit,
  initialize,
  handleSubmit,
  hasPermission,
}) => {
  const { formatMessage } = useIntl();
  const [isPending, setPending] = useState(false);

  useEffect(() => {
    initialize({
      [SEARCH_LOGS_MIN_SHOULD_MATCH]: analyzerConfig[SEARCH_LOGS_MIN_SHOULD_MATCH],
    });
  }, []);

  const submitHandler = async (data) => {
    setPending(true);
    await onFormSubmit(data);
    setPending(false);
  };

  const isFieldDisabled = !hasPermission || isPending;

  return (
    <AnalyzerLayout description={formatMessage(messages.tabDescription)}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <FieldElement
          name={SEARCH_LOGS_MIN_SHOULD_MATCH}
          label={formatMessage(messages.searchLogsMinShouldMatch)}
          description={formatMessage(messages.searchLogsMinShouldMatchDescription)}
          format={String}
          disabled={isFieldDisabled}
        >
          <FieldErrorHint>
            <InputNumeric postfix="%" max={100} />
          </FieldErrorHint>
        </FieldElement>
        <Button type="submit" disabled={isFieldDisabled} mobileDisabled>
          {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
        </Button>
        {isPending && <LabeledPreloader text={formatMessage(COMMON_LOCALE_KEYS.processData)} />}
      </form>
    </AnalyzerLayout>
  );
};
SimilarItems.propTypes = {
  analyzerConfig: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  hasPermission: PropTypes.bool.isRequired,
  initialize: PropTypes.func.isRequired,
  onFormSubmit: PropTypes.func.isRequired,
};

export default reduxForm({
  form: 'similarItemsForm',
  validate: ({ searchLogsMinShouldMatch }) => ({
    searchLogsMinShouldMatch: bindMessageToValidator(
      validate.searchLogsMinShouldMatch,
      'searchLogsMinShouldMatch',
    )(searchLogsMinShouldMatch),
  }),
})(SimilarItems);
