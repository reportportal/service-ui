import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import className from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import styles from './dashboardGrid.scss';
import { DashboardGridItem } from './dashboardGridItem';
import { DashboardEmptyResults } from '../dashboardEmptyResults';

const cx = className.bind(styles);
const messages = defineMessages({
  myDashboards: {
    id: 'DashboardGrid.myDashboards',
    defaultMessage: 'My Dashboards',
  },
  sharedDashboards: {
    id: 'DashboardGrid.sharedDashboards',
    defaultMessage: 'Shared Dashboards',
  },
});


const DashboardGridList = ({
                             name,
                             dashboardList,
                             userDashboards,
                             onEditItem,
                             onDeleteItem,
                             onAddItem,
                             userInfo: { userId },
}) => (
  <Fragment>
    <h3 className={cx('headline')}> {name} </h3>
    <div className={cx('dashboard-grid-body')}>
      {
        dashboardList.length ?

          dashboardList.map(item => (<DashboardGridItem
            key={item.id}
            item={item}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            currentUser={userId}
          />))
          :
          (<DashboardEmptyResults
            userDashboards={userDashboards}
            action={onAddItem}
          />)
      }
    </div>
  </Fragment>
);

DashboardGridList.propTypes = {
  name: PropTypes.string,
  dashboardList: PropTypes.array,
  userDashboards: PropTypes.bool,
  onEditItem: PropTypes.func,
  onDeleteItem: PropTypes.func,
  onAddItem: PropTypes.func,
  userInfo: PropTypes.object,
};
DashboardGridList.defaultProps = {
  name: '',
  dashboardList: [],
  userDashboards: false,
  onEditItem: () => {},
  onDeleteItem: () => {},
  onAddItem: () => {},
  userInfo: () => {},
};

@injectIntl
export class DashboardGrid extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dashboardItems: PropTypes.array,

  };

  static defaultProps = {
    dashboardItems: [],
  };

  render() {
    const { dashboardItems, intl, ...rest } = this.props;
    const { userInfo: { userId } } = rest;
    const userDashboards = dashboardItems.filter(item => item.owner === userId);
    const sharedDashboards = dashboardItems.filter(item => item.owner !== userId);

    return (
      <Fragment>
        <DashboardGridList
          name={intl.formatMessage(messages.myDashboards)}
          dashboardList={userDashboards}
          userDashboards
          {...rest}
        />
        <DashboardGridList
          name={intl.formatMessage(messages.sharedDashboards)}
          dashboardList={sharedDashboards}
          userDashboards={false}
          {...rest}
        />
      </Fragment>
    );
  }
}
