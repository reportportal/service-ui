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
import { canDeleteWidget } from 'common/utils/permissions';
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
    } = this.props;
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
                data.owner === userId && (
                  <div className={cx('icon')} title={intl.formatMessage(messages.widgetIsShared)}>
                    {Parser(ShareIcon)}
                  </div>
                )}
              {data.shared &&
                data.owner !== userId && (
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
              <div className={cx('control', 'mobile-hide')} onClick={onEdit}>
                {data.owner === userId && Parser(PencilIcon)}
              </div>
              <div className={cx('control')} onClick={onRefresh}>
                {Parser(RefreshIcon)}
              </div>
              {canDeleteWidget(userRole, projectRole, userId === data.owner) && (
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
