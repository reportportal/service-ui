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
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Button } from 'componentLibrary/button';
import { Dropdown } from 'componentLibrary/dropdown';
import { Checkbox } from 'componentLibrary/checkbox';
import { useTracking } from 'react-tracking';
import { PROJECT_SETTINGS_ANALYZER_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { docsReferences, createExternalLink } from 'common/utils';
import { FieldElement, LabeledPreloader, FormattedDescription } from '../../elements';
import { messages } from './messages';
import { UNIQUE_ERROR_ENABLED, UNIQUE_ERROR_REMOVE_NUMBERS } from '../constants';
import { formatFieldName } from '../utils';
import { Layout } from '../../layout';
import styles from './uniqueErrors.scss';

const cx = classNames.bind(styles);

const UniqueErrors = ({
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
    { label: formatMessage(messages.uniqueErrAnalyzeModalIncludeNumbers), value: 'false' },
    { label: formatMessage(messages.uniqueErrAnalyzeModalExcludeNumbers), value: 'true' },
  ];

  useEffect(() => {
    initialize({
      [formatFieldName(UNIQUE_ERROR_ENABLED)]: JSON.parse(
        analyzerConfig[UNIQUE_ERROR_ENABLED] || 'false',
      ),
      [formatFieldName(UNIQUE_ERROR_REMOVE_NUMBERS)]: JSON.parse(
        analyzerConfig[UNIQUE_ERROR_REMOVE_NUMBERS] || 'false',
      ),
    });
  }, []);

  const submitHandler = async (data) => {
    const preparedData = {
      [UNIQUE_ERROR_ENABLED]: data[formatFieldName(UNIQUE_ERROR_ENABLED)],
      [UNIQUE_ERROR_REMOVE_NUMBERS]: data[formatFieldName(UNIQUE_ERROR_REMOVE_NUMBERS)],
    };
    setPending(true);
    await onFormSubmit(preparedData);
    setPending(false);

    const type = JSON.parse(preparedData[UNIQUE_ERROR_REMOVE_NUMBERS]);

    trackEvent(
      PROJECT_SETTINGS_ANALYZER_EVENTS.clickSubmitInUniqueErrorsTab(
        preparedData[UNIQUE_ERROR_ENABLED],
        type,
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
              createExternalLink(data, docsReferences.uniqueErrorsDocs, 'documentationLink'),
          })}
          event={PROJECT_SETTINGS_ANALYZER_EVENTS.clickDocumentationLink('unique_errors')}
        />
      }
    >
      <form onSubmit={handleSubmit(submitHandler)}>
        <FieldElement
          name={formatFieldName(UNIQUE_ERROR_ENABLED)}
          description={formatMessage(messages.uniqueErrorDescription)}
          format={Boolean}
          disabled={!isAnalyzerServiceAvailable || isFieldDisabled}
          dataAutomationId="switchUniqueErrorField"
        >
          <Checkbox className={cx('checkbox')} title={analyzerUnavailableTitle}>
            {formatMessage(messages.uniqueError)}
          </Checkbox>
        </FieldElement>
        <FieldElement
          name={formatFieldName(UNIQUE_ERROR_REMOVE_NUMBERS)}
          label={formatMessage(messages.analyzedErrorLogs)}
          description={formatMessage(messages.analyzedErrorLogsDescription)}
          format={String}
          disabled={isFieldDisabled}
          dataAutomationId="removeNumbersInErrorLogField"
        >
          <Dropdown options={dropdownOptions} mobileDisabled />
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
UniqueErrors.propTypes = {
  analyzerConfig: PropTypes.object.isRequired,
  onFormSubmit: PropTypes.func.isRequired,
  hasPermission: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
  isAnalyzerServiceAvailable: PropTypes.bool.isRequired,
  analyzerUnavailableTitle: PropTypes.string,
};
UniqueErrors.defaultProps = {
  analyzerUnavailableTitle: null,
};

export default reduxForm({
  form: 'uniqueErrorForm',
})(UniqueErrors);
