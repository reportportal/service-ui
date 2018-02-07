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
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './assignedProjectsBlock.scss';
import { BlockContainerBody, BlockContainerHeader } from '../blockContainer';

const cx = classNames.bind(styles);

export const AssignedProjectsBlock = ({ projects }) => (
  <div className={cx('assigned-projects-block')}>
    <BlockContainerHeader>
      <div className={cx('name-col')}>
        <FormattedMessage id={'AssignedProjectsBlock.headerNameCol'} defaultMessage={'Assigned on projects'} />
        {` (${projects.length})`}
      </div>
      <div className={cx('role-col')}>
        <FormattedMessage id={'AssignedProjectsBlock.headerRoleCol'} defaultMessage={'Project role'} />
      </div>
    </BlockContainerHeader>
    <BlockContainerBody>
      {
          projects.map(project => (
            <div key={project.name} className={cx('project-item')}>
              <div className={cx('name-col')}>
                { project.name }
              </div>
              <div className={cx('role-col')}>
                { project.role }
              </div>
            </div>
            ))
        }
    </BlockContainerBody>
  </div>
  );

AssignedProjectsBlock.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object),
};

AssignedProjectsBlock.defaultProps = {
  projects: [],
};
