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
import { useIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Tooltip } from '@reportportal/ui-kit';
import { NavLink } from 'components/main/navLink';
import { ORGANIZATION_PROJECTS_PAGE } from 'controllers/pages/constants';
import { useTracking } from 'react-tracking';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import ArrowDownIcon from './img/arrow-down-inline.svg';
import ArrowRightIcon from './img/arrow-right-inline.svg';
import OpenIcon from './img/open-inline.svg';
import { ProjectItem } from './projectItem';
import styles from './organizationsItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  open: {
    id: 'OrganizationsItem.open',
    defaultMessage: 'open',
  },
  noProjectAssignments: {
    id: 'OrganizationsItem.noProjectAssignments',
    defaultMessage: 'No project assignments',
  },
});

export function OrganizationsItem({
  organizationName,
  organizationSlug,
  projects,
  isOpen,
  isActive,
  onClick,
  currentProject,
  isAllOpen,
}) {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const [isCollapsed, setIsCollapsed] = useState(isOpen);
  const [isShowOpenButton, setIsShowOpenButton] = useState(false);
  const [isFocusedShowOpenButton, setIsFocusedShowOpenButton] = useState(false);
  const [isFocusedCollapsedButton, setIsFocusedCollapsedButton] = useState(false);
  const organizationItemRef = useRef(null);
  const isDisabled = projects.length === 0;
  const ArrowIcon = isCollapsed && !isDisabled ? ArrowDownIcon : ArrowRightIcon;

  useLayoutEffect(() => {
    if (isActive) {
      organizationItemRef.current.scrollIntoView({ block: 'end' });
    }
  }, [isActive]);

  useEffect(() => {
    setIsCollapsed(isAllOpen);
  }, [isAllOpen]);

  const onShowOpenButton = () => {
    setIsShowOpenButton(true);
  };

  const onHideOpenButton = () => {
    setIsShowOpenButton(false);
  };

  const onFocusOpenButton = () => {
    setIsFocusedShowOpenButton(true);
    onShowOpenButton();
  };

  const onBlurOpenButton = () => {
    setIsFocusedShowOpenButton(false);
    onHideOpenButton();
  };

  const onFocusCollapseButton = () => {
    setIsFocusedCollapsedButton(true);
    onShowOpenButton();
  };

  const onBlurCollapseButton = () => {
    setIsFocusedCollapsedButton(false);
    onHideOpenButton();
  };

  const onClickCollapseButton = () => {
    setIsCollapsed(!isCollapsed);
    setIsFocusedCollapsedButton(false);
  };

  const handleOpenClick = (item) => {
    onClick(item);
    trackEvent(SIDEBAR_EVENTS.CLICK_OPEN_ORGANIZATION_PROJECTS_BTN);
  };

  const getOrganizationItemContentHeader = () => (
    <div className={cx('header-item-wrapper')}>
      <button
        className={cx('collapse-projects', {
          focus: isFocusedCollapsedButton,
          disabled: isDisabled,
        })}
        disabled={isDisabled}
        onClick={onClickCollapseButton}
        onFocus={onFocusCollapseButton}
        onBlur={onBlurCollapseButton}
      >
        {Parser(ArrowIcon)}
        <div className={cx('organization-name', { active: isActive })}>{organizationName}</div>
      </button>
      <NavLink
        to={{
          type: ORGANIZATION_PROJECTS_PAGE,
          payload: { organizationSlug },
        }}
        className={cx('organization-open', {
          displayed: isShowOpenButton || isFocusedCollapsedButton || isFocusedShowOpenButton,
          focus: isFocusedShowOpenButton,
        })}
        onClick={handleOpenClick}
        onFocus={onFocusOpenButton}
        onBlur={onBlurOpenButton}
      >
        <div className={cx('organization-open-text')}>{formatMessage(messages.open)}</div>
        {Parser(OpenIcon)}
      </NavLink>
    </div>
  );

  const tooltipRoot = document.getElementById('tooltip-root');

  return (
    <div ref={organizationItemRef} className={cx('organization-item')}>
      <button
        className={cx('header-item')}
        onMouseEnter={onShowOpenButton}
        onMouseLeave={onHideOpenButton}
        tabIndex={-1}
      >
        {isDisabled ? (
          <Tooltip
            content={
              <div className={cx('no-project-assignments')}>
                {formatMessage(messages.noProjectAssignments)}
              </div>
            }
            tooltipClassName={cx('tooltip')}
            portalRoot={tooltipRoot}
            isFloating={false}
            placement="right"
          >
            {getOrganizationItemContentHeader()}
          </Tooltip>
        ) : (
          getOrganizationItemContentHeader()
        )}
      </button>
      {isCollapsed && (
        <>
          {projects.map(({ projectName, projectSlug, projectKey }) => (
            <ProjectItem
              key={projectKey}
              projectName={projectName}
              projectSlug={projectSlug}
              projectKey={projectKey}
              organizationSlug={organizationSlug}
              onClick={onClick}
              isActive={currentProject === projectSlug}
            />
          ))}
        </>
      )}
    </div>
  );
}

OrganizationsItem.propTypes = {
  organizationName: PropTypes.string.isRequired,
  organizationSlug: PropTypes.string.isRequired,
  projects: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isAllOpen: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  currentProject: PropTypes.string.isRequired,
};
