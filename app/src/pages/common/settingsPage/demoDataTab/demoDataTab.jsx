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
import Parser from 'html-react-parser';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectIdSelector } from 'controllers/pages';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { BigButton } from 'components/buttons/bigButton';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import warningIcon from 'common/img/error-inline.svg';
import styles from './demoDataTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  mobileHint: {
    id: 'DemoDataTab.mobileHint',
    defaultMessage: 'You can generate data only on desktop view.',
  },
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
  generateButtonTitle: {
    id: 'DemoDataTabForm.generateButtonTitle',
    defaultMessage: 'Generate demo data',
  },
  preloaderInfo: {
    id: 'DemoDataTabForm.preloaderInfo',
    defaultMessage:
      'Data generation has started. The process can take several minutes, please wait.',
  },
  generateDemoDataSuccess: {
    id: 'SuccessMessages.generateDemoDataSuccess',
    defaultMessage: 'Demo data has been generated',
  },
  warningText: {
    id: 'DemoDataTab.warningText',
    defaultMessage: 'Warning!',
  },
  warningInfo: {
    id: 'DemoDataTab.warningInfo',
    defaultMessage: 'You will have to remove the demo data manually.',
  },
});

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
  }),
  {
    showNotification,
    showDefaultErrorNotification,
  },
)
@injectIntl
@track()
export class DemoDataTab extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  state = {
    isLoading: false,
  };

  onGenerateDemoData = () => {
    const { intl, projectId, tracking } = this.props;

    this.setState({
      isLoading: true,
    });
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.GENERATE_DATA_BTN);
    fetch(URLS.generateDemoData(projectId), { method: 'POST', data: {} })
      .then(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.generateDemoDataSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.setState({
          isLoading: false,
        });
      })
      .catch((e) => {
        this.props.showDefaultErrorNotification(e);
        this.setState({
          isLoading: false,
        });
      });
  };

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('demo-data-tab')}>
        <span className={cx('mobile-hint')}>{intl.formatMessage(messages.mobileHint)}</span>
        <h5 className={cx('description-header')}>
          {intl.formatMessage(messages.descriptionHeader)}
        </h5>
        <ul className={cx('description-list')}>
          <li>{intl.formatMessage(messages.descriptionListFirstItem)}</li>
          <li>{intl.formatMessage(messages.descriptionListSecItem)}</li>
          <li>{intl.formatMessage(messages.descriptionListThirdItem)}</li>
        </ul>
        <div className={cx('generate-button-container')}>
          <BigButton
            className={cx('generate-button')}
            mobileDisabled
            onClick={this.onGenerateDemoData}
            disabled={this.state.isLoading}
          >
            <span className={cx('generate-button-title')}>
              {intl.formatMessage(messages.generateButtonTitle)}
            </span>
          </BigButton>
        </div>
        {this.state.isLoading && (
          <div className={cx('preloader-block')}>
            <div className={cx('preloader-icon')}>
              <SpinningPreloader />
            </div>
            <div className={cx('preloader-info')}>{intl.formatMessage(messages.preloaderInfo)}</div>
          </div>
        )}
        <div className={cx('warning-block')}>
          <i className={cx('warning-icon')}>{Parser(warningIcon)}</i>
          <span className={cx('warning-text')}>{intl.formatMessage(messages.warningText)}</span>
          <p className={cx('warning-info')}>{intl.formatMessage(messages.warningInfo)}</p>
        </div>
      </div>
    );
  }
}
