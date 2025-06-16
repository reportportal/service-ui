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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useDispatch } from 'react-redux';
import { NavLink } from 'components/main/navLink';
import { PROJECT_PAGE } from 'controllers/pages/constants';
import { setActiveProjectKeyAction } from 'controllers/user';
import { useLayoutEffect, useRef } from 'react';
import styles from './projectItem.scss';

const cx = classNames.bind(styles);

export function ProjectItem({
  organizationSlug,
  projectSlug,
  projectKey,
  projectName,
  onClick,
  isActive,
}) {
  const projectItemRef = useRef(null);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    if (isActive) {
      projectItemRef.current.scrollIntoView({ block: 'end' });
    }
  }, [isActive]);

  const onClickHandler = () => {
    dispatch(setActiveProjectKeyAction(projectKey));
    onClick();
  };

  return (
    <div ref={projectItemRef} className={cx('project-item')}>
      <NavLink
        to={{
          type: PROJECT_PAGE,
          payload: {
            projectSlug,
            organizationSlug,
          },
        }}
        className={cx('project-item-link')}
        activeClassName={cx('active')}
        onClick={onClickHandler}
      >
        <span title={projectName}>{projectName}</span>
      </NavLink>
    </div>
  );
}

ProjectItem.propTypes = {
  projectSlug: PropTypes.string.isRequired,
  organizationSlug: PropTypes.string.isRequired,
  projectKey: PropTypes.string.isRequired,
  projectName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
};
