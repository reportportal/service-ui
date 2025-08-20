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
import { Input } from 'components/inputs/input';
import {
  HISTORY_DEPTH_CONFIG,
  HISTORY_BASE_DEFAULT_VALUE,
  HISTORY_BASE_ALL_LAUNCHES,
  HISTORY_BASE_LAUNCHES_WITH_THE_SAME_NAME,
} from 'controllers/itemsHistory/constants';
import { CELL_PREVIEW_CONFIG, CELL_PREVIEW_ATTRIBUTE } from '../constants';
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
  cellPreviewTitle: {
    id: 'HistoryControls.cellPreviewTitle',
    defaultMessage: 'Cell preview',
  },
  keyTitle: {
    id: 'HistoryControls.keyTitle',
    defaultMessage: 'Attribute Key',
  },
  highlightLessThanTitle: {
    id: 'HistoryControls.highlightLessThanTitle',
    defaultMessage: 'Highlight less than',
  },
  keyPlaceholder: {
    id: 'HistoryControls.keyPlaceholder',
    defaultMessage: 'Enter attribute key',
  },
  highlightLessThanPlaceholder: {
    id: 'HistoryControls.highlightLessThanPlaceholder',
    defaultMessage: 'Enter threshold',
  },
});

@injectIntl
export class HistoryControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    historyDepth: PropTypes.string,
    historyBase: PropTypes.string,
    cellPreview: PropTypes.string,
    attributeKey: PropTypes.string,
    highlightLessThan: PropTypes.string,
    isTestItemsList: PropTypes.bool,
    onChangeHistoryDepth: PropTypes.func,
    onChangeHistoryBase: PropTypes.func,
    onChangeCellPreview: PropTypes.func,
    onChangeAttributeKey: PropTypes.func,
    onChangeHighlightLessThan: PropTypes.func,
  };

  static defaultProps = {
    historyDepth: HISTORY_DEPTH_CONFIG.defaultValue,
    historyBase: HISTORY_BASE_DEFAULT_VALUE,
    cellPreview: CELL_PREVIEW_CONFIG.defaultValue,
    attributeKey: '',
    highlightLessThan: '',
    isTestItemsList: false,
    onChangeHistoryDepth: () => {},
    onChangeHistoryBase: () => {},
    onChangeCellPreview: () => {},
    onChangeAttributeKey: () => {},
    onChangeHighlightLessThan: () => {},
  };

  launchModeOptions = [
    {
      value: HISTORY_BASE_ALL_LAUNCHES,
      label: this.props.intl.formatMessage(messages.historyBaseAll),
    },
    {
      value: HISTORY_BASE_LAUNCHES_WITH_THE_SAME_NAME,
      label: this.props.intl.formatMessage(messages.historyBaseSameName),
    },
  ];

  handleHighlightLessThanChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      this.props.onChangeHighlightLessThan(value);
    }
  };

  render() {
    const {
      intl: { formatMessage },
      historyDepth,
      historyBase,
      cellPreview,
      attributeKey,
      highlightLessThan,
      isTestItemsList,
      onChangeHistoryDepth,
      onChangeHistoryBase,
      onChangeCellPreview,
      onChangeAttributeKey,
    } = this.props;

    const isAttributeMode = cellPreview === CELL_PREVIEW_ATTRIBUTE;

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

          <div className={cx('controls-item')}>
            <p className={cx('control-name')}>{formatMessage(messages.cellPreviewTitle)}</p>
            <div className={cx('control-container', 'medium')}>
              <InputDropdown
                options={CELL_PREVIEW_CONFIG.options}
                value={cellPreview}
                onChange={onChangeCellPreview}
              />
            </div>
          </div>

          {isAttributeMode && (
            <>
              <div className={cx('controls-item')}>
                <p className={cx('control-name')}>{formatMessage(messages.keyTitle)}</p>
                <div className={cx('control-container', 'medium')}>
                  <Input
                    value={attributeKey}
                    placeholder={formatMessage(messages.keyPlaceholder)}
                    onChange={(e) => onChangeAttributeKey(e.target.value)}
                  />
                </div>
              </div>

              <div className={cx('controls-item')}>
                <p className={cx('control-name')}>
                  {formatMessage(messages.highlightLessThanTitle)}
                </p>
                <div className={cx('control-container', 'medium')}>
                  <Input
                    value={highlightLessThan}
                    placeholder={formatMessage(messages.highlightLessThanPlaceholder)}
                    onChange={this.handleHighlightLessThanChange}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}
