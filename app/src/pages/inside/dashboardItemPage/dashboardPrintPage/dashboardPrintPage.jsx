import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { activeDashboardItemSelector } from 'controllers/dashboard';
import { activeProjectSelector } from 'controllers/user';
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
  activeProject: activeProjectSelector(state),
  dashboard: activeDashboardItemSelector(state),
}))
@track()
export class DashboardPrintPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activeProject: PropTypes.string.isRequired,
    dashboard: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    currentDashboard: {},
  };

  getDashboardName = () => (this.props.dashboard && this.props.dashboard.name) || '';

  printPage = () => window.print();

  render() {
    const {
      intl: { formatMessage },
      activeProject,
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
                <span className={cx('title-value')}>{activeProject}</span>
              </p>
              <p className={cx('title')}>
                {formatMessage(messages.dashboardTitle)}
                <span className={cx('title-value')}>{this.getDashboardName()}</span>
              </p>
            </div>
            <WidgetsGrid dashboard={dashboard} isPrintMode />
          </div>
        </div>
      </PageLayout>
    );
  }
}
