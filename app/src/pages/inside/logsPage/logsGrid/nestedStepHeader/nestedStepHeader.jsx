/*
 * Copyright 2019 EPAM Systems
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

import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import track from 'react-tracking';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { DurationBlock } from 'pages/inside/common/durationBlock';
import ArrowIcon from 'common/img/arrow-right-inline.svg';
import AttachmentIcon from 'common/img/attachment-inline.svg';
import { TestItemStatus } from 'pages/inside/common/testItemStatus';
import { MarkdownViewer } from 'components/main/markdown';
import classNames from 'classnames/bind';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import styles from './nestedStepHeader.scss';

const cx = classNames.bind(styles);

@track()
export class NestedStepHeader extends Component {
  static propTypes = {
    data: PropTypes.object,
    collapsed: PropTypes.bool,
    onToggle: PropTypes.func,
    level: PropTypes.number,
    loading: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    markdownMode: PropTypes.bool,
  };

  static defaultProps = {
    data: {},
    collapsed: false,
    onToggle: () => {},
    level: 0,
    loading: false,
    markdownMode: false,
  };

  onToggle = () => {
    const { onToggle, collapsed } = this.props;
    if (collapsed) this.props.tracking.trackEvent(LOG_PAGE_EVENTS.NESTED_STEP_EXPAND);
    onToggle();
  };

  isAttachmentCountVisible = () => {
    const {
      data: { attachmentsCount = 0 },
    } = this.props;
    return attachmentsCount > 0;
  };

  renderName = () => {
    const {
      data,
      data: { hasContent = false },
      loading,
      collapsed,
      markdownMode,
    } = this.props;
    const name = markdownMode ? <MarkdownViewer value={data.name} /> : data.name;
    if (hasContent) {
      return (
        <div className={cx('step-name')} onClick={this.onToggle}>
          <div className={cx('arrow-icon', { expanded: !collapsed })}>
            {loading ? <SpinningPreloader /> : Parser(ArrowIcon)}
          </div>
          <div>{name}</div>
        </div>
      );
    }
    return (
      <div className={cx('step-name', 'step-name-static')}>
        <div>{name}</div>
      </div>
    );
  };

  render() {
    const { data, level } = this.props;
    return (
      <div className={cx('header-container')}>
        <div
          className={cx('row', {
            [`level-${level}`]: level !== 0,
          })}
        >
          <div
            className={cx('first-col-wrapper', 'row-cell', {
              [`level-${level}`]: level !== 0,
            })}
          >
            {this.renderName()}
          </div>
          <div className={cx('row-cell')} />
          <div className={cx('row-cell', 'status-container')}>
            <TestItemStatus status={data.status} />
          </div>
          <div className={cx('row-cell')}>
            <div className={cx('statistics')}>
              <div className={cx('attachments')}>
                {this.isAttachmentCountVisible() && (
                  <Fragment>
                    <div className={cx('attachment-icon')}>{Parser(AttachmentIcon)}</div>
                    <div className={cx('attachment-count')}>{data.attachmentsCount}</div>
                  </Fragment>
                )}
              </div>
              <div>
                <DurationBlock
                  type={data.type}
                  status={data.status}
                  itemNumber={data.number}
                  timing={{
                    start: data.startTime,
                    end: data.endTime,
                    approxTime: data.approximateDuration,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
