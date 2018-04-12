import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import ImportIcon from './img/import-inline.svg';
import RefreshIcon from './img/refresh-inline.svg';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  actionsBtn: {
    id: 'ActionPanel.actionsBtn',
    defaultMessage: 'Actions',
  },
  actionMerge: {
    id: 'ActionPanel.actionMerge',
    defaultMessage: 'Merge',
  },
  actionCompare: {
    id: 'ActionPanel.actionCompare',
    defaultMessage: 'Compare',
  },
  actionMoveToDebug: {
    id: 'ActionPanel.actionMoveToDebug',
    defaultMessage: 'Move to debug',
  },
  actionForceFinish: {
    id: 'ActionPanel.actionForceFinish',
    defaultMessage: 'Force finish',
  },
  actionDelete: {
    id: 'ActionPanel.actionDelete',
    defaultMessage: 'Delete',
  },
});

@injectIntl
export class ActionPanel extends Component {
  static propTypes = {
    hasErrors: PropTypes.bool,
    showBreadcrumb: PropTypes.bool,
    intl: intlShape.isRequired,
  };
  static defaultProps = {
    hasErrors: false,
    showBreadcrumb: false,
  };

  onMerge = () => {};

  onCompare = () => {};

  onMoveToDebug = () => {};

  onForceFinish = () => {};

  onDelete = () => {};

  multipleActions = [
    {
      label: this.props.intl.formatMessage(messages.actionMerge),
      value: 'action-merge',
      onClick: this.onMerge,
    },
    {
      label: this.props.intl.formatMessage(messages.actionCompare),
      value: 'action-compare',
      onClick: this.onCompare,
    },
    {
      label: this.props.intl.formatMessage(messages.actionMoveToDebug),
      value: 'action-move-to-debug',
      onClick: this.onMoveToDebug,
    },
    {
      label: this.props.intl.formatMessage(messages.actionForceFinish),
      value: 'action-force-finish',
      onClick: this.onForceFinish,
    },
    {
      label: this.props.intl.formatMessage(messages.actionDelete),
      value: 'action-delete',
      onClick: this.onDelete,
    },
  ];

  render() {
    const { intl, showBreadcrumb, hasErrors } = this.props;
    return (
      <div className={cx('action-panel')}>
        {showBreadcrumb ? <div className={cx('breadcrumb')} /> : <div />}
        {hasErrors && <GhostButton>Proceed Valid Items</GhostButton>}
        <div className={cx('action-buttons')}>
          <div className={cx('action-button', 'mobile-hidden')}>
            <GhostButton icon={ImportIcon} disabled>
              <FormattedMessage id="LaunchesPage.import" defaultMessage="Import" />
            </GhostButton>
          </div>
          <div className={cx('action-button', 'mobile-hidden')}>
            <GhostMenuButton
              title={intl.formatMessage(messages.actionsBtn)}
              items={this.multipleActions}
            />
          </div>
          <div className={cx('action-button')}>
            <GhostButton icon={RefreshIcon} disabled>
              <FormattedMessage id="LaunchesPage.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
