/*!
 * Copyright 2024 EPAM Systems
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

import { MeatballMenuIcon, Popover } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { setActiveProjectKeyAction } from 'controllers/user';
import {
  canDeleteProject,
  canInviteUserToProject,
  canRenameProject,
} from 'common/utils/permissions/permissions';
import { userRolesSelector } from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { deleteProjectAction } from 'controllers/organization/projects/actionCreators';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { messages } from '../../messages';
import styles from './projectActionMenu.scss';

const cx = classNames.bind(styles);

export const ProjectActionMenu = ({ details }) => {
  const {
    projectName,
    projectKey,
    projectId,
    projectSlug,
    projectRole,
    organizationSlug,
  } = details;
  const roles = useSelector(userRolesSelector);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const actionsButtons = useMemo(() => {
    const projectUserRoles = { ...roles, projectRole };
    return [
      {
        actionLabel: formatMessage(COMMON_LOCALE_KEYS.RENAME),
        onclick: () => {},
        hasPermission: canRenameProject(projectUserRoles),
      },
      {
        actionLabel: formatMessage(messages.actionInviteUser),
        onclick: () => {},
        hasPermission: canInviteUserToProject(projectUserRoles),
      },
      {
        actionLabel: formatMessage(messages.actionUnassign),
        onclick: () => {},
        hasPermission: true,
      },
      {
        actionLabel: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        onclick: () => {
          dispatch(
            showModalAction({
              id: 'deleteProjectModal',
              data: {
                projectDetails: details,
                onSave: () => {
                  dispatch(deleteProjectAction({ projectName, projectId }));
                },
              },
            }),
          );
        },
        className: cx('delete-button'),
        hasPermission: canDeleteProject(projectUserRoles),
      },
    ];
  }, [roles, projectRole]);

  return (
    <Popover
      placement={'bottom-end'}
      content={
        <div className={cx('action-dropdown')}>
          <Link
            to={{
              type: 'PROJECT_MEMBERS_PAGE',
              payload: { projectSlug, organizationSlug },
            }}
            className={cx('action-item')}
            onClick={() => dispatch(setActiveProjectKeyAction(projectKey))}
          >
            <span>{formatMessage(messages.team)}</span>
          </Link>
          <Link
            to={{
              type: 'PROJECT_SETTINGS_PAGE',
              payload: { projectSlug, organizationSlug },
            }}
            className={cx('action-item')}
            onClick={() => dispatch(setActiveProjectKeyAction(projectKey))}
          >
            <span>{formatMessage(messages.settings)}</span>
          </Link>
          <div className={cx('divider')} />
          {actionsButtons.map(
            (button) =>
              button.hasPermission && (
                <button
                  className={cx('action-item', button.className)}
                  onClick={button.onclick}
                  key={button.actionLabel}
                >
                  {button.actionLabel}
                </button>
              ),
          )}
        </div>
      }
      className={cx('actions-popover')}
    >
      <i className={cx('menu-icon')}>
        <MeatballMenuIcon />
      </i>
    </Popover>
  );
};

ProjectActionMenu.propTypes = {
  details: PropTypes.object,
};
