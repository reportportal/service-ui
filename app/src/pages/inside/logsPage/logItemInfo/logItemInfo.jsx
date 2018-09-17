import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import { DefectType } from 'pages/inside/stepPage/stepGrid/defectType';
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
});

@injectIntl
export class LogItemInfo extends Component {
  static propTypes = {
    logItem: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  render() {
    const { formatMessage } = this.props.intl;
    const { logItem } = this.props;

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
              <GhostButton icon={LinkIcon} disabled>
                {formatMessage(messages.linkIssue)}
              </GhostButton>
            </div>
          </div>
        </div>
        <LogItemInfoTabs />
      </div>
    );
  }
}
