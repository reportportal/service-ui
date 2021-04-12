/*
 * Copyright 2021 EPAM Systems
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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { activeProjectSelector } from 'controllers/user';
import { fetch, getDuration } from 'common/utils';
import { URLS } from 'common/urls';
import { statusLocalization } from 'common/constants/localization/statusLocalization';
import { IN_PROGRESS, NOT_FOUND } from 'common/constants/testStatuses';
import { DottedPreloader } from 'components/preloaders/dottedPreloader';
import BugIcon from 'common/img/bug-inline.svg';
import CommentIcon from 'common/img/comment-inline.svg';
import { DefectTypeItem } from 'pages/inside/common/defectTypeItem';
import { Triangles } from '../triangles';
import styles from './historyLineItemTooltip.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  launch: {
    id: 'HistoryLineItemTooltip.launch',
    defaultMessage: 'Launch',
  },
  launchAttributes: {
    id: 'HistoryLineItemTooltip.launchAttributes',
    defaultMessage: 'Launch attributes:',
  },
  defectType: {
    id: 'HistoryLineItemTooltip.defectType',
    defaultMessage: 'Defect Type:',
  },
  duration: {
    id: 'HistoryLineItemTooltip.duration',
    defaultMessage: 'Duration:',
  },
  comment: {
    id: 'HistoryLineItemTooltip.comment',
    defaultMessage: 'Comment Included',
  },
  bts: {
    id: 'HistoryLineItemTooltip.bts',
    defaultMessage: 'BTS Links Included',
  },
  lauchName: {
    id: 'HistoryLineItemTooltip.launchName',
    defaultMessage: 'Launch Name',
  },
});

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
@injectIntl
export class HistoryLineItemTooltip extends Component {
  static propTypes = {
    testItem: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    updateLaunchAttributes: PropTypes.func,
    includeAllLaunches: PropTypes.bool,
  };

  static defaultProps = {
    updateHistoryItemLaunchAttributes: () => {},
  };

  state = {
    loading: false,
  };

  componentDidMount() {
    const { launchAttributes } = this.props.testItem;

    if (!launchAttributes) {
      this.fetchLaunch();
    }
  }

  fetchLaunch = () => {
    const { activeProject, testItem } = this.props;
    const { launchId } = testItem;
    this.setState({ loading: true });

    fetch(URLS.launch(activeProject, launchId))
      .then((launch) => {
        this.props.updateLaunchAttributes(launch);
        this.setState({ loading: false });
      })
      .catch(() => this.setState({ loading: false }));
  };

  renderAttributes = () => {
    const {
      intl: { formatMessage },
      testItem,
    } = this.props;
    const { launchAttributes } = testItem;
    const { loading } = this.state;

    if (loading) {
      return (
        <div className={cx('loader')}>
          <DottedPreloader />
        </div>
      );
    }

    return (
      launchAttributes &&
      launchAttributes.length && (
        <div className={cx('attributes-block')}>
          <span className={cx('title')}>{formatMessage(messages.launchAttributes)}</span>
          {launchAttributes.map((attribute) => {
            return (
              <span className={cx('attribute-item')}>
                {attribute.key && `${attribute.key}: `}
                {attribute.value}
              </span>
            );
          })}
        </div>
      )
    );
  };

  render() {
    const {
      intl: { formatMessage },
      testItem,
      includeAllLaunches,
    } = this.props;
    const { issue, pathNames, status, startTime, endTime, growthDuration } = testItem;
    return (
      <div className={cx('history-line-item-tooltip')}>
        <span className={cx('launch')}>
          {formatMessage(messages.launch)} #{pathNames.launchPathName.number}:
          <span className={cx('status', `status-${status.toLowerCase()}`)}>
            {statusLocalization[status] ? formatMessage(statusLocalization[status]) : status}
          </span>
        </span>
        {includeAllLaunches && (
          <div className={cx('launch-name-block')}>
            <span className={cx('title')}>{formatMessage(messages.lauchName)}:</span>
            <span className={cx('launch-name-value')}>
              {pathNames.launchPathName.name} #{pathNames.launchPathName.number}
            </span>
          </div>
        )}
        {this.renderAttributes()}
        {issue && issue.issueType && (
          <div className={cx('defect-type-block')}>
            <span className={cx('title')}>{formatMessage(messages.defectType)}</span>
            <DefectTypeItem
              type={issue.issueType}
              noBorder
              onClick={null}
              className={cx('defect-item')}
            />
          </div>
        )}
        {status !== NOT_FOUND && status !== IN_PROGRESS && (
          <div className={cx('duration-block')}>
            <span className={cx('title')}>{formatMessage(messages.duration)}</span>
            {getDuration(startTime, endTime, true)}
            {growthDuration && (
              <span className={cx('growth-duration')}>
                <Triangles growthDuration={growthDuration} />
                <span className={cx('value')}>+{growthDuration}%</span>
              </span>
            )}
          </div>
        )}
        {issue && issue.comment && (
          <div className={cx('defect-asset', 'comment')}>
            <span className={cx('icon')}>{Parser(CommentIcon)}</span>
            {formatMessage(messages.comment)}
          </div>
        )}
        {issue &&
          issue.issueType &&
          issue.externalSystemIssues &&
          !!issue.externalSystemIssues.length && (
            <div className={cx('defect-asset')}>
              <span className={cx('icon')}>{Parser(BugIcon)}</span>
              {formatMessage(messages.bts)}
            </div>
          )}
      </div>
    );
  }
}
