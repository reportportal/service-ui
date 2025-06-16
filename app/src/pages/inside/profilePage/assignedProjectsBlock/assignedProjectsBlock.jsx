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

import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { availableProjectsSelector } from 'controllers/user';
import { ScrollWrapper } from 'components/main/scrollWrapper/scrollWrapper';
import { BlockContainerBody } from '../blockContainer';
import styles from './assignedProjectsBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  headerNameCol: {
    id: 'AssignedProjectsBlock.headerNameCol',
    defaultMessage: 'Assignments',
  },
  headerRoleCol: {
    id: 'AssignedProjectsBlock.headerRoleCol',
    defaultMessage: 'Role',
  },
  organization: {
    id: 'AssignedProjectsBlock.organization',
    defaultMessage: 'Organization',
  },
});

export function AssignedProjectsBlock() {
  const { formatMessage } = useIntl();
  const availableProjects = useSelector(availableProjectsSelector);

  return (
    <div className={cx('assigned-projects-block')}>
      <div className={cx('assigned-projects-header')}>
        <div className={cx('name-col')}>{formatMessage(messages.headerNameCol)}</div>
        <div className={cx('role-col')}>{formatMessage(messages.headerRoleCol)}</div>
      </div>
      <ScrollWrapper autoHeight autoHeightMax={370}>
        <BlockContainerBody>
          {availableProjects.map(({ organizationName, organizationRole, projects }) => (
            <>
              <div key={organizationName} className={cx('organization-item')}>
                <div className={cx('name-col')}>{organizationName}</div>
                <div className={cx('role')}>
                  <div className={cx('role-description')}>
                    {formatMessage(messages.organization)}
                  </div>
                  <div className={cx('role-col')}>{organizationRole}</div>
                </div>
              </div>
              {projects.map(({ projectKey, projectName, projectRole }) => (
                <div key={projectKey} className={cx('project-item')}>
                  <div className={cx('name-col')}>{projectName}</div>
                  <div className={cx('role-col')}>{projectRole}</div>
                </div>
              ))}
            </>
          ))}
        </BlockContainerBody>
      </ScrollWrapper>
    </div>
  );
}
