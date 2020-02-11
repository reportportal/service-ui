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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { DurationBlock } from 'pages/inside/common/durationBlock';
import { AttributesBlock } from 'pages/inside/common/itemInfo/attributesBlock';
import { MarkdownViewer } from 'components/main/markdown';
import { AbsRelTime } from 'components/main/absRelTime';
import { formatMethodType, formatStatus } from 'common/utils/localizationUtils';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { TestParameters } from 'pages/inside/common/testParameters';
import Parser from 'html-react-parser';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import styles from './logItemDetails.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  description: {
    id: 'TestItemDetailsModal.description',
    defaultMessage: 'Description:',
  },
  codeRef: {
    id: 'TestItemDetailsModal.codeRef',
    defaultMessage: 'Code reference:',
  },
  parametersLabel: {
    id: 'TestItemDetailsModal.parametersLabel',
    defaultMessage: 'Parameters:',
  },
});

@injectIntl
export class LogItemDetails extends Component {
  static propTypes = {
    logItem: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
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
          <div className={cx('info-line')}>
            <span className={cx('attribute', 'status')}>
              {formatStatus(intl.formatMessage, logItem.status)}
            </span>
            <span className={cx('attribute', 'time')}>
              <AbsRelTime startTime={logItem.startTime} />
            </span>
          </div>
          <div className={cx('info-line', 'attributes')}>
            <span className={cx('attribute')}>
              <DurationBlock
                type={logItem.type}
                status={logItem.status}
                itemNumber={logItem.number}
                timing={{
                  start: logItem.startTime,
                  end: logItem.endTime,
                  approxTime: logItem.approximateDuration,
                }}
              />
            </span>
            {logItem.growthDuration && (
              <span className={cx('attribute')}>
                <span className={cx('growth-duration')}>{logItem.growthDuration}</span>
              </span>
            )}
            {logItem.attributes && !!logItem.attributes.length && (
              <span className={cx('attribute')}>
                <AttributesBlock attributes={logItem.attributes} />
              </span>
            )}
          </div>
          {logItem.codeRef && (
            <div className={cx('code-ref')} title={logItem.codeRef}>
              <span className={cx('label', 'code-ref-label')}>
                {intl.formatMessage(messages.codeRef)}
              </span>
              <span className={cx('label')}>{logItem.codeRef}</span>
              <CopyToClipboard text={logItem.codeRef} className={cx('copy')}>
                {Parser(IconDuplicate)}
              </CopyToClipboard>
            </div>
          )}
          <div className={cx('label')}>{intl.formatMessage(messages.description)}</div>
          <div className={cx('description')}>
            <MarkdownViewer value={logItem.description} />
          </div>
        </div>
        <div className={cx('parameters-column', 'column')}>
          <div className={cx('label')}>{intl.formatMessage(messages.parametersLabel)}</div>
          <ScrollWrapper autoHeight autoHeightMax={210}>
            <TestParameters parameters={logItem.parameters} />
          </ScrollWrapper>
        </div>
      </div>
    );
  }
}
