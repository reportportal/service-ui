import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { DurationBlock } from 'pages/inside/common/itemInfo/durationBlock';
import { TagsBlock } from 'pages/inside/common/itemInfo/tagsBlock';
import { MarkdownViewer } from 'components/main/markdown';
import { AbsRelTime } from 'components/main/absRelTime';
import { formatMethodType, formatStatus } from 'common/utils/localizationUtils';
import styles from './logItemDetails.scss';

const cx = classNames.bind(styles);

@injectIntl
export class LogItemDetails extends Component {
  static propTypes = {
    logItem: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  render() {
    const { logItem, intl } = this.props;

    return (
      <div className={cx('container')}>
        <div className={cx('type-column', 'column')}>
          <span className={cx('type')}>{formatMethodType(intl.formatMessage, logItem.type)}</span>
        </div>
        <div className={cx('body-column', 'column')}>
          <div className={cx('name')}>{logItem.name}</div>
          <div className={cx('attributes')}>
            <span className={cx('attribute')}>
              <DurationBlock
                type={logItem.type}
                status={logItem.status}
                itemNumber={logItem.number}
                timing={{
                  start: logItem.start_time,
                  end: logItem.end_time,
                  approxTime: logItem.approximateDuration,
                }}
              />
            </span>
            {logItem.growthDuration && (
              <span className={cx('attribute')}>
                <span className={cx('growth-duration')}>{logItem.growthDuration}</span>
              </span>
            )}
            {logItem.tags &&
              !!logItem.tags.length && (
                <span className={cx('attribute')}>
                  <TagsBlock tags={logItem.tags} />
                </span>
              )}
          </div>
          <div className={cx('description')}>
            <MarkdownViewer value={logItem.description} />
          </div>
        </div>
        <div className={cx('status-column', 'column')}>
          <span className={cx('status')}>{formatStatus(intl.formatMessage, logItem.status)}</span>
        </div>
        <div className={cx('time-column', 'column')}>
          <span className={cx('time')}>
            <AbsRelTime startTime={logItem.start_time} />
          </span>
        </div>
      </div>
    );
  }
}
