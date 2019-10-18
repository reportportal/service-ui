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
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  userIdSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
} from 'controllers/user';
import { canEditWidget, canDeleteWidget } from 'common/utils/permissions';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import RefreshIcon from 'common/img/refresh-icon-inline.svg';
import GlobeIcon from 'common/img/globe-icon-inline.svg';
import ShareIcon from 'common/img/share-icon-inline.svg';
import { widgetTypesMessages } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import {
  widgetModeMessages,
  getWidgetModeByValue,
} from 'pages/inside/dashboardItemPage/modals/common/widgetControls/utils/getWidgetModeOptions';
import { DescriptionTooltipIcon } from './descriptionTooltipIcon';
import styles from './widgetHeader.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  widgetIsShared: {
    id: 'WidgetHeader.widgetIsShared',
    defaultMessage: 'Your widget is shared',
  },
  sharedWidget: {
    id: 'WidgetHeader.sharedWidget',
    defaultMessage: 'Widget was created by { owner }',
  },
});

@injectIntl
@connect((state) => ({
  userId: userIdSelector(state),
  userRole: userAccountRoleSelector(state),
  projectRole: activeProjectRoleSelector(state),
}))
export class WidgetHeader extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    userId: PropTypes.string.isRequired,
    userRole: PropTypes.string,
    projectRole: PropTypes.string,
    data: PropTypes.object,
    onRefresh: PropTypes.func,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    customClass: PropTypes.string,
    isPrintMode: PropTypes.bool,
    dashboardOwner: PropTypes.string,
  };
  static defaultProps = {
    data: {},
    userRole: '',
    projectRole: '',
    onRefresh: () => {},
    onDelete: () => {},
    onEdit: () => {},
    customClass: null,
    isPrintMode: false,
    dashboardOwner: '',
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
      userId,
      userRole,
      projectRole,
      onRefresh,
      onDelete,
      onEdit,
      customClass,
      isPrintMode,
      dashboardOwner,
    } = this.props;

    const isOwner = data.owner === userId;
    const isDashboardOwner = dashboardOwner === userId;
    const isWidgetDeletable = canDeleteWidget(userRole, projectRole, isOwner || isDashboardOwner);

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
              {data.shared &&
                isOwner && (
                  <div className={cx('icon')} title={intl.formatMessage(messages.widgetIsShared)}>
                    {Parser(ShareIcon)}
                  </div>
                )}
              {data.shared &&
                !isOwner && (
                  <div
                    className={cx('icon')}
                    title={intl.formatMessage(messages.sharedWidget, { owner: data.owner })}
                  >
                    {Parser(GlobeIcon)}
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
            <div className={cx('controls-block')}>
              {canEditWidget(userRole, projectRole, isOwner) && (
                <div className={cx('control', 'mobile-hide')} onClick={onEdit}>
                  {Parser(PencilIcon)}
                </div>
              )}
              <div className={cx('control')} onClick={onRefresh}>
                {Parser(RefreshIcon)}
              </div>
              {isWidgetDeletable && (
                <div className={cx('control', 'mobile-hide')} onClick={onDelete}>
                  {Parser(CrossIcon)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
