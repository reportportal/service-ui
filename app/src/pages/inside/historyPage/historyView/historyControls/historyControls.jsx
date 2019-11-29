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
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { HISTORY_DEPTH_CONFIG, HISTORY_BASE_DEFAULT_VALUE } from 'controllers/itemsHistory';
import styles from './historyControls.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  depthTitle: {
    id: 'HistoryControls.depthTitle',
    defaultMessage: 'History depth',
  },
  historyBaseTitle: {
    id: 'HistoryControls.historyBaseTitle',
    defaultMessage: 'Base',
  },
  historyBaseAll: {
    id: 'HistoryControls.historyBaseAll',
    defaultMessage: 'All launches',
  },
  historyBaseSameName: {
    id: 'HistoryControls.historyBaseSameName',
    defaultMessage: 'Launches with the same name',
  },
});

@injectIntl
export class HistoryControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    historyDepth: PropTypes.string,
    historyBase: PropTypes.string,
    isTestItemsList: PropTypes.bool,
    onChangeHistoryDepth: PropTypes.func,
    onChangeHistoryBase: PropTypes.func,
  };

  static defaultProps = {
    historyDepth: HISTORY_DEPTH_CONFIG.defaultValue,
    historyBase: HISTORY_BASE_DEFAULT_VALUE,
    isTestItemsList: false,
    onChangeHistoryDepth: () => {},
    onChangeHistoryBase: () => {},
  };

  launchModeOptions = [
    { value: 'table', label: this.props.intl.formatMessage(messages.historyBaseAll) },
    { value: 'line', label: this.props.intl.formatMessage(messages.historyBaseSameName) },
  ];

  render() {
    const {
      intl: { formatMessage },
      historyDepth,
      historyBase,
      isTestItemsList,
      onChangeHistoryDepth,
      onChangeHistoryBase,
    } = this.props;

    return (
      <div className={cx('history-controls')}>
        <div className={cx('controls-wrapper')}>
          <div className={cx('controls-item')}>
            <p className={cx('control-name')}>{formatMessage(messages.depthTitle)}</p>
            <div className={cx('control-container')}>
              <InputDropdown
                options={HISTORY_DEPTH_CONFIG.options}
                value={historyDepth}
                onChange={onChangeHistoryDepth}
              />
            </div>
          </div>

          <div className={cx('controls-item')}>
            <p className={cx('control-name')}>{formatMessage(messages.historyBaseTitle)}</p>
            <div className={cx('control-container', 'large')}>
              <InputDropdown
                options={this.launchModeOptions}
                value={historyBase}
                onChange={onChangeHistoryBase}
                disabled={isTestItemsList}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
