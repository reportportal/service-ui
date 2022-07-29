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

import classNames from 'classnames/bind';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { SystemMessage } from 'componentLibrary/systemMessage';
import { PROJECT_SETTINGS_DEMO_DATA_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { GenerateDemoDataBlock } from './generateDemoDataBlock';
import styles from './demoDataTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  descriptionHeader: {
    id: 'DemoDataTab.descriptionHeader',
    defaultMessage: 'The system will generate the following data:',
  },
  descriptionListFirstItem: {
    id: 'DemoDataTab.descriptionListFirstItem',
    defaultMessage: '5 launches',
  },
  descriptionListSecItem: {
    id: 'DemoDataTab.descriptionListSecItem',
    defaultMessage: '1 dashboard with 12 widgets',
  },
  descriptionListThirdItem: {
    id: 'DemoDataTab.descriptionListThirdItem',
    defaultMessage: '1 filter',
  },
  descriptionDetails: {
    id: 'DemoDataTab.descriptionDetails',
    defaultMessage:
      'Demo data will help you to get familiar with the functionality of the ReportPortal. By generation of the Demo Data several entities will be created and will serve you as an example. Dashboard and Filter will be generated only in case you haven’t already created them.',
  },
  descriptionDetailsWarningMessageHeader: {
    id: 'DemoDataTab.descriptionWarningMessageHeader',
    defaultMessage: 'Warning',
  },
  descriptionDetailsWarningMessageContent: {
    id: 'DemoDataTab.descriptionWarningMessageContent',
    defaultMessage: 'If you generate Demo Data, you will have to remove it manually.',
  },
});

export const DemoDataTab = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const onGenerateDemoData = () => {
    trackEvent(SETTINGS_PAGE_EVENTS.GENERATE_DATA_BTN);
    trackEvent(PROJECT_SETTINGS_DEMO_DATA_EVENTS.CLICK_GENERATE_DATA_IN_DEMO_DATA_TAB);
  };

  return (
    <div className={cx('demo-data-tab')}>
      <p className={cx('description-details')}>{formatMessage(messages.descriptionDetails)}</p>
      <hr className={cx('description-delimiter')} />
      <h5 className={cx('description-header')}>{formatMessage(messages.descriptionHeader)}</h5>
      <ul className={cx('description-list')}>
        <li>{formatMessage(messages.descriptionListFirstItem)}</li>
        <li>{formatMessage(messages.descriptionListSecItem)}</li>
        <li>{formatMessage(messages.descriptionListThirdItem)}</li>
      </ul>
      <SystemMessage
        mode={'warning'}
        header={formatMessage(messages.descriptionDetailsWarningMessageHeader)}
        widthByContent
        className={cx('warning-message-demo')}
      >
        {formatMessage(messages.descriptionDetailsWarningMessageContent)}
      </SystemMessage>
      <GenerateDemoDataBlock onGenerate={onGenerateDemoData} />
    </div>
  );
};
