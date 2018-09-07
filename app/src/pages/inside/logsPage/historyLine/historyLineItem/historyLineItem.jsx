import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Link from 'redux-first-router-link';
import classNames from 'classnames/bind';
import { payloadSelector, PROJECT_LOG_PAGE, PROJECT_USERDEBUG_LOG_PAGE } from 'controllers/pages';
import { MANY, NOT_FOUND } from 'common/constants/launchStatuses';
import { debugModeSelector } from 'controllers/launch';
import { HistoryLineItemContent } from './historyLineItemContent';
import styles from './historyLineItem.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  pagePayload: payloadSelector(state),
  debugMode: debugModeSelector(state),
}))
@injectIntl
export class HistoryLineItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    launchNumber: PropTypes.string.isRequired,
    pathNames: PropTypes.object,
    launchId: PropTypes.string,
    id: PropTypes.string,
    status: PropTypes.string,
    active: PropTypes.bool,
    isFirstItem: PropTypes.bool,
    isLastItem: PropTypes.bool,
    pagePayload: PropTypes.object,
    debugMode: PropTypes.bool,
  };

  static defaultProps = {
    pathNames: {},
    launchId: '',
    id: '',
    status: '',
    active: false,
    isFirstItem: false,
    isLastItem: false,
    debugMode: false,
    pagePayload: {},
  };

  checkIfTheLinkIsActive = () => {
    const { status, isLastItem } = this.props;

    return !(status === NOT_FOUND.toUpperCase() || status === MANY.toUpperCase() || isLastItem);
  };

  createHistoryLineItemLink = () => {
    const { id, pagePayload, pathNames, launchId, debugMode } = this.props;

    const parentIds = Object.keys(pathNames);

    return {
      type: debugMode ? PROJECT_USERDEBUG_LOG_PAGE : PROJECT_LOG_PAGE,
      payload: {
        ...pagePayload,
        testItemIds: [launchId, ...parentIds, id].join('/'),
      },
    };
  };

  render() {
    const { launchNumber, active, ...rest } = this.props;

    return (
      <div className={cx('history-line-item', { active })}>
        <Link
          className={cx('history-line-item-title', {
            'active-link': this.checkIfTheLinkIsActive(),
          })}
          to={this.checkIfTheLinkIsActive() ? this.createHistoryLineItemLink() : ''}
        >
          <span className={cx('launch-title')}>{'launch '}</span>
          <span>#{launchNumber}</span>
        </Link>
        <HistoryLineItemContent
          active={active}
          launchNumber={launchNumber}
          hasChilds={rest.has_childs}
          startTime={rest.start_time}
          endTime={rest.end_time}
          {...rest}
        />
      </div>
    );
  }
}
