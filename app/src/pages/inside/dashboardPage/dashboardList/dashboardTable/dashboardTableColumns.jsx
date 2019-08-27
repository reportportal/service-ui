import React from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Icon } from 'components/main/icon';
import { PROJECT_DASHBOARD_ITEM_PAGE } from 'controllers/pages';
import { NavLink } from 'components/main/navLink';
import { canEditDashboard, canDeleteDashboard } from 'common/utils/permissions';
import styles from './dashboardTable.scss';

const cx = classNames.bind(styles);

export const NameColumn = ({ value, customProps: { projectId } }) => {
  const { id: dashboardId, name } = value;
  return (
    <NavLink
      className={cx('name', 'cell')}
      to={{ type: PROJECT_DASHBOARD_ITEM_PAGE, payload: { projectId, dashboardId } }}
    >
      {name}
    </NavLink>
  );
};
NameColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
};
NameColumn.defaultProps = {
  value: {},
  customProps: {},
};

export const DescriptionColumn = ({ value }) => (
  <div className={cx('description', 'cell')}>{value}</div>
);
DescriptionColumn.propTypes = {
  value: PropTypes.string,
};
DescriptionColumn.defaultProps = {
  value: '',
};

export const OwnerColumn = ({ value }) => <div className={cx('owner', 'cell')}>{value}</div>;
OwnerColumn.propTypes = {
  value: PropTypes.string,
};
OwnerColumn.defaultProps = {
  value: '',
};

export const SharedColumn = ({
  value: { share, owner },
  customProps: {
    currentUser: { userId },
  },
}) => {
  const isShared = share || userId !== owner;

  return <div className={cx('shared', 'cell')}>{isShared && <Icon type="icon-check" />}</div>;
};
SharedColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
};
SharedColumn.defaultProps = {
  value: {},
  customProps: {},
};

export const EditColumn = ({ value, customProps }) => {
  const {
    onEdit,
    currentUser: { userId, userRole },
    projectRole,
  } = customProps;
  const { owner } = value;

  const editItemHandler = () => {
    onEdit(value);
  };

  return (
    <div className={cx('cell', 'with-button', 'edit')}>
      <div className={cx('icon-holder')}>
        {canEditDashboard(userRole, projectRole, userId === owner) && (
          <Icon type="icon-pencil" onClick={editItemHandler} />
        )}
      </div>
    </div>
  );
};
EditColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
};
EditColumn.defaultProps = {
  value: {},
  customProps: {},
};

export const DeleteColumn = ({ value, customProps }) => {
  const {
    currentUser: { userId, userRole },
    projectRole,
  } = customProps;
  const { owner } = value;

  const deleteItemHandler = () => {
    customProps.onDelete(value);
  };

  return (
    <div className={cx('cell', 'with-button', 'delete')}>
      <div className={cx('icon-holder')}>
        {canDeleteDashboard(userRole, projectRole, userId === owner) && (
          <Icon type="icon-delete" onClick={deleteItemHandler} />
        )}
      </div>
    </div>
  );
};
DeleteColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
};
DeleteColumn.defaultProps = {
  value: {},
  customProps: {},
};
