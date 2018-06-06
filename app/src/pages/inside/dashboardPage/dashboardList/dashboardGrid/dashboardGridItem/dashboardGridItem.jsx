import React, { Component, Fragment } from 'react';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Icon } from 'components/main/icon';
import { NavLink } from 'react-router-dom';
import { hasPrevilegesForDashboardDeletion } from 'common/utils/validation';
import styles from './dashboardGridItem.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  dashboardIsShared: {
    id: 'DashboardGridItem.dashboardIsShared',
    defaultMessage: 'Dashboard is shared',
  },
  dashboardIsSharedBy: {
    id: 'DashboardGridItem.dashboardIsSharedBy',
    defaultMessage: 'Dashboard is shared by',
  },
});

@injectIntl
export class DashboardGridItem extends Component {
  static calculateGridPreviewBaseOnWidgetId(id) {
    const idChars = id.split('');
    const result = idChars.reduce((memo, char, idx) => memo + id.charCodeAt(idx), 0);

    return result % 14;
  }

  static propTypes = {
    intl: intlShape.isRequired,
    currentUser: PropTypes.object,
    item: PropTypes.object,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
  };

  static defaultProps = {
    action: () => {},
    currentUser: {},
    item: {},
    onEdit: () => {},
    onDelete: () => {},
  };

  editItem = (e) => {
    e.preventDefault();

    const { item, onEdit } = this.props;

    onEdit(item);
  };

  deleteItem = (e) => {
    e.preventDefault();

    const { item, onDelete } = this.props;

    onDelete(item);
  };

  render() {
    const {
      item,
      currentUser: { userId, userRole },
      intl,
    } = this.props;
    const { name, description, owner, share, id } = item;

    return (
      <NavLink strict to={`dashboard/${id}`} className={cx('grid-view')}>
        <div className={cx('grid-view__inner')}>
          <div className={cx('grid-cell', 'name')}>
            <h3 className={cx('dashboard-link')}>{name}</h3>
          </div>
          <div
            className={cx(
              'grid-cell',
              'description',
              'preview',
              `preview-${DashboardGridItem.calculateGridPreviewBaseOnWidgetId(id)}`,
            )}
          >
            <p>{description}</p>
          </div>
          <div className={cx('grid-cell', 'owner')}>{owner}</div>
          <div className={cx('grid-cell', 'shared')}>
            {share && (
              <Fragment>
                <div className={cx('icon-holder')}>
                  <Icon type="icon-tables" />
                </div>
                <span className={cx('shared-text')}>
                  {intl.formatMessage(messages.dashboardIsShared)}
                </span>
              </Fragment>
            )}
            {userId !== owner && (
              <Fragment>
                <div className={cx('icon-holder')}>
                  <Icon type="icon-planet" />
                </div>
                <span className={cx('shared-text')}>
                  {intl.formatMessage(messages.dashboardIsSharedBy)} {owner}
                </span>
              </Fragment>
            )}
          </div>

          {userId === owner && (
            <div className={cx('grid-cell', 'edit')} onClick={this.editItem}>
              <Icon type="icon-pencil" />
            </div>
          )}

          {(userId === owner || hasPrevilegesForDashboardDeletion(userRole)) && (
            <div className={cx('grid-cell', 'delete')} onClick={this.deleteItem}>
              <Icon type="icon-close" />
            </div>
          )}
        </div>
      </NavLink>
    );
  }
}
