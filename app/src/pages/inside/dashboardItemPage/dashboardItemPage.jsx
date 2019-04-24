import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Fullscreen from 'react-full-screen';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { canResizeAndDragWidgets } from 'common/utils/permissions';
import {
  activeDashboardItemSelector,
  fetchDashboardAction,
  updateDashboardWidgetsAction,
  dashboardFullScreenModeSelector,
  changeFullScreenModeAction,
  toggleFullScreenModeAction,
} from 'controllers/dashboard';
import { userInfoSelector, activeProjectSelector } from 'controllers/user';
import { PROJECT_DASHBOARD_PAGE } from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { hideScreenLockAction } from 'controllers/screenLock';
import { GhostButton } from 'components/buttons/ghostButton';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { DashboardPageHeader } from 'pages/inside/common/dashboardPageHeader';
import GlobeIcon from 'common/img/globe-icon-inline.svg';
import AddWidgetIcon from './img/add-inline.svg';
import AddSharedWidgetIcon from './img/add-shared-inline.svg';
import EditIcon from './img/edit-inline.svg';
import CancelIcon from './img/cancel-inline.svg';
import FullscreenIcon from './img/full-screen-inline.svg';
import styles from './dashboardItemPage.scss';
import { WidgetsGrid } from './widgetsGrid';

const cx = classNames.bind(styles);

const messages = defineMessages({
  pageTitle: {
    id: 'DashboardPage.title',
    defaultMessage: 'All Dashboards',
  },
  addNewWidget: {
    id: 'DashboardItemPage.addNewWidget',
    defaultMessage: 'Add new widget',
  },
  addSharedWidget: {
    id: 'DashboardItemPage.addSharedWidget',
    defaultMessage: 'Add shared widget',
  },
  editDashboard: {
    id: 'DashboardItemPage.editDashboard',
    defaultMessage: 'Edit',
  },
  delete: {
    id: 'DashboardItemPage.delete',
    defaultMessage: 'Delete',
  },
  fullscreen: {
    id: 'DashboardItemPage.fullscreen',
    defaultMessage: 'Full screen',
  },
  addWidgetSuccess: {
    id: 'DashboardItemPage.addWidgetSuccess',
    defaultMessage: 'Widget has been added',
  },
  sharedWidgetCaption: {
    id: 'DashboardItemPage.sharedWidgetCaption',
    defaultMessage: 'Dashboard has been shared by',
  },
});

@injectIntl
@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
    dashboard: activeDashboardItemSelector(state),
    userInfo: userInfoSelector(state),
    fullScreenMode: dashboardFullScreenModeSelector(state),
  }),
  {
    showModalAction,
    fetchDashboardAction,
    updateDashboardWidgetsAction,
    showNotification,
    hideScreenLockAction,
    changeFullScreenModeAction,
    toggleFullScreenModeAction,
  },
)
@track()
export class DashboardItemPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showModalAction: PropTypes.func.isRequired,
    fetchDashboardAction: PropTypes.func.isRequired,
    updateDashboardWidgetsAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
    dashboard: PropTypes.object.isRequired,
    userInfo: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    fullScreenMode: PropTypes.bool,
    changeFullScreenModeAction: PropTypes.func.isRequired,
    toggleFullScreenModeAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    currentDashboard: {},
    fullScreenMode: false,
  };

  onConfirm = (widget, closeModal) => {
    const {
      intl: { formatMessage },
      activeProject,
      dashboard,
    } = this.props;

    return fetch(URLS.addDashboardWidget(activeProject, dashboard.id), {
      method: 'put',
      data: { addWidget: widget },
    })
      .then(() => {
        const oldWidgets = dashboard.widgets;
        const newWidgets = oldWidgets.map((item) => ({
          ...item,
          widgetPosition: {
            ...item.widgetPosition,
            positionY: item.widgetPosition.positionY + widget.widgetSize.height,
          },
        }));
        newWidgets.unshift(widget);

        return this.props.updateDashboardWidgetsAction({
          ...this.props.dashboard,
          widgets: newWidgets,
        });
      })
      .then(() => {
        this.props.hideScreenLockAction();
        closeModal();
        this.props.showNotification({
          message: formatMessage(messages.addWidgetSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch((err) => {
        this.props.hideScreenLockAction();
        this.props.showNotification({ message: err.message, type: NOTIFICATION_TYPES.ERROR });
      });
  };

  getBreadcrumbs = () => {
    const { activeProject, intl } = this.props;
    return [
      {
        title: intl.formatMessage(messages.pageTitle),
        link: {
          type: PROJECT_DASHBOARD_PAGE,
          payload: { projectId: activeProject },
        },
      },
      {
        title: this.getDashboardName(),
      },
    ];
  };

  getDashboardName = () => (this.props.dashboard && this.props.dashboard.name) || '';

  toggleFullscreen = () => {
    this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.FULL_SCREEN_BTN);
    this.props.toggleFullScreenModeAction();
  };
  showWidgetWizard = () => {
    this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.ADD_NEW_WIDGET_BTN);
    this.props.showModalAction({
      id: 'widgetWizardModal',
      data: {
        onConfirm: this.onConfirm,
        eventsInfo: {
          closeIcon: DASHBOARD_PAGE_EVENTS.CLOSE_ICON_ADD_WIDGET_MODAL,
          chooseWidgetType: DASHBOARD_PAGE_EVENTS.CHOOSE_WIDGET_TYPE_ADD_WIDGET_MODAL,
          nextStep: DASHBOARD_PAGE_EVENTS.NEXT_STEP_ADD_WIDGET_MODAL,
          prevStep: DASHBOARD_PAGE_EVENTS.PREVIOUS_STEP_ADD_WIDGET_MODAL,
          changeDescription: DASHBOARD_PAGE_EVENTS.ENTER_WIDGET_DESCRIPTION_ADD_WIDGET_MODAL,
          shareWidget: DASHBOARD_PAGE_EVENTS.SHARE_WIDGET_ADD_WIDGET_MODAL,
          addWidget: DASHBOARD_PAGE_EVENTS.ADD_BTN_ADD_WIDGET_MODAL,
        },
      },
    });
  };

  showAddSharedWidgetModal = () => {
    this.props.showModalAction({
      id: 'addSharedWidgetModal',
      data: {
        onConfirm: this.onConfirm,
        currentDashboard: this.props.dashboard,
      },
    });
  };

  checkIfWidgetsModifiable = () => {
    const { userInfo, activeProject, dashboard } = this.props;
    const isOwner = dashboard.owner === userInfo.userId;
    const projectRole =
      userInfo.assignedProjects[activeProject] &&
      userInfo.assignedProjects[activeProject].projectRole;

    return canResizeAndDragWidgets(userInfo.userRole, projectRole, isOwner);
  };

  hasOwnerActions() {
    const { dashboard, userInfo } = this.props;

    return dashboard.owner === userInfo.userId;
  }

  render() {
    const {
      intl: { formatMessage },
      dashboard,
      fullScreenMode,
      changeFullScreenModeAction: changeFullScreenMode,
    } = this.props;

    const isOwner = this.hasOwnerActions();

    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()}>
          <DashboardPageHeader />
        </PageHeader>
        <PageSection>
          <div className={cx('dashboard-item')}>
            <div className={cx('buttons-container')}>
              <div className={cx('nav-left')}>
                {isOwner ? (
                  <Fragment>
                    <GhostButton icon={AddWidgetIcon} onClick={this.showWidgetWizard}>
                      {formatMessage(messages.addNewWidget)}
                    </GhostButton>

                    <GhostButton icon={AddSharedWidgetIcon} onClick={this.showAddSharedWidgetModal}>
                      {formatMessage(messages.addSharedWidget)}
                    </GhostButton>
                  </Fragment>
                ) : (
                  <div className={cx('shared-caption')}>
                    <span className={cx('globe-icon')}>{Parser(GlobeIcon)}</span>
                    {formatMessage(messages.sharedWidgetCaption)} {dashboard.owner}
                  </div>
                )}
              </div>
              <div className={cx('nav-right')}>
                {isOwner && (
                  <GhostButton icon={EditIcon}>{formatMessage(messages.editDashboard)}</GhostButton>
                )}

                <GhostButton icon={FullscreenIcon} onClick={this.toggleFullscreen}>
                  {formatMessage(messages.fullscreen)}
                </GhostButton>

                {isOwner && (
                  <GhostButton icon={CancelIcon}>{formatMessage(messages.delete)}</GhostButton>
                )}
              </div>
            </div>
            <Fullscreen enabled={fullScreenMode} onChange={changeFullScreenMode}>
              <WidgetsGrid
                isModifiable={this.checkIfWidgetsModifiable()}
                dashboard={dashboard}
                isFullscreen={fullScreenMode}
                showWidgetWizard={this.showWidgetWizard}
              />
              {fullScreenMode && (
                <i className={cx('icon-close')} onClick={this.toggleFullscreen}>
                  {Parser(CancelIcon)}
                </i>
              )}
            </Fullscreen>
          </div>
        </PageSection>
      </PageLayout>
    );
  }
}
