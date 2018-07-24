import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import { breadcrumbsSelector, restorePathAction, levelSelector } from 'controllers/testItem';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { LEVEL_STEP, LEVEL_SUITE, LEVEL_TEST } from 'common/constants/launchLevels';
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
  actionEditDefects: {
    id: 'ActionPanel.editDefects',
    defaultMessage: 'Edit defects',
  },
  actionPostIssue: {
    id: 'ActionPanel.postIssue',
    defaultMessage: 'Post issue',
  },
  actionLinkIssue: {
    id: 'ActionPanel.linkIssue',
    defaultMessage: 'Link issue',
  },
  actionUnlinkIssue: {
    id: 'ActionPanel.unlinkIssue',
    defaultMessage: 'Unlink issue',
  },
  actionIgnoreInAA: {
    id: 'ActionPanel.ignoreInAA',
    defaultMessage: 'Ignore in Auto Analysis',
  },
  actionIncludeIntoAA: {
    id: 'ActionPanel.includeIntoAA',
    defaultMessage: 'Include into Auto Analysis',
  },
  actionDelete: {
    id: 'ActionPanel.delete',
    defaultMessage: 'Delete',
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
  };

  constructor(props) {
    super(props);
    this.actionDescriptors = this.createActionDescriptors();
  }

  checkVisibility = (levels) => levels.some((level) => this.props.level === level);

  createActionDescriptors = () => [
    {
      label: this.props.intl.formatMessage(messages.actionEditDefects),
      value: 'action-edit-defects',
      onClick: this.props.onEditDefects,
    },
    {
      label: this.props.intl.formatMessage(messages.actionPostIssue),
      value: 'action-post-issue',
      onClick: this.props.onPostIssue,
    },
    {
      label: this.props.intl.formatMessage(messages.actionLinkIssue),
      value: 'action-link-issue',
      onClick: this.props.onLinkIssue,
    },
    {
      label: this.props.intl.formatMessage(messages.actionUnlinkIssue),
      value: 'action-unlink-issue',
      onClick: this.props.onUnlinkIssue,
    },
    {
      label: this.props.intl.formatMessage(messages.actionIgnoreInAA),
      value: 'action-ignore-in-AA',
      onClick: this.props.onIgnoreInAA,
    },
    {
      label: this.props.intl.formatMessage(messages.actionIncludeIntoAA),
      value: 'action-include-into-AA',
      onClick: this.props.onIncludeIntoAA,
    },
    {
      label: this.props.intl.formatMessage(messages.actionDelete),
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
                Delete
              </GhostButton>
            </div>
          )}
          <div className={cx('action-button')}>
            <GhostButton icon={HistoryIcon} disabled>
              History
            </GhostButton>
          </div>
          <div className={cx('action-button')}>
            <GhostButton icon={RefreshIcon} onClick={onRefresh}>
              Refresh
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
