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

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { reduxForm } from 'redux-form';
import Parser from 'html-react-parser';
import { Button } from 'componentLibrary/button';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { useTracking } from 'react-tracking';
import { showModalAction } from 'controllers/modal';
import { useDispatch } from 'react-redux';
import { docsReferences, createExternalLink } from 'common/utils';
import { Layout } from '../../layout';
import { LabeledPreloader } from '../../elements';
import { messages } from './messages';
import styles from './indexSettings.scss';

const cx = classNames.bind(styles);

const IndexSettings = ({ indexingRunning, analyzerUnavailableTitle, hasPermission }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const removeIndex = () => {
    trackEvent(SETTINGS_PAGE_EVENTS.REMOVE_INDEX_BTN);
    dispatch(showModalAction({ id: 'removeIndexModalWindow' }));
  };

  const generateIndex = () => {
    trackEvent(SETTINGS_PAGE_EVENTS.GENERATE_INDEX_BTN);
    dispatch(showModalAction({ id: 'generateIndexModalWindow' }));
  };

  const isFieldDisabled = !hasPermission;

  return (
    <Layout
      description={Parser(
        formatMessage(messages.tabDescription, {
          a: (data) => createExternalLink(data, docsReferences.indexSettingsDocs),
        }),
      )}
    >
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
  hasPermission: PropTypes.bool.isRequired,
  indexingRunning: PropTypes.bool.isRequired,
  analyzerUnavailableTitle: PropTypes.string,
};
IndexSettings.defaultProps = {
  analyzerUnavailableTitle: '',
};

export default reduxForm({
  form: 'indexSettingsForm',
})(IndexSettings);
