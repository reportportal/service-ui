import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { NavLink } from 'redux-first-router-link';
import PropTypes from 'prop-types';
import { PROJECT_DASHBOARD_ITEM_PAGE } from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import styles from './dashboardTable.scss';

const cx = classNames.bind(styles);

@connect((state) => ({ projectId: activeProjectSelector(state) }))
export default class DashboardNameColumn extends PureComponent {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    value: PropTypes.object,
  };
  static defaultProps = {
    value: {},
  };

  render() {
    const {
      projectId,
      value: { id: dashboardId, name },
    } = this.props;
    return (
      <NavLink
        className={cx('name', 'cell')}
        to={{ type: PROJECT_DASHBOARD_ITEM_PAGE, payload: { projectId, dashboardId } }}
      >
        {name}
      </NavLink>
    );
  }
}
