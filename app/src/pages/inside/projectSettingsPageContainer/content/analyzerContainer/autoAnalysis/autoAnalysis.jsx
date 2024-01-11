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
import { LAUNCH_ANALYZE_TYPES } from 'common/constants/launchAnalyzeTypes';
import { FIELD } from 'common/constants/dataAutomation';
import { Button } from 'componentLibrary/button';
import { FieldNumber } from 'componentLibrary/fieldNumber';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { bindMessageToValidator, validate } from 'common/utils/validation';
import { Dropdown } from 'componentLibrary/dropdown';
import { Checkbox } from 'componentLibrary/checkbox';
import { useTracking } from 'react-tracking';
import { PROJECT_SETTINGS_ANALYZER_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { docsReferences, createExternalLink } from 'common/utils';
import OpenInNewTabIcon from 'common/img/open-in-new-tab-inline.svg';
import { Layout } from '../../layout';
import { FieldElement, LabeledPreloader, FormattedDescription } from '../../elements';
import { messages } from './messages';
import {
  ALL_MESSAGES_SHOULD_MATCH,
  ANALYZER_ENABLED,
  ANALYZER_MODE,
  MIN_SHOULD_MATCH,
  NUMBER_OF_LOG_LINES,
} from '../constants';

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

  const {
    ANALYZER_MODE: { ALL, LAUNCH_NAME, CURRENT_LAUNCH, PREVIOUS_LAUNCH, CURRENT_AND_THE_SAME_NAME },
  } = LAUNCH_ANALYZE_TYPES;

  const analyzerModeDropdownOptions = [
    { value: ALL, label: formatMessage(messages.allLaunchesCaption) },
    { value: CURRENT_AND_THE_SAME_NAME, label: formatMessage(messages.currentAndTheSameName) },
    { value: LAUNCH_NAME, label: formatMessage(messages.sameNameLaunchesCaption) },
    { value: PREVIOUS_LAUNCH, label: formatMessage(messages.previousLaunch) },
    { value: CURRENT_LAUNCH, label: formatMessage(messages.currentLaunch) },
  ];

  const numberOfLogDropdownOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
    { value: '15', label: '15' },
    {
      value: '-1',
      label: formatMessage(messages.numberOfLogLinesAllOption),
    },
  ];

  useEffect(() => {
    initialize({
      [ANALYZER_ENABLED]: JSON.parse(analyzerConfig[ANALYZER_ENABLED] || 'false'),
      [MIN_SHOULD_MATCH]: analyzerConfig[MIN_SHOULD_MATCH],
      [ANALYZER_MODE]: analyzerConfig[ANALYZER_MODE],
      [NUMBER_OF_LOG_LINES]: analyzerConfig[NUMBER_OF_LOG_LINES],
      [ALL_MESSAGES_SHOULD_MATCH]: JSON.parse(analyzerConfig[ALL_MESSAGES_SHOULD_MATCH] || 'false'),
    });
  }, []);

  const submitHandler = async (data) => {
    setPending(true);
    await onFormSubmit(data);
    setPending(false);

    trackEvent(
      PROJECT_SETTINGS_ANALYZER_EVENTS.clickSubmitInAutoAnalyzerTab(
        data[MIN_SHOULD_MATCH],
        data[ANALYZER_ENABLED],
        data[ANALYZER_MODE],
      ),
    );
  };

  const isFieldDisabled = !hasPermission || isPending;

  return (
    <Layout
      description={
        <FormattedDescription
          content={formatMessage(messages.tabDescription, {
            a: (data) =>
              createExternalLink(data, docsReferences.autoAnalysisDocs, 'documentationLink'),
          })}
          event={PROJECT_SETTINGS_ANALYZER_EVENTS.clickDocumentationLink('auto_analyzer')}
        />
      }
    >
      <form onSubmit={handleSubmit(submitHandler)}>
        <FieldElement
          name={ANALYZER_ENABLED}
          description={formatMessage(messages.autoAnalysisDescription)}
          format={Boolean}
          disabled={!isAnalyzerServiceAvailable || isFieldDisabled}
          dataAutomationId={ANALYZER_ENABLED + FIELD}
        >
          <Checkbox title={analyzerUnavailableTitle}>
            {formatMessage(messages.autoAnalysis)}
          </Checkbox>
        </FieldElement>
        <FieldElement
          name={ANALYZER_MODE}
          label={formatMessage(messages.analyzerMode)}
          description={
            <FormattedDescription
              content={formatMessage(messages.analyzerModeDescription, {
                a: (data) =>
                  createExternalLink(
                    data,
                    docsReferences.baseAutoAnalysisDocs,
                    'documentationLink',
                    OpenInNewTabIcon,
                  ),
              })}
              event={PROJECT_SETTINGS_ANALYZER_EVENTS.clickDocumentationLink(
                'auto_analyzer_based_on',
              )}
              variant="gray"
            />
          }
          format={String}
          disabled={isFieldDisabled}
          dataAutomationId={ANALYZER_MODE + FIELD}
        >
          <Dropdown options={analyzerModeDropdownOptions} mobileDisabled />
        </FieldElement>
        <FieldElement
          name={MIN_SHOULD_MATCH}
          label={formatMessage(messages.minShouldMatch)}
          description={formatMessage(messages.minShouldMatchDescription)}
          format={String}
          disabled={isFieldDisabled}
          dataAutomationId={MIN_SHOULD_MATCH + FIELD}
        >
          <FieldErrorHint>
            <FieldNumber postfix="%" max={100} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={NUMBER_OF_LOG_LINES}
          label={formatMessage(messages.numberOfLogLines)}
          description={formatMessage(messages.numberOfLogLinesDescription)}
          format={String}
          disabled={isFieldDisabled}
          dataAutomationId={NUMBER_OF_LOG_LINES + FIELD}
        >
          <Dropdown options={numberOfLogDropdownOptions} mobileDisabled />
        </FieldElement>
        <FieldElement
          name={ALL_MESSAGES_SHOULD_MATCH}
          description={formatMessage(messages.allMessagesShouldMatchDescription)}
          format={Boolean}
          disabled={isFieldDisabled}
          dataAutomationId={ALL_MESSAGES_SHOULD_MATCH + FIELD}
        >
          <Checkbox>{formatMessage(messages.allMessagesShouldMatch)}</Checkbox>
        </FieldElement>
        <Button
          type="submit"
          disabled={isFieldDisabled}
          mobileDisabled
          dataAutomationId="submitButton"
        >
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
