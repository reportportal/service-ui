import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import { DefectType } from 'pages/inside/stepPage/stepGrid/defectType';
import { linkIssueAction } from 'controllers/step';
import { activeLogSelector } from 'controllers/log';
import { externalSystemSelector } from 'controllers/project';
import LinkIcon from 'common/img/link-inline.svg';
import DownLeftArrowIcon from 'common/img/down-left-arrow-inline.svg';
import BugIcon from 'common/img/bug-inline.svg';
import { LogItemInfoTabs } from './logItemInfoTabs';
import styles from './logItemInfo.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  copyDefect: {
    id: 'LogItemInfo.copyDefect',
    defaultMessage: 'Copy defect',
  },
  postIssue: {
    id: 'LogItemInfo.postIssue',
    defaultMessage: 'Post issue',
  },
  linkIssue: {
    id: 'LogItemInfo.linkIssue',
    defaultMessage: 'Link issue',
  },
  noBugTrackingSystemToLinkIssue: {
    id: 'LogItemInfo.noBugTrackingSystemToLinkIssue',
    defaultMessage: 'Configure bug tracking system to link issue',
  },
  noDefectTypeToLinkIssue: {
    id: 'LogItemInfo.noDefectTypeToLinkIssue',
    defaultMessage: "You can't link issue if item has no defect type",
  },
});

@connect(
  (state) => ({
    logItem: activeLogSelector(state),
    externalSystems: externalSystemSelector(state),
  }),
  {
    linkIssueAction,
  },
)
@injectIntl
export class LogItemInfo extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    linkIssueAction: PropTypes.func.isRequired,
    externalSystems: PropTypes.array.isRequired,
    fetchFunc: PropTypes.func.isRequired,
    logItem: PropTypes.object,
  };
  static defaultProps = {
    logItem: {},
  };

  getLinkIssueTitle = () => {
    const {
      logItem,
      externalSystems,
      intl: { formatMessage },
    } = this.props;
    let title = '';

    if (!externalSystems.length) {
      title = formatMessage(messages.noBugTrackingSystemToLinkIssue);
    }
    if (!logItem.issue) {
      title = formatMessage(messages.noDefectTypeToLinkIssue);
    }

    return title;
  };

  handleLinkIssue = () => {
    this.props.linkIssueAction([this.props.logItem], {
      fetchFunc: this.props.fetchFunc,
    });
  };

  render() {
    const {
      logItem,
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={cx('container')}>
        <div className={cx('content')}>
          <div className={cx('description')}>
            {logItem.issue && <DefectType issue={logItem.issue} />}
          </div>
          <div className={cx('actions')}>
            <div className={cx('action')}>
              <GhostButton icon={DownLeftArrowIcon} disabled>
                {formatMessage(messages.copyDefect)}
              </GhostButton>
            </div>
            <div className={cx('action')}>
              <GhostButton icon={BugIcon} disabled>
                {formatMessage(messages.postIssue)}
              </GhostButton>
            </div>
            <div className={cx('action')}>
              <GhostButton
                onClick={this.handleLinkIssue}
                icon={LinkIcon}
                disabled={!logItem.issue || !this.props.externalSystems.length}
                title={this.getLinkIssueTitle()}
              >
                {formatMessage(messages.linkIssue)}
              </GhostButton>
            </div>
          </div>
        </div>
        <LogItemInfoTabs logItem={logItem} />
      </div>
    );
  }
}
