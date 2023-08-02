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
import classNames from 'classnames/bind';
import { reduxForm } from 'redux-form';
import Parser from 'html-react-parser';
import { Dropdown } from 'componentLibrary/dropdown';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Button } from 'componentLibrary/button';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { useTracking } from 'react-tracking';
import { showModalAction } from 'controllers/modal';
import { useDispatch } from 'react-redux';
import { Checkbox } from 'componentLibrary/checkbox';
import { PROJECT_SETTINGS_ANALYZER_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { docsReferences, createExternalLink } from 'common/utils';
import { Layout } from '../../layout';
import { Divider } from '../../elements/divider';
import { LabeledPreloader, FieldElement } from '../../elements';
import { messages } from './messages';
import { ALL_MESSAGES_SHOULD_MATCH, NUMBER_OF_LOG_LINES } from '../constants';
import styles from './indexSettings.scss';

const cx = classNames.bind(styles);

const IndexSettings = ({
  analyzerConfig,
  onFormSubmit,
  initialize,
  handleSubmit,
  indexingRunning,
  analyzerUnavailableTitle,
  hasPermission,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const [isPending, setPending] = useState(false);

  const dropdownOptions = [
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
      [NUMBER_OF_LOG_LINES]: analyzerConfig[NUMBER_OF_LOG_LINES],
      [ALL_MESSAGES_SHOULD_MATCH]: JSON.parse(analyzerConfig[ALL_MESSAGES_SHOULD_MATCH] || 'false'),
    });
  }, []);

  const removeIndex = () => {
    trackEvent(SETTINGS_PAGE_EVENTS.REMOVE_INDEX_BTN);
    dispatch(showModalAction({ id: 'removeIndexModalWindow' }));
  };

  const generateIndex = () => {
    trackEvent(SETTINGS_PAGE_EVENTS.GENERATE_INDEX_BTN);
    dispatch(showModalAction({ id: 'generateIndexModalWindow' }));
  };

  const submitHandler = async (data) => {
    setPending(true);
    await onFormSubmit(data);
    setPending(false);

    const numberOfLogLines = data[NUMBER_OF_LOG_LINES] === '-1' ? 'all' : data[NUMBER_OF_LOG_LINES];

    trackEvent(
      PROJECT_SETTINGS_ANALYZER_EVENTS.CLICK_SUBMIT_IN_INDEX_TAB(
        numberOfLogLines,
        data[ALL_MESSAGES_SHOULD_MATCH],
      ),
    );
  };
  const isFieldDisabled = !hasPermission || isPending;

  return (
    <Layout
      description={Parser(
        formatMessage(messages.tabDescription, {
          a: (data) => createExternalLink(data, docsReferences.indexSettingsDocs),
        }),
      )}
    >
      <form className={cx('index-settings-form')} onSubmit={handleSubmit(submitHandler)}>
        <FieldElement
          name={NUMBER_OF_LOG_LINES}
          label={formatMessage(messages.numberOfLogLines)}
          description={formatMessage(messages.numberOfLogLinesDescription)}
          format={String}
          disabled={isFieldDisabled}
        >
          <Dropdown options={dropdownOptions} mobileDisabled />
        </FieldElement>
        <FieldElement
          name={ALL_MESSAGES_SHOULD_MATCH}
          description={formatMessage(messages.allMessagesShouldMatchDescription)}
          format={Boolean}
          disabled={isFieldDisabled}
        >
          <Checkbox>{formatMessage(messages.allMessagesShouldMatch)}</Checkbox>
        </FieldElement>
        <Button type="submit" disabled={isFieldDisabled} mobileDisabled>
          {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
        </Button>
        {isPending && <LabeledPreloader text={formatMessage(COMMON_LOCALE_KEYS.processData)} />}
      </form>
      <Divider />
      <div className={cx('index-block')}>
        <span className={cx('index-block-title')}>
          {formatMessage(messages.indexActionsBlockTitle)}
        </span>
        <div className={cx('index-block-description')}>
          <div>
            {formatMessage(messages.inCaseOf)}
            <span className={cx('strong')}>
              {` "${formatMessage(messages.generateIndexButtonCaption)}" `}
            </span>
            {formatMessage(messages.generateIndexDescription)}
          </div>
          <div>
            {formatMessage(messages.inCaseOf)}
            <span className={cx('strong')}>
              {` "${formatMessage(messages.removeIndexButtonCaption)}" `}
            </span>
            {formatMessage(messages.removeIndexDescription)}
          </div>
        </div>
        <div className={cx('buttons-group')}>
          <Button
            disabled={indexingRunning || isFieldDisabled}
            onClick={generateIndex}
            title={analyzerUnavailableTitle}
            mobileDisabled
            variant="ghost"
          >
            {formatMessage(messages.generateIndexButtonCaption)}
          </Button>
          <Button
            disabled={indexingRunning || isFieldDisabled}
            onClick={removeIndex}
            title={analyzerUnavailableTitle}
            mobileDisabled
            variant="ghost"
          >
            {formatMessage(messages.removeIndexButtonCaption)}
          </Button>
          {indexingRunning && (
            <LabeledPreloader text={formatMessage(messages.regenerateIndexProgress)} />
          )}
        </div>
      </div>
    </Layout>
  );
};
IndexSettings.propTypes = {
  analyzerConfig: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  hasPermission: PropTypes.bool.isRequired,
  initialize: PropTypes.func.isRequired,
  onFormSubmit: PropTypes.func.isRequired,
  indexingRunning: PropTypes.bool.isRequired,
  analyzerUnavailableTitle: PropTypes.string,
};
IndexSettings.defaultProps = {
  analyzerUnavailableTitle: '',
};

export default reduxForm({
  form: 'indexSettingsForm',
})(IndexSettings);
