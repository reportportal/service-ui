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
import { FieldNumber } from 'componentLibrary/fieldNumber';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { bindMessageToValidator, validate } from 'common/utils/validation';
import { Dropdown } from 'componentLibrary/dropdown';
import { Checkbox } from 'componentLibrary/checkbox';
import { useTracking } from 'react-tracking';
import Parser from 'html-react-parser';
import { PROJECT_SETTINGS_ANALYZER_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { docsReferences, createExternalLink } from 'common/utils';
import { Layout } from '../../layout';
import { FieldElement, LabeledPreloader } from '../../elements';
import { messages } from './messages';
import { ANALYZER_ENABLED, ANALYZER_MODE, MIN_SHOULD_MATCH } from '../constants';

const AutoAnalysis = ({
  analyzerConfig,
  onFormSubmit,
  initialize,
  handleSubmit,
  hasPermission,
  analyzerUnavailableTitle,
  isAnalyzerServiceAvailable,
}) => {
  const { formatMessage } = useIntl();
  const [isPending, setPending] = useState(false);
  const { trackEvent } = useTracking();

  const dropdownOptions = [
    { value: 'ALL', label: formatMessage(messages.allLaunchesCaption) },
    { value: 'LAUNCH_NAME', label: formatMessage(messages.sameNameLaunchesCaption) },
  ];

  useEffect(() => {
    initialize({
      [ANALYZER_ENABLED]: JSON.parse(analyzerConfig[ANALYZER_ENABLED] || 'false'),
      [MIN_SHOULD_MATCH]: analyzerConfig[MIN_SHOULD_MATCH],
      [ANALYZER_MODE]: analyzerConfig[ANALYZER_MODE],
    });
  }, []);

  const submitHandler = async (data) => {
    setPending(true);
    await onFormSubmit(data);
    setPending(false);

    trackEvent(
      PROJECT_SETTINGS_ANALYZER_EVENTS.CLICK_SUBMIT_IN_AUTO_ANALYZER_TAB(
        data[MIN_SHOULD_MATCH],
        data[ANALYZER_ENABLED],
        data[ANALYZER_MODE] === 'ALL' ? 'All' : messages.sameNameLaunchesCaption.defaultMessage,
      ),
    );
  };

  const isFieldDisabled = !hasPermission || isPending;

  return (
    <Layout
      description={Parser(
        formatMessage(messages.tabDescription, {
          a: (data) => createExternalLink(data, docsReferences.autoAnalysisDocs),
        }),
      )}
    >
      <form onSubmit={handleSubmit(submitHandler)}>
        <FieldElement
          name={ANALYZER_ENABLED}
          description={formatMessage(messages.autoAnalysisDescription)}
          format={Boolean}
          disabled={!isAnalyzerServiceAvailable || isFieldDisabled}
        >
          <Checkbox title={analyzerUnavailableTitle}>
            {formatMessage(messages.autoAnalysis)}
          </Checkbox>
        </FieldElement>
        <FieldElement
          name={ANALYZER_MODE}
          label={formatMessage(messages.analyzerMode)}
          description={formatMessage(messages.analyzerModeDescription)}
          format={String}
          disabled={isFieldDisabled}
        >
          <Dropdown options={dropdownOptions} mobileDisabled />
        </FieldElement>
        <FieldElement
          name={MIN_SHOULD_MATCH}
          label={formatMessage(messages.minShouldMatch)}
          description={formatMessage(messages.minShouldMatchDescription)}
          format={String}
          disabled={isFieldDisabled}
        >
          <FieldErrorHint>
            <FieldNumber postfix="%" max={100} />
          </FieldErrorHint>
        </FieldElement>
        <Button type="submit" disabled={isFieldDisabled} mobileDisabled>
          {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
        </Button>
        {isPending && <LabeledPreloader text={formatMessage(COMMON_LOCALE_KEYS.processData)} />}
      </form>
    </Layout>
  );
};
AutoAnalysis.propTypes = {
  analyzerConfig: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  hasPermission: PropTypes.bool.isRequired,
  initialize: PropTypes.func.isRequired,
  onFormSubmit: PropTypes.func.isRequired,
  analyzerUnavailableTitle: PropTypes.string,
  isAnalyzerServiceAvailable: PropTypes.bool.isRequired,
};
AutoAnalysis.defaultProps = {
  analyzerUnavailableTitle: null,
};

export default reduxForm({
  form: 'autoAnalysisForm',
  validate: ({ minShouldMatch }) => ({
    minShouldMatch: bindMessageToValidator(
      validate.analyzerMinShouldMatch,
      'minShouldMatchHint',
    )(minShouldMatch),
  }),
})(AutoAnalysis);
