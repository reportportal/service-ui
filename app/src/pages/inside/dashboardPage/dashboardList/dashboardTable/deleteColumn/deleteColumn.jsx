import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { activeProjectRoleSelector } from 'controllers/user';
import { canDeleteDashboard } from 'common/utils/permissions';
import { Icon } from 'components/main/icon';
import styles from './deleteColumn.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  projectRole: activeProjectRoleSelector(state),
}))
export class DeleteColumn extends Component {
  static propTypes = {
    value: PropTypes.object,
    customProps: PropTypes.object,
    projectRole: PropTypes.string,
  };
  static defaultProps = {
    value: {},
    customProps: {},
    projectRole: '',
  };
  render = () => {
    const {
      onDelete,
      currentUser: { userId, userRole },
    } = this.props.customProps;
    const { owner } = this.props.value;
    const deleteItemHandler = () => {
      onDelete(this.props.value);
    };

    return (
      <div className={cx('cell', 'with-button', 'delete')}>
        <div className={cx('icon-holder')}>
          {canDeleteDashboard(userRole, this.props.projectRole, userId === owner) && (
            <Icon type="icon-delete" onClick={deleteItemHandler} />
          )}
        </div>
      </div>
    );
  };
}
