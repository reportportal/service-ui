import { Component } from 'react';
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
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
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
  includeIntoAA: {
    id: 'ActionPanel.includeIntoAA',
    defaultMessage: 'Include into Auto Analysis',
  },
  proceedButton: {
    id: 'ActionPanel.proceedButton',
    defaultMessage: 'Proceed Valid Items',
  },
});

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
    level: levelSelector(state),
    listView: isListViewSelector(state, namespaceSelector(state)),
  }),
  {
    restorePath: restorePathAction,
  },
)
@injectIntl
export class ActionPanel extends Component {
  static propTypes = {
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
    onIncludeIntoAA: PropTypes.func,
    onDelete: PropTypes.func,
    listView: PropTypes.bool,
  };

  static defaultProps = {
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
    onIncludeIntoAA: () => {},
    onDelete: () => {},
    listView: false,
  };

  constructor(props) {
    super(props);
    this.actionDescriptors = this.createActionDescriptors();
  }

  checkVisibility = (levels) => levels.some((level) => this.props.level === level);

  createActionDescriptors = () => [
    {
      label: this.props.intl.formatMessage(messages.editDefects),
      value: 'action-edit-defects',
      onClick: this.props.onEditDefects,
    },
    {
      label: this.props.intl.formatMessage(messages.postIssue),
      value: 'action-post-issue',
      onClick: this.props.onPostIssue,
    },
    {
      label: this.props.intl.formatMessage(messages.linkIssue),
      value: 'action-link-issue',
      onClick: this.props.onLinkIssue,
    },
    {
      label: this.props.intl.formatMessage(messages.unlinkIssue),
      value: 'action-unlink-issue',
      onClick: this.props.onUnlinkIssue,
    },
    {
      label: this.props.intl.formatMessage(messages.ignoreInAA),
      value: 'action-ignore-in-AA',
      onClick: this.props.onIgnoreInAA,
    },
    {
      label: this.props.intl.formatMessage(messages.includeIntoAA),
      value: 'action-include-into-AA',
      onClick: this.props.onIncludeIntoAA,
    },
    {
      label: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      value: 'action-delete',
      onClick: this.props.onDelete,
    },
  ];

  render() {
    const {
      breadcrumbs,
      onRefresh,
      restorePath,
      showBreadcrumbs,
      hasErrors,
      intl,
      hasValidItems,
      onProceedValidItems,
      selectedItems,
      listView,
    } = this.props;
    return (
      <div className={cx('action-panel', { 'right-buttons-only': !showBreadcrumbs && !hasErrors })}>
        {showBreadcrumbs && <Breadcrumbs descriptors={breadcrumbs} onRestorePath={restorePath} />}
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
              <GhostButton icon={DeleteIcon} disabled>
                <FormattedMessage id="Common.delete" defaultMessage="Delete" />
              </GhostButton>
            </div>
          )}
          {!listView && (
            <div className={cx('action-button')}>
              <GhostButton icon={HistoryIcon} disabled>
                <FormattedMessage id="ActionPanel.history" defaultMessage="History" />
              </GhostButton>
            </div>
          )}
          <div className={cx('action-button')}>
            <GhostButton icon={RefreshIcon} onClick={onRefresh}>
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
