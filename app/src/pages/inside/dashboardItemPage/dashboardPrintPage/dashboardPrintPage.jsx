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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { activeDashboardItemSelector } from 'controllers/dashboard';
import { projectNameSelector } from 'controllers/project';
import { PageLayout } from 'layouts/pageLayout';
import { GhostButton } from 'components/buttons/ghostButton';
import ExportIcon from 'common/img/export-inline.svg';
import styles from './dashboardPrintPage.scss';
import { WidgetsGrid } from '../widgetsGrid';

const cx = classNames.bind(styles);

const messages = defineMessages({
  projectTitle: {
    id: 'DashboardPrintPage.projectTitle',
    defaultMessage: 'Project:',
  },
  dashboardTitle: {
    id: 'DashboardPrintPage.dashboardTitle',
    defaultMessage: 'Dashboard:',
  },
  print: {
    id: 'DashboardPrintPage.print',
    defaultMessage: 'Print',
  },
});

@injectIntl
@connect((state) => ({
  projectName: projectNameSelector(state),
  dashboard: activeDashboardItemSelector(state),
}))
@track()
export class DashboardPrintPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectName: PropTypes.string.isRequired,
    dashboard: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  getDashboardName = () => this.props.dashboard?.name || '';

  printPage = () => window.print();

  render() {
    const {
      intl: { formatMessage },
      projectName,
      dashboard,
    } = this.props;

    return (
      <PageLayout>
        <div className={cx('print-layout')}>
          <div className={cx('print-button-container')}>
            <GhostButton icon={ExportIcon} onClick={this.printPage}>
              {formatMessage(messages.print)}
            </GhostButton>
          </div>
          <div className={cx('page')}>
            <div className={cx('dashboard-printed-header')}>
              <p className={cx('title')}>
                {formatMessage(messages.projectTitle)}
                <span className={cx('title-value')}>{projectName}</span>
              </p>
              <p className={cx('title')}>
                {formatMessage(messages.dashboardTitle)}
                <span className={cx('title-value')}>{this.getDashboardName()}</span>
              </p>
            </div>
            <WidgetsGrid dashboard={dashboard} isPrintMode isModifiable={false} />
          </div>
        </div>
      </PageLayout>
    );
  }
}
