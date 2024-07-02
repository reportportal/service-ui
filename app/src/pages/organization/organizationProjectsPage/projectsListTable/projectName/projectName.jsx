/*
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

import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Link from 'redux-first-router-link';
import { useDispatch, useSelector } from 'react-redux';
import { ADMIN_PROJECTS_PAGE_EVENTS } from 'components/main/analytics/events';
import { SCREEN_XS_MAX_MEDIA } from 'common/constants/screenSizeVariables';
import { navigateToProjectAction } from 'controllers/organizations/projects';
import { createUserAssignedSelector, setActiveProjectKeyAction } from 'controllers/user';
import { PROJECT_PAGE } from 'controllers/pages';
import styles from './projectName.scss';

const cx = classNames.bind(styles);

export const ProjectName = ({ project, disableAnalytics = false }) => {
  const { projectSlug, organizationSlug, projectName, projectKey } = project;
  const { hasPermission } = useSelector(createUserAssignedSelector(projectSlug, organizationSlug));
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const onProjectClick = (event) => {
    if (!hasPermission && window.matchMedia(SCREEN_XS_MAX_MEDIA).matches) {
      event.preventDefault();
      return;
    }

    dispatch(setActiveProjectKeyAction(projectKey));
    dispatch(navigateToProjectAction({ project }));

    if (!disableAnalytics) {
      trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.PROJECT_NAME);
    }
    event.preventDefault();
  };

  return (
    <Link
      className={cx('name')}
      to={{
        type: PROJECT_PAGE,
        payload: {
          projectSlug,
          organizationSlug,
        },
      }}
      onClick={onProjectClick}
      title={projectName}
    >
      {projectName}
    </Link>
  );
};

ProjectName.propTypes = {
  project: PropTypes.object.isRequired,
  disableAnalytics: PropTypes.bool,
};
