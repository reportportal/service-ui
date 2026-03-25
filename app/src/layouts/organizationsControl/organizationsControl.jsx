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

import { Popover } from '@reportportal/ui-kit';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { NavLink } from 'components/main/navLink';
import { useTracking } from 'react-tracking';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import ArrowLeftIcon from './img/arrow-left-inline.svg';
import OpenPopoverIcon from './img/open-popover-inline.svg';
import { OrganizationsPopover } from './organizationsPopover/organizationsPopover';
import styles from './organizationsControl.scss';

const cx = classNames.bind(styles);

export const OrganizationsControl = ({
  link,
  titles,
  isExtendedNav,
  isPopoverOpen,
  closeSidebar,
  onClick,
}) => {
  const { trackEvent } = useTracking();
  return (
    <button className={cx('organizations-control-wrapper')} onClick={onClick} tabIndex={0}>
      <button className={cx('short-title', { 'no-uppercase': !isExtendedNav })}>
        {titles.shortTitle}
      </button>
      <button className={cx('organizations-control')} tabIndex={-1}>
        <div>
          <div
            className={cx('organization-btn-wrapper', {
              'not-extended': !isExtendedNav,
            })}
          >
            {isExtendedNav ? (
              <>
                <i className={cx('arrow-icon')}>{Parser(ArrowLeftIcon)}</i>
                <NavLink
                  to={link}
                  className={cx('organization-btn')}
                  onClick={() => {
                    closeSidebar();
                    trackEvent(SIDEBAR_EVENTS.onClickLevelHigher(titles.level));
                  }}
                >
                  <div className={cx('top-title')}>{titles.topTitle}</div>
                </NavLink>
              </>
            ) : (
              <div className={cx('extended-top-title')}>{titles.topTitle}</div>
            )}
          </div>
          {isExtendedNav ? <div className={cx('bottom-title')}>{titles.bottomTitle}</div> : null}
        </div>
        <i
          className={cx('open-popover', {
            action: isPopoverOpen,
          })}
        >
          {Parser(OpenPopoverIcon)}
        </i>
      </button>
    </button>
  );
};

OrganizationsControl.propTypes = {
  link: PropTypes.object.isRequired,
  titles: PropTypes.object.isRequired,
  isExtendedNav: PropTypes.bool,
  isPopoverOpen: PropTypes.bool.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

OrganizationsControl.defaultProps = {
  isExtendedNav: false,
};

export const OrganizationsControlWithPopover = ({
  link,
  titles,
  isExtendedNav,
  isOpenPopover,
  closeSidebar,
  onClick,
  togglePopover,
}) => {
  const closePopover = () => {
    togglePopover(false);
  };

  return (
    <div className={cx('popover-control')}>
      <Popover
        className={cx('popover')}
        placement="right-start"
        isOpened={isOpenPopover}
        setIsOpened={togglePopover}
        content={<OrganizationsPopover closePopover={closePopover} closeSidebar={closeSidebar} />}
      >
        <OrganizationsControl
          link={link}
          titles={titles}
          isPopoverOpen={isOpenPopover}
          isExtendedNav={isExtendedNav}
          closeSidebar={closeSidebar}
          onClick={onClick}
        />
      </Popover>
    </div>
  );
};

OrganizationsControlWithPopover.propTypes = {
  link: PropTypes.object.isRequired,
  titles: PropTypes.object.isRequired,
  isExtendedNav: PropTypes.bool,
  isOpenPopover: PropTypes.bool.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  togglePopover: PropTypes.func.isRequired,
};
