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

import React, { Component, Fragment } from 'react';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, FormattedRelativeTime } from 'react-intl';
import PropTypes from 'prop-types';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import RefreshIcon from 'common/img/refresh-icon-inline.svg';
import { getRelativeUnits } from 'common/utils/timeDateUtils';
import { widgetTypesMessages } from 'pages/inside/dashboardItemPage/modals/common/messages';
import {
  widgetModeMessages,
  getWidgetModeByValue,
} from 'pages/inside/dashboardItemPage/modals/common/widgetControls/utils/getWidgetModeOptions';
import { STATE_RENDERING } from 'components/widgets/common/constants';
import { MATERIALIZED_VIEW_WIDGETS } from 'components/widgets';
import { DescriptionTooltipIcon } from './descriptionTooltipIcon';
import styles from './widgetHeader.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  lastRefresh: {
    id: 'WidgetHeader.lastRefresh',
    defaultMessage: 'Updated:',
  },
  forceUpdate: {
    id: 'WidgetHeader.forceUpdate',
    defaultMessage: 'Update',
  },
});

@injectIntl
export class WidgetHeader extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.object,
    onRefresh: PropTypes.func,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onForceUpdate: PropTypes.func,
    customClass: PropTypes.string,
    isPrintMode: PropTypes.bool,
    showDisplayLauncherToggle: PropTypes.bool,
  };
  static defaultProps = {
    data: {},
    onRefresh: () => {},
    onDelete: () => {},
    onEdit: () => {},
    onForceUpdate: () => {},
    customClass: null,
    isPrintMode: false,
    showDisplayLauncherToggle: true,
  };

  renderMetaInfo = () =>
    this.props.data.meta.map((item, index) => {
      const widgetMode = getWidgetModeByValue(item);
      return (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`${widgetMode}_${index}`} className={cx('meta-info')}>
          {widgetModeMessages[widgetMode]
            ? this.props.intl.formatMessage(widgetModeMessages[widgetMode])
            : widgetMode}
        </div>
      );
    });

  render() {
    const {
      intl,
      data,
      onRefresh,
      onDelete,
      onEdit,
      onForceUpdate,
      customClass,
      isPrintMode,
    } = this.props;

    const isForceUpdateAvailable = MATERIALIZED_VIEW_WIDGETS.includes(data.type);
    const isEditControlHidden = isForceUpdateAvailable && data.state === STATE_RENDERING;
    const { value: startTime, unit } = getRelativeUnits(data.lastRefresh);

    return (
      <div className={cx('widget-header')}>
        <div className={cx('info-block')}>
          <div className={cx('widget-name')}>
            <div className={cx('widget-name-block')}>{data.name}</div>
            <div className={cx('icons-block')}>
              {data.description && (
                <div className={cx('icon')}>
                  <DescriptionTooltipIcon tooltipContent={data.description} />
                </div>
              )}
            </div>
          </div>
          <br />
          <div className={cx('widget-type')}>
            <span className={cx('type')}>
              {widgetTypesMessages[data.type]
                ? intl.formatMessage(widgetTypesMessages[data.type])
                : data.type}
            </span>
            {this.renderMetaInfo()}
          </div>
        </div>
        {!isPrintMode && (
          <div className={customClass}>
            <div
              className={cx('controls-block', { 'controls-block-update': isForceUpdateAvailable })}
            >
              {isForceUpdateAvailable && (
                <div className={cx('force-update', 'mobile-hide')}>
                  {data.lastRefresh && (
                    <Fragment>
                      {intl.formatMessage(messages.lastRefresh)}
                      <span className={cx('force-update-time')}>
                        <FormattedRelativeTime value={startTime} unit={unit} numeric="auto" />
                      </span>
                    </Fragment>
                  )}
                  <div className={cx('control', 'force-update-control')} onClick={onForceUpdate}>
                    {Parser(RefreshIcon)}
                    <span className={cx('force-update-label')}>
                      {intl.formatMessage(messages.forceUpdate)}
                    </span>
                  </div>
                </div>
              )}
              {!isEditControlHidden && data.type && (
                <div className={cx('control', 'mobile-hide')} onClick={onEdit}>
                  {Parser(PencilIcon)}
                </div>
              )}
              {!isForceUpdateAvailable && data.type && (
                <div className={cx('control')} onClick={onRefresh}>
                  {Parser(RefreshIcon)}
                </div>
              )}
              <div className={cx('control', 'mobile-hide')} onClick={onDelete}>
                {Parser(CrossIcon)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
