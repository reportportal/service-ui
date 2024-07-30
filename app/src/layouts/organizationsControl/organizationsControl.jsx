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
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { withPopover } from 'componentLibrary/popover';
import ArrowLeftIcon from './img/arrow-left-inline.svg';
import OpenPopoverIcon from './img/open-popover-inline.svg';
import { OrganizationsPopover } from './organizationsPopover/organizationsPopover';
import styles from './organizationsControl.scss';

const cx = classNames.bind(styles);

export const OrganizationsControl = ({
  isPopoverOpen,
  onClick,
  closeSidebar,
  link,
  titles,
  isExtendedNav,
}) => (
  <div className={cx('organizations-control-wrapper')}>
    <button className={cx('short-title', { 'no-uppercase': isExtendedNav })} onClick={onClick}>
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
              <Link to={link} className={cx('organization-btn')} onClick={closeSidebar}>
                <div className={cx('top-title')}>{titles.topTitle}</div>
              </Link>
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
  </div>
);

OrganizationsControl.propTypes = {
  isPopoverOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  link: PropTypes.object.isRequired,
  titles: PropTypes.object.isRequired,
  isExtendedNav: PropTypes.bool,
};

OrganizationsControl.defaultProps = {
  isExtendedNav: false,
};

export const OrganizationsControlWithPopover = withPopover({
  ContentComponent: OrganizationsPopover,
  side: 'right',
  popoverClassName: cx('popover'),
  popoverWrapperClassName: cx('popover-control'),
  variant: 'dark',
  arrowVerticalPosition: 'vertical-top',
  topPosition: 96,
  tabIndex: 0,
})(OrganizationsControl);
