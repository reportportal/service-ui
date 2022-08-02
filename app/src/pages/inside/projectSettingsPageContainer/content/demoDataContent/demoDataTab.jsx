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
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { SystemMessage } from 'componentLibrary/systemMessage';
import { GenerateDemoDataBlock } from './generateDemoDataBlock';
import styles from './demoDataTab.scss';
import { Layout } from '../layout';

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

  return (
    <Layout description={formatMessage(messages.descriptionDetails)}>
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
      >
        <span className={cx('system-message-description')}>
          {formatMessage(messages.descriptionDetailsWarningMessageContent)}
        </span>
      </SystemMessage>
      <GenerateDemoDataBlock />
    </Layout>
  );
};
