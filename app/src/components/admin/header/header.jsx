/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */


import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './header.scss';

const cx = classNames.bind(styles);

const AdminHeader = ({ onClickBackToProject, onClickLogout, adminHeaderCrumb }) => {
  return (
    <div className={cx('adminHeader')} >
      <div className={cx('container')}>
        <h3>
          <FormattedMessage
            id={'AdminHeader.header'}
            defaultMessage={'Management board'}
          />
          <span className={cx('header-crumb')}>{adminHeaderCrumb}</span>
        </h3>
        <div className={cx('adminHeaderControls')}>
          <button className={cx('backToProject')} onClick={onClickBackToProject}>
            <FormattedMessage
              id={'AdminHeader.btnToProject'}
              defaultMessage={'Back to project'}
            />
          </button>
          <button className={cx('logout')} onClick={onClickLogout}>
            <FormattedMessage
              id={'AdminHeader.btnLogout'}
              defaultMessage={'Logout'}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

AdminHeader.propTypes = {
  adminHeaderCrumb: PropTypes.string,
  onClickBackToProject: PropTypes.func,
  onClickLogout: PropTypes.func,
};

AdminHeader.defaultProps = {
  adminHeaderCrumb: '',
  onClickBackToProject: () => {},
  onClickLogout: () => {},
};

export default AdminHeader;

