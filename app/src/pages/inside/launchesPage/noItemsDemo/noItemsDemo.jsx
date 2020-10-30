/*
 * Copyright 2020 EPAM Systems
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import DemoNoData from 'common/img/demo_no_data.svg';
import { GenerateDemoDataBlock } from 'pages/common/settingsPage/demoDataTab/generateDemoDataBlock';
import styles from './noItemsDemo.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noDataTitle: {
    id: 'NoItemsDemo.noDataTitle',
    defaultMessage: 'You have no data',
  },
  generateDemoDataDescription: {
    id: 'NoItemsDemo.generateDemoDataDescription',
    defaultMessage:
      "To get started, please <a href='http://reportportal.io/download/integration' target='_blank'>Set up Own Integration</a> or generate Demo Test Results",
  },
});

@injectIntl
export class NoItemsDemo extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    onGenerate: PropTypes.func,
  };

  static defaultProps = {
    onGenerate: () => {},
  };

  render() {
    const {
      intl: { formatMessage },
      onGenerate,
    } = this.props;

    return (
      <div className={cx('no-items-demo')}>
        <img src={DemoNoData} alt="No data" />
        <h5 className={cx('no-data-title')}>{formatMessage(messages.noDataTitle)}</h5>
        <p className={cx('generate-demo-description')}>
          {Parser(formatMessage(messages.generateDemoDataDescription))}
        </p>
        <GenerateDemoDataBlock onSuccess={onGenerate} className={cx('generate-demo-data-block')} />
      </div>
    );
  }
}
