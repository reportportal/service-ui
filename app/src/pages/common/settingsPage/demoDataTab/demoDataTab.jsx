/*
 * Copyright 2019 EPAM Systems
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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { GenerateDemoDataBlock } from './generateDemoDataBlock';
import styles from './demoDataTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  descriptionHeader: {
    id: 'DemoDataTab.descriptionHeader',
    defaultMessage: 'The system will generate the following demo data:',
  },
  descriptionListFirstItem: {
    id: 'DemoDataTab.descriptionListFirstItem',
    defaultMessage: '10 launches',
  },
  descriptionListSecItem: {
    id: 'DemoDataTab.descriptionListSecItem',
    defaultMessage: '1 dashboard with 12 widgets',
  },
  descriptionListThirdItem: {
    id: 'DemoDataTab.descriptionListThirdItem',
    defaultMessage: '1 filter',
  },
});

@injectIntl
@track()
export class DemoDataTab extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  onGenerateDemoData = () => {
    const { tracking } = this.props;

    tracking.trackEvent(SETTINGS_PAGE_EVENTS.GENERATE_DATA_BTN);
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={cx('demo-data-tab')}>
        <h5 className={cx('description-header')}>{formatMessage(messages.descriptionHeader)}</h5>
        <ul className={cx('description-list')}>
          <li>{formatMessage(messages.descriptionListFirstItem)}</li>
          <li>{formatMessage(messages.descriptionListSecItem)}</li>
          <li>{formatMessage(messages.descriptionListThirdItem)}</li>
        </ul>
        <GenerateDemoDataBlock onGenerate={this.onGenerateDemoData} />
      </div>
    );
  }
}
