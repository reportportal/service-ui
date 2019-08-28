import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { userInfoSelector, activeProjectRoleSelector } from 'controllers/user';
import { canAddWidget } from 'common/utils/permissions';
import { GhostButton } from 'components/buttons/ghostButton';
import AddDashboardIcon from 'common/img/add-widget-inline.svg';
import styles from './emptyWidgetGrid.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  addNewWidget: {
    id: 'DashboardItemPage.addNewWidget',
    defaultMessage: 'Add new widget',
  },
  dashboardEmptyText: {
    id: 'DashboardItemPage.dashboardEmptyText',
    defaultMessage: 'Add your first widget to analyse statistics',
  },
  notMyDashboardEmptyHeader: {
    id: 'DashboardItemPage.notMyDashboardEmptyHeader',
    defaultMessage: 'There are no widgets on this dashboard',
  },
});

@injectIntl
@connect((state) => ({
  userInfo: userInfoSelector(state),
  projectRole: activeProjectRoleSelector(state),
}))
export class EmptyWidgetGrid extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    action: PropTypes.func,
    isDisable: PropTypes.bool,
    dashboard: PropTypes.object,
    userInfo: PropTypes.object,
    projectRole: PropTypes.string,
  };

  static defaultProps = {
    action: () => {},
    isDisable: false,
    dashboard: {},
    userInfo: {},
    projectRole: '',
  };

  render() {
    const { action, intl, isDisable, dashboard, userInfo, projectRole } = this.props;
    const isAddWidgetEnabled =
      canAddWidget(userInfo.userRole, projectRole, dashboard.owner === userInfo.userId) &&
      !isDisable;

    return (
      <div className={cx('empty-widget')}>
        <div className={cx('empty-dashboard', { 'add-enabled': isAddWidgetEnabled })} />
        <p className={cx('empty-widget-headline')}>
          {intl.formatMessage(messages.notMyDashboardEmptyHeader)}
        </p>
        {isAddWidgetEnabled && (
          <Fragment>
            <p className={cx('empty-widget-text')}>
              {intl.formatMessage(messages.dashboardEmptyText)}
            </p>
            <div className={cx('empty-widget-content')}>
              <GhostButton icon={AddDashboardIcon} onClick={action}>
                {intl.formatMessage(messages.addNewWidget)}
              </GhostButton>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
