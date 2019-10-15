import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { canBulkEditLaunches } from 'common/utils/permissions';
import { CUSTOMER } from 'common/constants/projectRoles';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { breadcrumbsSelector, restorePathAction } from 'controllers/testItem';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import AddWidgetIcon from 'common/img/add-widget-inline.svg';
import ImportIcon from 'common/img/import-inline.svg';
import RefreshIcon from './img/refresh-inline.svg';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  actionsBtn: {
    id: 'ActionPanel.actionsBtn',
    defaultMessage: 'Actions',
  },
  actionCompare: {
    id: 'ActionPanel.actionCompare',
    defaultMessage: 'Compare',
  },
  proceedButton: {
    id: 'ActionPanel.proceedButton',
    defaultMessage: 'Proceed Valid Items',
  },
  actionsBtnTooltip: {
    id: 'ActionPanel.actionsBtnTooltip',
    defaultMessage: ' Select several items to processing',
  },
});

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
    accountRole: userAccountRoleSelector(state),
    projectRole: activeProjectRoleSelector(state),
  }),
  {
    restorePath: restorePathAction,
  },
)
@injectIntl
@track()
export class ActionPanel extends Component {
  static propTypes = {
    debugMode: PropTypes.bool,
    onRefresh: PropTypes.func,
    selectedLaunches: PropTypes.array,
    hasErrors: PropTypes.bool,
    showBreadcrumb: PropTypes.bool,
    intl: intlShape.isRequired,
    onImportLaunch: PropTypes.func,
    hasValidItems: PropTypes.bool,
    accountRole: PropTypes.string,
    projectRole: PropTypes.string.isRequired,
    onProceedValidItems: PropTypes.func,
    onEditItem: PropTypes.func,
    onEditItems: PropTypes.func,
    onMerge: PropTypes.func,
    onCompare: PropTypes.func,
    onMove: PropTypes.func,
    onForceFinish: PropTypes.func,
    onDelete: PropTypes.func,
    breadcrumbs: PropTypes.arrayOf(breadcrumbDescriptorShape),
    restorePath: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onAddNewWidget: PropTypes.func,
    finishedLaunchesCount: PropTypes.number,
  };

  static defaultProps = {
    debugMode: false,
    onRefresh: () => {},
    selectedLaunches: [],
    hasErrors: false,
    showBreadcrumb: false,
    onImportLaunch: () => {},
    hasValidItems: false,
    onProceedValidItems: () => {},
    onEditItem: () => {},
    onEditItems: () => {},
    onMerge: () => {},
    onCompare: () => {},
    onMove: () => {},
    onForceFinish: () => {},
    onDelete: () => {},
    breadcrumbs: [],
    restorePath: () => {},
    activeFilterId: null,
    onAddNewWidget: () => {},
    finishedLaunchesCount: null,
    accountRole: '',
  };

  onClickActionButton = () =>
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ACTIONS_BTN);

  createActionDescriptors = () => {
    const {
      intl,
      debugMode,
      onMerge,
      onCompare,
      onMove,
      onForceFinish,
      onDelete,
      accountRole,
      projectRole,
      onEditItems,
      onEditItem,
      selectedLaunches,
    } = this.props;

    return [
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.EDIT),
        value: 'action-bulk-edit',
        hidden: debugMode || !canBulkEditLaunches(accountRole, projectRole),
        onClick: () => {
          selectedLaunches.length > 1
            ? onEditItems(selectedLaunches)
            : onEditItem(selectedLaunches[0]);
        },
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.MERGE),
        value: 'action-merge',
        hidden: debugMode,
        onClick: onMerge,
      },
      {
        label: intl.formatMessage(messages.actionCompare),
        value: 'action-compare',
        hidden: debugMode,
        onClick: onCompare,
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_DEBUG),
        value: 'action-move-to-debug',
        hidden: debugMode || projectRole === CUSTOMER,
        onClick: onMove,
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_ALL_LAUNCHES),
        value: 'action-move-to-all',
        hidden: !debugMode,
        onClick: onMove,
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.FORCE_FINISH),
        value: 'action-force-finish',
        onClick: onForceFinish,
      },
      {
        label: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
        value: 'action-delete',
        onClick: onDelete,
      },
    ];
  };
  isShowImportButton = () => {
    const { debugMode, activeFilterId } = this.props;
    return !debugMode && !Number.isInteger(activeFilterId);
  };

  isShowWidgetButton = () => {
    const { activeFilterId } = this.props;
    return Number.isInteger(activeFilterId);
  };

  renderCounterNotification = (number) => <span className={cx('counter')}>{number}</span>;

  render() {
    const {
      intl,
      showBreadcrumb,
      onRefresh,
      hasErrors,
      selectedLaunches,
      hasValidItems,
      onProceedValidItems,
      onImportLaunch,
      breadcrumbs,
      restorePath,
      onAddNewWidget,
      finishedLaunchesCount,
    } = this.props;
    const actionDescriptors = this.createActionDescriptors();

    return (
      <div className={cx('action-panel', { 'right-buttons-only': !showBreadcrumb && !hasErrors })}>
        {showBreadcrumb && <Breadcrumbs descriptors={breadcrumbs} onRestorePath={restorePath} />}
        {hasErrors && (
          <GhostButton disabled={!hasValidItems} onClick={onProceedValidItems}>
            {intl.formatMessage(messages.proceedButton)}
          </GhostButton>
        )}
        <div className={cx('action-buttons')}>
          {this.isShowImportButton() && (
            <div className={cx('action-button', 'mobile-hidden')}>
              <GhostButton icon={ImportIcon} onClick={onImportLaunch}>
                <FormattedMessage id="LaunchesPage.import" defaultMessage="Import" />
              </GhostButton>
            </div>
          )}
          {this.isShowWidgetButton() && (
            <div className={cx('action-button', 'mobile-hidden')}>
              <GhostButton icon={AddWidgetIcon} onClick={onAddNewWidget}>
                <FormattedMessage id="LaunchesPage.addNewWidget" defaultMessage="Add new widget" />
              </GhostButton>
            </div>
          )}
          <div className={cx('action-button', 'mobile-hidden')}>
            <GhostMenuButton
              tooltip={
                !selectedLaunches.length ? intl.formatMessage(messages.actionsBtnTooltip) : null
              }
              title={intl.formatMessage(messages.actionsBtn)}
              items={actionDescriptors}
              disabled={!selectedLaunches.length}
              onClick={this.onClickActionButton}
            />
          </div>
          <div className={cx('action-button')}>
            <GhostButton
              disabled={!!selectedLaunches.length}
              icon={RefreshIcon}
              onClick={onRefresh}
            >
              <FormattedMessage id="LaunchesPage.refresh" defaultMessage="Refresh" />
            </GhostButton>
            {finishedLaunchesCount && this.renderCounterNotification(finishedLaunchesCount)}
          </div>
        </div>
      </div>
    );
  }
}
