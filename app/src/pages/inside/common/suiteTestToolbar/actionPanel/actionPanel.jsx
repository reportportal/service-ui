import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import {
  breadcrumbsSelector,
  restorePathAction,
  levelSelector,
  isListViewSelector,
  namespaceSelector,
} from 'controllers/testItem';
import { HISTORY_PAGE, payloadSelector } from 'controllers/pages';
import { availableBtsIntegrationsSelector, isPostIssueActionAvailable } from 'controllers/project';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { SUITES_PAGE_EVENTS } from 'components/main/analytics/events/suitesPageEvents';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { LEVEL_STEP, LEVEL_SUITE, LEVEL_TEST } from 'common/constants/launchLevels';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import RefreshIcon from 'common/img/refresh-inline.svg';
import HistoryIcon from 'common/img/history-inline.svg';
import DeleteIcon from 'common/img/bin-icon-inline.svg';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  actionsBtn: {
    id: 'ActionPanel.actionsBtn',
    defaultMessage: 'Actions',
  },
  editDefects: {
    id: 'ActionPanel.editDefects',
    defaultMessage: 'Edit defects',
  },
  postIssue: {
    id: 'ActionPanel.postIssue',
    defaultMessage: 'Post issue',
  },
  linkIssue: {
    id: 'ActionPanel.linkIssue',
    defaultMessage: 'Link issue',
  },
  unlinkIssue: {
    id: 'ActionPanel.unlinkIssue',
    defaultMessage: 'Unlink issue',
  },
  ignoreInAA: {
    id: 'ActionPanel.ignoreInAA',
    defaultMessage: 'Ignore in Auto Analysis',
  },
  includeInAA: {
    id: 'ActionPanel.includeInAA',
    defaultMessage: 'Include into Auto Analysis',
  },
  proceedButton: {
    id: 'ActionPanel.proceedButton',
    defaultMessage: 'Proceed Valid Items',
  },
  actionsBtnTooltip: {
    id: 'ActionPanel.actionsBtnTooltip',
    defaultMessage: ' Select several items to processing',
  },
  deleteBtnTooltip: {
    id: 'ActionPanel.deleteBtnTooltip',
    defaultMessage: 'Delete test items in bulk',
  },
  noBugTrackingSystemToLinkIssue: {
    id: 'ActionPanel.noBugTrackingSystemToLinkIssue',
    defaultMessage: 'Configure bug tracking system to link issue',
  },
  noBugTrackingSystemToPostIssue: {
    id: 'ActionPanel.noBugTrackingSystemToPostIssue',
    defaultMessage: 'Configure bug tracking system to post issue',
  },
});

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
    level: levelSelector(state),
    listView: isListViewSelector(state, namespaceSelector(state)),
    payload: payloadSelector(state),
    btsIntegrations: availableBtsIntegrationsSelector(state),
  }),
  {
    restorePath: restorePathAction,
    navigate: (linkAction) => linkAction,
  },
)
@injectIntl
@track()
export class ActionPanel extends Component {
  static propTypes = {
    payload: PropTypes.object.isRequired,
    debugMode: PropTypes.bool,
    onRefresh: PropTypes.func,
    breadcrumbs: PropTypes.arrayOf(breadcrumbDescriptorShape),
    restorePath: PropTypes.func,
    showBreadcrumbs: PropTypes.bool,
    hasErrors: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    hasValidItems: PropTypes.bool,
    level: PropTypes.string,
    onProceedValidItems: PropTypes.func,
    selectedItems: PropTypes.array,
    onEditDefects: PropTypes.func,
    onPostIssue: PropTypes.func,
    onLinkIssue: PropTypes.func,
    onUnlinkIssue: PropTypes.func,
    onIgnoreInAA: PropTypes.func,
    onIncludeInAA: PropTypes.func,
    onDelete: PropTypes.func,
    listView: PropTypes.bool,
    btsIntegrations: PropTypes.array,
    deleteDisabled: PropTypes.bool,
    navigate: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    debugMode: false,
    onRefresh: () => {},
    breadcrumbs: [],
    errors: {},
    restorePath: () => {},
    level: '',
    showBreadcrumbs: true,
    hasErrors: false,
    actionDescriptors: [],
    actionsMenuDisabled: false,
    hasValidItems: false,
    onProceedValidItems: () => {},
    selectedItems: [],
    onEditDefects: () => {},
    onPostIssue: () => {},
    onLinkIssue: () => {},
    onUnlinkIssue: () => {},
    onIgnoreInAA: () => {},
    onIncludeInAA: () => {},
    onDelete: () => {},
    listView: false,
    btsIntegrations: [],
    deleteDisabled: false,
  };

  constructor(props) {
    super(props);
    this.actionDescriptors = this.createActionDescriptors();
  }

  onClickHistory = () => {
    this.props.tracking.trackEvent(
      this.props.level === LEVEL_STEP
        ? STEP_PAGE_EVENTS.HISTORY_BTN
        : SUITES_PAGE_EVENTS.HISTORY_BTN,
    );
    this.props.navigate({ type: HISTORY_PAGE, payload: this.props.payload });
  };

  onClickRefresh = () => {
    this.props.tracking.trackEvent(
      this.props.level === LEVEL_STEP
        ? STEP_PAGE_EVENTS.REFRESH_BTN
        : SUITES_PAGE_EVENTS.REFRESH_BTN,
    );
    this.props.onRefresh();
  };

  createActionDescriptors = () => {
    const isPostIssueUnavailable = !isPostIssueActionAvailable(this.props.btsIntegrations);

    return [
      {
        label: this.props.intl.formatMessage(messages.editDefects),
        value: 'action-edit-defects',
        onClick: (data) => {
          this.props.tracking.trackEvent(STEP_PAGE_EVENTS.EDIT_DEFECT_ACTION);
          this.props.onEditDefects(data);
        },
      },
      {
        label: this.props.intl.formatMessage(messages.postIssue),
        value: 'action-post-issue',
        hidden: this.props.debugMode,
        disabled: isPostIssueUnavailable,
        title:
          (isPostIssueUnavailable &&
            this.props.intl.formatMessage(messages.noBugTrackingSystemToPostIssue)) ||
          '',
        onClick: () => {
          this.props.tracking.trackEvent(STEP_PAGE_EVENTS.POST_BUG_ACTION);
          this.props.onPostIssue();
        },
      },
      {
        label: this.props.intl.formatMessage(messages.linkIssue),
        value: 'action-link-issue',
        hidden: this.props.debugMode,
        disabled: !this.props.btsIntegrations.length,
        title:
          (!this.props.btsIntegrations.length &&
            this.props.intl.formatMessage(messages.noBugTrackingSystemToLinkIssue)) ||
          '',
        onClick: () => {
          this.props.tracking.trackEvent(STEP_PAGE_EVENTS.LOAD_BUG_ACTION);
          this.props.onLinkIssue();
        },
      },
      {
        label: this.props.intl.formatMessage(messages.unlinkIssue),
        value: 'action-unlink-issue',
        hidden: this.props.debugMode,
        onClick: this.props.onUnlinkIssue,
      },
      {
        label: this.props.intl.formatMessage(messages.ignoreInAA),
        value: 'action-ignore-in-AA',
        hidden: this.props.debugMode,
        onClick: this.props.onIgnoreInAA,
      },
      {
        label: this.props.intl.formatMessage(messages.includeInAA),
        value: 'action-include-into-AA',
        hidden: this.props.debugMode,
        onClick: this.props.onIncludeInAA,
      },
      {
        label: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
        value: 'action-delete',
        onClick: this.props.onDelete,
      },
    ];
  };

  checkVisibility = (levels) => levels.some((level) => this.props.level === level);

  render() {
    const {
      breadcrumbs,
      restorePath,
      showBreadcrumbs,
      hasErrors,
      intl,
      hasValidItems,
      onProceedValidItems,
      selectedItems,
      listView,
      debugMode,
      level,
    } = this.props;
    return (
      <div className={cx('action-panel', { 'right-buttons-only': !showBreadcrumbs && !hasErrors })}>
        {showBreadcrumbs && (
          <Breadcrumbs
            togglerEventInfo={level !== LEVEL_STEP ? SUITES_PAGE_EVENTS.PLUS_MINUS_BREADCRUMB : {}}
            breadcrumbEventInfo={
              level !== LEVEL_STEP ? SUITES_PAGE_EVENTS.ITEM_NAME_BREADCRUMB_CLICK : {}
            }
            allEventClick={level !== LEVEL_STEP ? SUITES_PAGE_EVENTS.ALL_LABEL_BREADCRUMB : {}}
            descriptors={breadcrumbs}
            onRestorePath={restorePath}
          />
        )}
        {hasErrors && (
          <GhostButton disabled={!hasValidItems} onClick={onProceedValidItems}>
            {intl.formatMessage(messages.proceedButton)}
          </GhostButton>
        )}
        <div className={cx('action-buttons')}>
          {this.checkVisibility([LEVEL_STEP]) && (
            <div className={cx('action-button', 'mobile-hidden')}>
              <GhostMenuButton
                title={intl.formatMessage(messages.actionsBtn)}
                items={this.actionDescriptors}
                disabled={!selectedItems.length}
              />
            </div>
          )}
          {this.checkVisibility([LEVEL_SUITE, LEVEL_TEST]) && (
            <div className={cx('action-button')}>
              <GhostButton
                icon={DeleteIcon}
                onClick={this.props.onDelete}
                disabled={this.props.deleteDisabled}
                title={
                  this.props.deleteDisabled
                    ? this.props.intl.formatMessage(messages.actionsBtnTooltip)
                    : this.props.intl.formatMessage(messages.deleteBtnTooltip)
                }
              >
                <FormattedMessage id="Common.delete" defaultMessage="Delete" />
              </GhostButton>
            </div>
          )}
          {!listView &&
            !debugMode && (
              <div className={cx('action-button')}>
                <GhostButton icon={HistoryIcon} onClick={this.onClickHistory}>
                  <FormattedMessage id="ActionPanel.history" defaultMessage="History" />
                </GhostButton>
              </div>
            )}
          <div className={cx('action-button')}>
            <GhostButton icon={RefreshIcon} onClick={this.onClickRefresh}>
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
